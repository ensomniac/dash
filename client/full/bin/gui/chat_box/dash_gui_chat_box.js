function DashGuiChatBox (binder, header_text="Messages", add_msg_cb=null, del_msg_cb=null, mention_cb=null, at_combo_options=[], color=null, dual_sided=true) {
    this.binder = binder;
    this.header_text = header_text;
    this.add_msg_callback = binder && add_msg_cb ? add_msg_cb.bind(binder) : add_msg_cb;
    this.del_msg_callback = binder && del_msg_cb ? del_msg_cb.bind(binder) : del_msg_cb;
    this.mention_callback = binder && mention_cb ? mention_cb.bind(binder) : mention_cb;
    this.at_combo_options = at_combo_options;
    this.color = color || Dash.Color.Dark;
    this.dual_sided = dual_sided;

    this.html = null;
    this.messages = [];
    this.header = null;
    this.header_area = null;
    this.message_area = null;
    this.message_input = null;
    this.valid_mentions = null;
    this.callback_mentions = [];
    this.toggle_hide_side = null;
    this.toggle_hide_button = null;
    this.toggle_local_storage_key = null;
    this.dark_mode = this.color === Dash.Color.Dark;
    this.read_only = !this.add_msg_callback && !this.del_msg_callback && !this.mention_callback;

    if (this.color === Dash.Color.Light) {
        this.secondary_css_color = Dash.Color.Lighten(this.color.Text, 90);
    }

    else if (this.dark_mode) {
        this.secondary_css_color = Dash.Color.Darken(this.color.Text, 90);
    }

    // This element is set up to work as a vertical, column-style box. It may not work in a
    //  horizontal, row-style placement and may need alternate styling options for that type of use.

    this.setup_styles = function () {
        this.html = Dash.Gui.GetHTMLBoxContext(
            {
                "background": this.color.Background,
                "display": "flex",
                "flex-direction": "column",
                "overflow": "hidden"
            },
            this.color
        );

        this.set_valid_mentions();
        this.SetHeaderText();
        this.add_message_area();
        this.add_message_input();
    };

    this.SetHeaderText = function (label_text) {
        if (label_text) {
            this.header_text = label_text;
        }

        if (this.header) {
            this.header.SetText(this.header_text);
        }

        else {
            this.add_header_area();
        }

        return this.header;
    };

    // If it needs to be different than the default, which is "comments_square"
    this.SetHeaderIcon = function (icon_name) {
        if (!icon_name) {
            return;
        }

        this.header.ReplaceBorderWithIcon(icon_name);
    };

    this.AddMessage = function (text, user_email=null, iso_ts=null, align_right=false, fire_callback=false, delete_button=false, id=null, track_mentions=false) {
        text = text.trim();

        if (!text || text.length < 1) {
            if (user_email || iso_ts) {
                console.error("Error: AddMessage() requires a 'text' param");
            }

            return;
        }

        if (align_right && !this.dual_sided) {
            console.log(
                "Warning: ChatBox.dual_sided has been changed to 'true' to accommodate " +
                "an AddMessage() call with the 'align_right' param set to 'true'"
            );

            this.dual_sided = true;
        }

        if (!iso_ts) {
            iso_ts = new Date().toISOString();
        }

        if (!user_email && fire_callback) {
            user_email = Dash.User.Data["email"];
        }

        var message = new DashGuiChatBoxMessage(
            this,
            this.bold_mentions(text, track_mentions),
            user_email,
            iso_ts,
            align_right,
            delete_button,
            this.messages.length,
            this.color,
            id
        );

        if (fire_callback) {
            if (this.add_msg_callback) {
                this.add_msg_callback(text, message.ID(), user_email);
            }

            this.handle_mentions(text, message);
        }

        if (this.dual_sided) {
            var side_margin = Dash.Size.Padding * 4.2;

            if (align_right) {
                message.html.css({
                    "margin-left": side_margin
                });
            }

            else {
                message.html.css({
                    "margin-right": side_margin
                });
            }
        }

        if (this.check_to_show_message(align_right)) {
            this.message_area.append(message.html);
        }

        this.scroll_to_bottom_on_overflow();

        this.messages.push(message);

        return message;
    };

    this.ScrollToBottom = function () {
        this.message_area[0].scrollTop = this.message_area[0].scrollHeight;
    };

    this.ClearMessages = function () {
        this.message_area.empty();
    };

    this.AddToggleHideButton = function (local_storage_key, default_state=true, toggle_right_side=true, include_border=false) {
        if (this.toggle_hide_button) {
            console.warn("Warning: Toggle button already added to ChatBox, can't add another at this time.");

            return;
        }

        this.toggle_local_storage_key = local_storage_key;

        if (toggle_right_side) {
            this.toggle_hide_side = "right";
        }

        else {
            this.toggle_hide_side = "left";
        }


        this.toggle_hide_button = new Dash.Gui.Checkbox(
            this.toggle_local_storage_key,  // Local storage key
            default_state,                  // Default state
            this.color,                     // Color
            "Toggle Activity Feed",         // Hover hint text
            this,                           // Binder
            this.on_checkbox_toggled,       // Callback
            "Activity",                     // Label text
            true,                           // Label first
            include_border                  // Include border
        );

        this.toggle_hide_button.html.css({
            "position": "absolute",
            "top": 0,
            "right": 0
        });

        this.toggle_hide_button.label.label.css({
            "font-family": "sans_serif_bold"
        });

        this.header_area.append(this.toggle_hide_button.html);
    };

    this.handle_mentions = function (text, message_obj) {
        if (this.callback_mentions.length < 1) {
            return;
        }

        var ids = [];

        for (var mention of this.callback_mentions) {
            for (var combo_option of this.at_combo_options) {
                var name = combo_option["label_text"];

                if (name === mention) {
                    ids.push(combo_option["id"]);

                    break;
                }
            }
        }

        if (this.mention_callback) {
            this.mention_callback(ids, text, message_obj.ID(), message_obj.IsoTimestamp(), message_obj.UserEmail());
        }
    };

    this.bold_mentions = function (text, track=false) {
        if (!text.includes("@")) {
            return text;
        }

        for (var label_text of this.valid_mentions) {
            text = this.process_mention(label_text, text, track);
        }

        return text;
    };

    this.process_mention = function (label_text, text, track=false) {
        var label_text_lower = label_text.toLowerCase();

        if (!text.includes("@" + label_text) && !text.includes("@" + label_text_lower)) {
            if (!label_text.includes(" ")) {
                return text;
            }

            var first = label_text.split(" ")[0];
            var first_lower = first.toLowerCase();

            if (!text.includes("@" + first) && !text.includes("@" + first_lower)) {
                return text;
            }

            var occurrences = 0;

            for (var label of this.valid_mentions) {
                if (label.startsWith(first)) {
                    occurrences += 1;
                }
            }

            if (occurrences !== 1) {
                return text;
            }

            text = text.replaceAll(
                text.includes("@" + first) ? "@" + first : "@" + first_lower,
                "@" + label_text
            );
        }

        text = text.replaceAll(
            text.includes("@" + label_text) ? "@" + label_text : "@" + label_text_lower,
            "<b style='color: " + this.color.AccentGood + "'>@" + label_text + "</b>"
        );

        if (track && !this.callback_mentions.includes(label_text)) {
            this.callback_mentions.push(label_text);
        }

        return text;
    };

    this.set_valid_mentions = function () {
        if (!Dash.Validate.Object(this.at_combo_options)) {
            return;
        }

        this.valid_mentions = [];

        for (var combo_option of this.at_combo_options) {
            this.valid_mentions.push(combo_option["label_text"]);
        }
    };

    this.on_checkbox_toggled = function () {
        this.message_area.empty();

        for (var message of this.messages) {
            if (!this.check_to_show_message(message.RightAligned())) {
                continue;
            }

            this.message_area.append(message.html);

            if (!message.delete_button) {
                continue;
            }

            message.delete_button.RefreshConnections();
        }

        this.scroll_to_bottom_on_overflow();
    };

    this.check_to_show_message = function (align_right) {
        if (!this.toggle_hide_button) {
            return true;
        }

        if (this.toggle_hide_button.IsChecked()) {
            return true;
        }

        else {
            if (this.toggle_hide_side === "right" && !align_right) {
                return true;
            }

            if (this.toggle_hide_side === "left" && align_right) {
                return true;
            }
        }

        return false;
    };

    this.add_header_area = function () {
        this.header_area = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-bottom": Dash.Size.Padding,
                "margin-left": Dash.Size.Padding * 0.25,
                "height": Dash.Size.RowHeight,
                "flex": "none"
            },
            this.color
        );

        this.header = new Dash.Gui.Header(this.header_text, this.color);

        this.header.html.css({
            "position": "absolute",
            "top": 0,
            "left": 0
        });

        this.header.ReplaceBorderWithIcon("comments_square");

        this.header_area.append(this.header.html);

        this.html.append(this.header_area);
    };

    this.scroll_to_bottom_on_overflow = function () {
        if (Dash.Gui.HasOverflow(this.message_area)) {
            this.ScrollToBottom();
        }
    };

    this.add_message_area = function () {
        this.message_area = Dash.Gui.GetHTMLBoxContext(
            {
                "padding": 0,
                "padding-right": Dash.Size.Padding * 0.5,  // Room for scroll bar
                "box-shadow": "none",
                "background": "none",
                "flex-grow": 2,
                "flex-shrink": 2,
                "margin-top": Dash.Size.Padding,
                "margin-bottom": this.read_only ? 0 : Dash.Size.Padding * 2,
                "overflow-y": "auto"
            },
            this.color
        );

        this.html.append(this.message_area);
    };

    this.delete_message = function (message) {
        this.messages.splice(message.Index(), 1);

        // Update indexes of remaining messages
        for (var i in this.messages) {
            var msg = this.messages[i];

            if (msg.Index() !== i) {
                msg.SetIndex(i);
            }
        }

        if (this.del_msg_callback) {
            this.del_msg_callback(message);
        }
    };

    this.add_message_from_input = function () {
        if (!this.message_input) {
            return;
        }

        var text = this.message_input.Text();

        // Wait for the user to make a mention selection or finish typing it out
        if (text.endsWith("@")) {
            (function (self) {
                setTimeout(
                    function () {
                        self.add_message_from_input();
                    },
                    100
                );
            })(this);

            return;
        }

        if (this.message_input.at_button.enter_key_event_fired) {
            this.message_input.at_button.enter_key_event_fired = false;

            return;
        }

        this.AddMessage(
            text,
            null,
            null,
            false,
            true,
            true,
            null,
            true
        );

        this.message_input.SetText("");
        this.callback_mentions = [];
    };

    this.add_message_input = function () {
        if (this.read_only) {
            return;
        }

        this.message_input = new DashGuiChatBoxInput(
            this,
            this.add_message_from_input,
            this.at_combo_options,
            this.color
        );

        this.html.append(this.message_input.html);
    };

    this.setup_styles();
}
