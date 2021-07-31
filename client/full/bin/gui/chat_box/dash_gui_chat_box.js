function DashGuiChatBox (header_text, binder, add_msg_callback, color=Dash.Color.Light, dual_sided=true) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_callback.bind(this.binder);
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
    this.iso_label_height = Dash.Size.RowHeight * 0.7;
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

    // TODO: Abstract the concept of a message to its own class so we can have easily update the elements
    //  within it, such as the text, which currently is not easy to access because of all the wrappers
    this.AddMessage = function (text, user_email=null, iso_ts=null, align_right=false, fire_callback=false, delete_button=false) {
        if (!text) {
            console.log("ERROR: AddMessage() requires a 'text' param");

            return;
        }

        if (align_right && !this.dual_sided) {
            console.log("WARNING: ChatBox.dual_sided has been changed to 'true' to accommodate an AddMessage() call with the 'align_right' param set to 'true'");

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

        var message_box = this.get_message_box(text, user_email, iso_ts, align_right, delete_button);

        if (this.check_to_show_message(align_right)) {
            this.message_area.append(message_box);
        }

        this.scroll_to_bottom_on_overflow();

        this.messages.push({"message_box": message_box, "align_right": align_right});

        return message_box;
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

            if (this.check_to_show_message(message["align_right"])) {
                this.message_area.append(message["message_box"]);
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

    this.get_message_box = function (text, user_email, iso_ts, align_right=false, delete_button=false) {
        var side_margin = Dash.Size.Padding * 4.2;

        var message_box = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-top": Dash.Size.Padding,
                "padding": 0,
                "display": "flex",
                "background": "none"
            },
            this.color
        );

        if (align_right) {
            message_box.css({
                "flex-direction": "row-reverse",
                "margin-left": side_margin
            });

            if (this.dual_sided) {
                message_box.css({
                    "margin-left": side_margin
                });
            }
        }

        else {
            if (this.dual_sided) {
                message_box.css({
                    "margin-right": side_margin
                });
            }
        }

        message_box.append(this.get_user_icon(user_email, align_right));
        message_box.append(this.get_message_content_container(text, align_right));
        message_box.append(this.get_iso_ts_label(user_email, iso_ts, align_right));

        // if (delete_button) {
        //     message_box.append(this.get_delete_button(align_right).html);
        // }

        return message_box;
    };

    this.get_delete_button = function (align_right=false) {
        var height = this.iso_label_height;
        var side_padding = Dash.Size.Padding * 3.2;

        var icon_button = new Dash.Gui.IconButton(
            this.dark_mode ? "trash_solid" : "trash",
            this.delete_message,
            this,
            this.color,
            {"container_size": height, "size_mult": 0.75}
        );

        icon_button.html.css({
            "position": "absolute",
            "top": 0,
            "height": height
        });

        icon_button.icon.icon_html.css({
            "color": this.secondary_css_color
        });

        if (align_right) {
            icon_button.html.css({
                "right": side_padding
            });
        }

        else {
            icon_button.html.css({
                "left": side_padding
            });
        }

        return icon_button;
    };

    this.delete_message = function (c, a, b) {
        // TODO

        if (!window.confirm("Are you sure you want to delete this message? This cannot be undone.")) {
            return;
        }

        console.log("TEST delete message", c, a, b);
    };

    this.get_iso_ts_label = function (user_email, iso_ts, align_right=false) {
        var iso_ts_label;
        var side_padding = Dash.Size.Padding * 4.9;
        var user = Dash.User.GetByEmail(user_email);
        var name = user ? user["first_name"] : "Unknown";

        var iso_ts_css = {
            "color": this.secondary_css_color,
            "font-family": "sans_serif_italic",
            "background": "none",
            "position": "absolute",
            "top": 0,
            "height": this.iso_label_height,
            "font-size": (Dash.Size.Padding * 1.2) + "px"
        };

        if (align_right) {
            iso_ts_label = Dash.Gui.GetHTMLContext(
                iso_ts + " - " + name,
                {
                    ...iso_ts_css,
                    "right": side_padding,
                    "text-align": "right",
                },
                this.color
            );
        }

        else {
            iso_ts_label = Dash.Gui.GetHTMLContext(
                name + " - " + iso_ts,
                {
                    ...iso_ts_css,
                    "left": side_padding,
                    "text-align": "left",
                },
                this.color
            );
        }

        return iso_ts_label;
    };

    this.get_message_content_container = function (text, align_right=false) {
        var corner_radius = Dash.Size.Padding * 0.05;
        var side_margin = Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5);
        var content_label = Dash.Gui.GetHTMLContext(text, {"background": "none"}, this.color);

        var content_container = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin": 0,
                "padding": 0,
                "margin-top": this.iso_label_height,
                "display": "flex",
                "background": "none"
            },
            this.color
        );

        var content_box = Dash.Gui.GetHTMLBoxContext(
            {
                "margin": Dash.Size.Padding * 0.2,
                "padding": Dash.Size.Padding,
                "border-radius": Dash.Size.Padding,
                "box-shadow": this.dark_mode ? "0px 2px 2px 1px rgba(255, 255, 255, 0.2)" : "0px 4px 10px 1px rgba(0, 0, 0, 0.1)",
                "background": this.color.BackgroundRaisedTop || this.color.BackgroundRaised,
                "display": "flex"
            },
            this.color
        );

        if (align_right) {
            content_container.css({
                "margin-right": side_margin
            });

            content_box.css({
                "border-top-right-radius": corner_radius
            });
        }

        else {
            content_container.css({
                "margin-left": side_margin
            });

            content_box.css({
                "border-top-left-radius": corner_radius
            });
        }

        content_box.append(content_label);

        content_container.append(content_box);

        return content_container;
    };

    this.get_user_icon = function (user_email, align_right=false) {
        var user_icon = $("<div></div>");
        var user_icon_size = Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.25);
        var img = Dash.User.GetImageByEmail(user_email);

        user_icon.css({
            "position": "absolute",
            "top": Dash.Size.RowHeight * 0.65,
            "width": user_icon_size,
            "height": user_icon_size,
            "margin": Dash.Size.Padding * 0.25,
            "padding": 0,
            "border-radius": user_icon_size * 0.75,
            "border": (Dash.Size.Stroke * 0.75) + "px solid " + this.color.Button.Background.Base,
            "background-image": "url(" + img["thumb_url"] + ")",
            "background-size": "cover"
        });

        if (align_right) {
            user_icon.css({
                "right": 0
            });
        }

        else {
            user_icon.css({
                "left": 0
            });
        }

        return user_icon;
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
