// This element is set up to work as a vertical, column-style box. It may not work in a
// horizontal, row-style placement and may need alternate styling options for that type of use.
function DashGuiChatBox (
    binder, header_text="Messages", add_msg_cb=null, del_msg_cb=null, mention_cb=null,
    at_combo_options=[], color=null, dual_sided=true, tab_config=[], tab_change_cb=null
) {
    this.binder = binder;
    this.header_text = header_text;
    this.add_msg_callback = binder && add_msg_cb ? add_msg_cb.bind(binder) : add_msg_cb;
    this.del_msg_callback = binder && del_msg_cb ? del_msg_cb.bind(binder) : del_msg_cb;
    this.mention_callback = binder && mention_cb ? mention_cb.bind(binder) : mention_cb;
    this.at_combo_options = at_combo_options;  // When mobile, this expects the mobile combo options structure
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Dark);
    this.dual_sided = dual_sided;
    this.tab_config = tab_config;  // Use this to separate messages into tabs by `type`
    this.tab_change_cb = binder && tab_change_cb ? tab_change_cb.bind(binder) : tab_change_cb;

    this.tabs = Dash.Validate.Object(this.tab_config) ? {} : null;

    this.html = null;
    this.header = null;
    this.held_messages = {};  // When using tabs, messages that are added when its respective tab isn't active
    this.header_area = null;
    this.message_area = null;
    this.active_tab_key = "";
    this.tabs_scroll_pos = {};  // When using tabs, remember the scroll position when switching tabs
    this.message_input = null;
    this.valid_mentions = null;
    this.callback_mentions = [];
    this.toggle_hide_side = null;
    this.toggle_hide_button = null;
    this.secondary_css_color = null;
    this.messages = this.tabs ? {} : [];
    this.toggle_local_storage_key = null;
    this.tabs_messages_key = "conversation";
    this.tab_color_active = this.color.AccentGood;
    this.dark_mode = Dash.Color.IsDark(this.color);
    this.tab_color_inactive = this.color.BackgroundRaised;
    this.tab_color_hover = Dash.Color.Lighten(this.tab_color_inactive, 30);
    this.read_only = !this.add_msg_callback && !this.del_msg_callback && !this.mention_callback;

    this.tab_text_shadow = this.tabs ? (
        "0px 0px 1px " + (Dash.Color.IsLightColor(this.tab_color_active) ? "black" : "white")
    ) : "";

    if (this.tabs) {
        if (this.header_text === "none") {
            Dash.Log.Error("Error: `header_text` cannot be 'none' when using tabs");

            return;
        }

        if (this.header_text) {
            this.header_text = "";

            Dash.Log.Warn("Warning: `header_text` is ignored when using tabs");
        }
    }

    this.setup_styles = function () {
        if (this.dark_mode) {
            this.secondary_css_color = Dash.Color.Darken(this.color.Text, 90);
        }

        else {
            this.secondary_css_color = Dash.Color.Lighten(this.color.Text, 90);
        }

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
        this.add_header_area();
        this.add_message_area();
        this.add_message_input();
    };

    this.SetHeaderText = function (label_text="Messages") {
        if (this.tabs) {
            Dash.Log.Warn("Warning: SetHeaderText() is not supported when using tabs");

            return;
        }

        this.header_text = label_text;

        if (this.header) {
            this.header.SetText(this.header_text);
        }

        else {
            this.add_header_area();
        }

        return this.header;
    };

    this.SetHeaderIcon = function (icon_name="comments_square") {
        if (!icon_name) {
            return;
        }

        if (!this.header) {
            this.add_header_area();
        }

        this.header.ReplaceBorderWithIcon(icon_name);

        return this;
    };

    this.AddMessage = function (
        text, user_email=null, iso_ts=null, align_right=false, fire_callback=false,
        delete_button=false, id=null, track_mentions=false, tab_key="", _held=false
    ) {
        if (this.tabs) {
            if (!tab_key) {
                Dash.Log.Error("Error: AddMessage() requires a 'tab_key' param when using tabs");

                return null;
            }

            if (tab_key !== this.active_tab_key) {
                if (!this.held_messages[tab_key]) {
                    this.held_messages[tab_key] = [];
                }

                this.held_messages[tab_key].push([
                    text, user_email, iso_ts, align_right,
                    fire_callback, delete_button, id, track_mentions, tab_key
                ]);

                return null;  // TODO?
            }

            if (!this.messages[tab_key]) {
                this.messages[tab_key] = [];
            }

            if (!_held) {
                this.add_held_messages(tab_key);
            }
        }

        text = text.trim();

        if (!text || text.length < 1) {
            if (user_email || iso_ts) {
                console.error("Error: AddMessage() requires a 'text' param");
            }

            return;
        }

        if (align_right && !this.dual_sided) {
            Dash.Log.Warn(
                  "Warning: ChatBox.dual_sided has been changed to 'true' to accommodate "
                + "an AddMessage() call with the 'align_right' param set to 'true'"
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
            (this.tabs ? this.messages[tab_key] : this.messages).length,
            this.color,
            id,
            tab_key
        );

        if (fire_callback) {
            if (this.add_msg_callback) {
                this.add_msg_callback(text, message.ID(), user_email, tab_key);
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

        (this.tabs ? this.messages[tab_key] : this.messages).push(message);

        return message;
    };

    this.ScrollToBottom = function () {
        Dash.Gui.ScrollToBottom(this.message_area);

        return this;
    };

    this.ClearMessages = function () {
        this.message_area.empty();

        return this;
    };

    this.AddToggleHideButton = function (
        local_storage_key, default_state=true, toggle_right_side=true, include_border=false
    ) {
        if (this.toggle_hide_button) {
            Dash.Log.Warn("Warning: Toggle button already added to ChatBox, can't add another at this time");

            return this;
        }

        if (this.tabs) {
            Dash.Log.Warn("Warning: Toggle button is not supported when using tabs");

            return this;
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

        this.toggle_hide_button.label.label.css({
            "font-family": "sans_serif_bold"
        });

        if (!this.header_area) {
            this.add_header_area();
        }

        this.header_area.append(Dash.Gui.GetFlexSpacer());
        this.header_area.append(this.toggle_hide_button.html);

        return this;
    };

    this.on_tab_change = function (tab_key) {
        this.tabs_scroll_pos[this.active_tab_key] = this.message_area.scrollTop();

        this.active_tab_key = tab_key;

        for (var key in this.tabs) {
            this.change_tab_state(key);
        }

        this.ClearMessages();

        if (Dash.Validate.Object(this.messages[tab_key])) {
            for (var message of this.messages[tab_key]) {
                this.message_area.append(message.html);
            }
        }

        this.add_held_messages(tab_key);

        if (this.tab_change_cb) {
            this.tab_change_cb(tab_key);
        }

        if (this.tabs_scroll_pos[tab_key]) {
            this.message_area.scrollTop(this.tabs_scroll_pos[tab_key]);
        }
    };

    this.add_held_messages = function (tab_key) {
        if (!Dash.Validate.Object(this.held_messages[tab_key])) {
            return;
        }

        for (var msg of this.held_messages[tab_key]) {
            this.AddMessage(...msg, true);
        }

        delete this.held_messages[tab_key];
    };

    this.handle_mentions = function (text, message_obj) {
        if (this.callback_mentions.length < 1) {
            return;
        }

        var option;
        var ids = [];

        for (var mention of this.callback_mentions) {
            if (Dash.IsMobile) {
                for (option in this.at_combo_options) {
                    if (this.at_combo_options[option] === mention) {
                        if (!(ids.includes(option))) {
                            ids.push(option);
                        }

                        break;
                    }
                }
            }

            else {
                for (option of this.at_combo_options) {
                    if ((option["label_text"] || option["display_name"]) === mention) {
                        if (!(ids.includes(option["id"]))) {
                            ids.push(option["id"]);
                        }

                        break;
                    }
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

        if (Dash.Validate.Object(this.valid_mentions)) {
            for (var label_text of this.valid_mentions) {
                text = this.process_mention(label_text, text, track);
            }
        }

        return text;
    };

    this.process_mention = function (label_text, text, track=false) {
        var label_text_lower = label_text.toLowerCase();
        var color = Dash.IsMobile ? Dash.Color.Mobile.AccentPrimary : this.color.AccentGood;

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
            "<b style='color: " + color + "'>@" + label_text + "</b>"
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

        if (Dash.IsMobile) {
            for (var option in this.at_combo_options) {
                this.valid_mentions.push(this.at_combo_options[option]);
            }
        }

        else {
            for (var combo_option of this.at_combo_options) {
                this.valid_mentions.push(combo_option["label_text"] || combo_option["display_name"]);
            }
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
        if (this.header_text === "none") {
            return;
        }

        this.header_area = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-bottom": Dash.Size.Padding,
                "margin-left": Dash.Size.Padding * 0.25,
                "flex": "none",
                "gap": Dash.Size.Padding * 0.5,
                "display": "flex"
            },
            this.color
        );

        this.header = new Dash.Gui.Header(this.header_text, this.color);

        this.header.ReplaceBorderWithIcon(
            "comments_square",
            undefined,
            undefined,
            this.tabs ? Dash.Size.ButtonHeight : undefined,
            this.tabs ? 0.7 : undefined
        );

        this.header_area.append(this.header.html);

        this.html.append(this.header_area);

        if (this.tabs) {
            this.add_tabs();
        }
    };

    this.add_tabs = function () {
        this.header.label.remove();

        this.header.label = null;

        var starting_key = "";
        var container = $("<div>");

        container.css({
            "display": "flex",
            "margin-left": Dash.Size.Padding * 0.5
        });

        for (var i in this.tab_config) {
            var config = this.tab_config[i];

            if (config["starting_tab"]) {
                starting_key = config["key"];
            }

            this.tabs[config["key"]] = this.get_tab(config, parseInt(i));

            container.append(this.tabs[config["key"]]);
        }

        if (!starting_key) {
            starting_key = this.tab_config[0]["key"];
        }

        this.active_tab_key = starting_key;

        this.change_tab_state(starting_key);

        this.header_area.append(container);
    };

    this.get_tab = function (config, num) {
        var css = {
            "flex": "none",
            "padding": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "background": this.tab_color_inactive,
            "cursor": "pointer",
            "border": "1px solid " + this.color.PinstripeDark
        };

        if (num === 0) {
            css["border-top-left-radius"] = Dash.Size.BorderRadius;
            css["border-bottom-left-radius"] = Dash.Size.BorderRadius;
        }

        else if (num === this.tab_config.length - 1) {
            css["border-top-right-radius"] = Dash.Size.BorderRadius;
            css["border-bottom-right-radius"] = Dash.Size.BorderRadius;
        }

        var tab = Dash.Gui.GetHTMLContext(
            config["display_name"] || config["key"].Title(),
            css,
            this.color
        );

        tab.on("click", () => {
            if (config["key"] === this.active_tab_key) {
                return;
            }

            this.on_tab_change(config["key"]);
        });

        tab.on("mouseenter", () => {
            if (config["key"] === this.active_tab_key) {
                return;
            }

            tab.css({
                "background": this.tab_color_hover
            });
        });

        tab.on("mouseleave", () => {
            if (config["key"] === this.active_tab_key) {
                return;
            }

            tab.css({
                "background": this.tab_color_inactive
            });
        });

        return tab;
    };

    this.change_tab_state = function (tab_key) {
        var active = tab_key === this.active_tab_key;

        this.tabs[tab_key].css({
            "background": active ? this.tab_color_active : this.tab_color_inactive,
            "font-family": active ? "sans_serif_bold" : "sans_serif_normal",
            "text-shadow": active ? this.tab_text_shadow : "none",
            "cursor": active ? "default" : "pointer"
        });
    };

    this.scroll_to_bottom_on_overflow = function () {
        if (Dash.Gui.HasOverflow(this.message_area)) {
            this.ScrollToBottom();
        }
    };

    this.add_message_area = function () {
        var css = {
            "padding": 0,
            "padding-right": Dash.Size.Padding * (Dash.IsMobile ? 0.6 : 0.5),  // Room for scroll bar
            "box-shadow": "none",
            "border": "none",
            "background": "none",
            "flex-grow": 2,
            "flex-shrink": 2,
            "margin-top": Dash.Size.Padding * (Dash.IsMobile ? -0.5 : 1),
            "margin-bottom": (this.read_only || Dash.IsMobile) ? 0 : Dash.Size.Padding * 2,
            "overflow-y": "auto"
        };

        if (Dash.IsMobile) {
            css["border-radius"] = 0;
            css["padding-left"] = Dash.Size.Padding * 0.6;
            css["margin-left"] = -(Dash.Size.Padding * 0.5);
            css["margin-right"] = -(Dash.Size.Padding * 0.5);
            css["padding-bottom"] = Dash.Size.Padding * 0.5;
        }

        this.message_area = Dash.Gui.GetHTMLBoxContext(css, this.color);

        this.html.append(this.message_area);
    };

    this.delete_message = function (message) {
        (this.tabs ? this.messages[message.tab_key] : this.messages).Pop(message.Index());

        // Update indexes of remaining messages
        for (var i in (this.tabs ? this.messages[message.tab_key] : this.messages)) {
            var msg = (this.tabs ? this.messages[message.tab_key] : this.messages)[i];

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
            setTimeout(
                () => {
                    this.add_message_from_input();
                },
                100
            );

            return;
        }

        if (!Dash.IsMobile && this.message_input.at_button.enter_key_event_fired) {
            this.message_input.at_button.enter_key_event_fired = false;

            return;
        }

        this.AddMessage(
            text,
            null,
            null,
            Dash.IsMobile,  // Align right on mobile, left on desktop
            true,
            true,
            null,
            true,
            this.tabs_messages_key
        );

        this.message_input.SetText("");

        this.callback_mentions = [];
    };

    this.add_message_input = function () {
        if (this.read_only) {
            return;
        }

        if (this.tabs) {
            var keys = [];

            for (var config of this.tab_config) {
                keys.push(config["key"]);
            }

            if (!(keys.includes(this.tabs_messages_key))) {
                return;
            }
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
