function DashGuiChatBox (header_text, binder, add_msg_cb, del_msg_cb, mention_cb, at_combo_options, color=null, dual_sided=true) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_cb.bind(this.binder);
    this.del_msg_callback = del_msg_cb.bind(this.binder);
    this.mention_callback = mention_cb.bind(this.binder);
    this.at_combo_options = at_combo_options;
    this.color = color || Dash.Color.Light;
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
    this.secondary_css_color = this.dark_mode ? "rgba(245, 245, 245, 0.4)" : "gray";

    // TODO: This element is set up to work as a vertical, column-style box. It may not work in a
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

    this.AddMessage = function (text, user_email=null, iso_ts=null, align_right=false, fire_callback=false, delete_button=false, id=null, track_mentions=false) {
        text = text.trim();

        if (!text || text.length < 1) {
            if (user_email || iso_ts) {
                console.log("ERROR: AddMessage() requires a 'text' param");
            }

            return;
        }

        if (align_right && !this.dual_sided) {
            console.log(
                "WARNING: ChatBox.dual_sided has been changed to 'true' to accommodate " +
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

        var message = new Dash.Gui.ChatBox.Message(
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
            this.add_msg_callback(text, message.ID());
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
            console.log("WARNING: Toggle button already added to ChatBox, can't add another at this time.");

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
            "Activity",                     // Label text
            this,                           // Binder
            this.on_checkbox_toggled,       // Callback
            this.toggle_local_storage_key,  // Local storage key
            default_state,                  // Default state
            true,                           // Label first
            include_border,                 // Include border
            this.color                      // Color
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

        for (var i in this.callback_mentions) {
            var mention = this.callback_mentions[i];

            for (var x in this.at_combo_options) {
                var name = this.message_input.FormatMentionName(this.at_combo_options[x]["label_text"]);

                if (name === mention) {
                    ids.push(this.at_combo_options[x]["id"]);

                    break;
                }
            }
        }

        this.mention_callback(ids, text, message_obj.ID(), message_obj.IsoTimestamp());
    };

    this.bold_mentions = function (text, track=false) {
        if (!text.includes("@")) {
            return text;
        }

        var new_text = "";
        var text_split = [...text];
        var bold_open = false;

        for (var i in text_split) {
            i = parseInt(i);
            var char = text_split[i];

            if (char === "@" && text_split[i + 1] !== " ") {
                var mention = "";

                for (var x = i + 1; x < text_split.length; x++) {
                    if (text_split[x] === " ") {
                        break;
                    }

                    mention += text_split[x];
                }

                if (this.valid_mentions.includes(mention)) {
                    char = "<b style='color: " + this.color.AccentGood + "'>@";
                    bold_open = true;

                    if (track && !this.callback_mentions.includes(mention)) {
                        this.callback_mentions.push(mention);
                    }
                }
            }

            else if (bold_open && char === " ") {
                char = "</b> ";
                bold_open = false;
            }

            new_text += char;
        }

        if (bold_open) {
            new_text += "</b>";
        }

        return new_text;
    };

    this.set_valid_mentions = function () {
        if (!this.at_combo_options) {
            return;
        }

        this.valid_mentions = [];

        for (var i in this.at_combo_options) {
            this.valid_mentions.push(this.at_combo_options[i]["label_text"]);
        }
    };

    this.on_checkbox_toggled = function () {
        this.message_area.empty();

        for (var i in this.messages) {
            var message = this.messages[i];

            if (this.check_to_show_message(message.RightAligned())) {
                this.message_area.append(message.html);

                if (message.delete_button) {
                    message.delete_button.RefreshConnections();
                }
            }
        }

        this.scroll_to_bottom_on_overflow();
    };

    this.check_to_show_message = function (align_right) {
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
                "margin-bottom": Dash.Size.Padding * 3,
                "margin-left": Dash.Size.Padding * 0.25,
                "height": Dash.Size.RowHeight
            },
            this.color
        );

        this.header = new Dash.Gui.Header(this.header_text, this.color);

        this.header.html.css({
            "position": "absolute",
            "top": 0,
            "left": 0
        });

        this.header_area.append(this.header.html);

        this.html.append(this.header_area);
    };

    // If overflow, auto-scroll to bottom
    this.scroll_to_bottom_on_overflow = function () {
        if (this.message_area[0].offsetHeight < this.message_area[0].scrollHeight) {
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
                "margin-top": Dash.Size.Padding * 0.25,
                "margin-bottom": Dash.Size.Padding * 2,
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

        this.del_msg_callback(message);
    };

    this.add_message = function () {
        this.AddMessage(
            this.message_input.Text(),
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
        this.message_input = new Dash.Gui.ChatBox.Input(
            this,
            this.add_message,
            this.at_combo_options,
            this.color
        );

        this.html.append(this.message_input.html);
    };

    this.setup_styles();
}