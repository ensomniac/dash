function DashGuiChatBox (header_text, binder, add_msg_callback, del_msg_callback, color=Dash.Color.Light, dual_sided=true) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_callback.bind(this.binder);
    this.del_msg_callback = del_msg_callback.bind(this.binder);
    this.color = color;
    this.dual_sided = dual_sided;

    this.html = null;
    this.messages = [];
    this.header = null;
    this.header_area = null;
    this.message_area = null;
    this.message_input = null;
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
                "flex-direction": "column"
            },
            this.color
        );

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

    this.AddMessage = function (text, user_email=null, iso_ts=null, align_right=false, fire_callback=false, delete_button=false, id=null) {
        if (!text) {
            console.log("ERROR: AddMessage() requires a 'text' param");

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

        if (Dash.IsServerIsoDate(iso_ts)) {
            iso_ts = Dash.ReadableDateTime(iso_ts, false);
        }

        if (fire_callback) {
            this.add_msg_callback(text);
        }

        var message = new Dash.Gui.ChatBox.Message(
            this,
            text,
            user_email,
            iso_ts,
            align_right,
            delete_button,
            this.messages.length,
            this.color,
            id
        );

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
            this.on_button_toggled,         // Callback
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

    this.on_button_toggled = function () {
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
        this.AddMessage(this.message_input.Text(), null, null, false, true);

        this.message_input.SetText("");
    };

    this.add_message_input = function () {
        var message_input_row = Dash.Gui.GetHTMLContext(
            "",
            {
                "display": "flex",
                "height": Dash.Size.RowHeight
            },
            this.color
        );

        message_input_row.css({
            "background": "none"
        });

        var pen_icon = this.get_pen_icon();
        var send_button = this.get_send_button();

        this.message_input = new Dash.Gui.Input("Leave a note...", this.color);

        this.message_input.html.css({
            "box-shadow": this.dark_mode ? "0px 5px 0px -4px rgba(245, 245, 245, 0.4)" : "0px 5px 0px -4px rgba(0, 0, 0, 0.2)",
            "flex-grow": 2,
            "background": "none"
        });

        this.message_input.input.css({
            "flex-grow": 2
        });

        if (this.dark_mode) {
            Dash.Color.SetPlaceholderColor(this.message_input.input, "red");
        }

        this.message_input.OnSubmit(this.add_message, this);

        message_input_row.append(pen_icon.html);
        message_input_row.append(this.message_input.html);
        message_input_row.append(send_button.html);

        this.html.append(message_input_row);
    };

    this.get_send_button = function () {
        var send_button = new Dash.Gui.IconButton(
            "share",
            this.add_message,
            this,
            this.color
        );

        send_button.html.css({
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding,
            "margin-right": Dash.Size.Padding * 0.3
        });

        return send_button;
    };

    this.get_pen_icon = function () {
        var pen_icon = new Dash.Gui.Icon(
            this.color,
            "pen",
            null,
            0.9,
            this.secondary_css_color
        );

        pen_icon.html.css({
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding * 0.25,
            "margin-right": 0,
            "pointer-events": "none",
            "transform": "scale(-1, 1)"  // Flip the icon horizontally
        });

        return pen_icon;
    };

    this.setup_styles();
}
