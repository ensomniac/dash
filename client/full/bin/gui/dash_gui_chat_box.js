function DashGuiChatBox (header_text, binder, add_msg_callback, color=Dash.Color.Light, dual_sided=true) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_callback.bind(this.binder);
    this.color = color;
    this.dual_sided = dual_sided;

    this.html = null;
    this.header = null;
    this.message_area = null;
    this.message_input = null;
    this.dark_mode = this.color === Dash.Color.Dark;

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
            this.header = new Dash.Gui.Header(this.header_text, this.color);

            this.html.append(this.header.html);
        }

        return this.header;
    };

    this.AddMessage = function (text, user_email=null, iso_ts=null, align_right=false, fire_callback=false) {
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

        if (!user_email) {
            user_email = Dash.User.Data["email"];
        }

        iso_ts = Dash.ReadableDateTime(iso_ts, false);

        if (fire_callback) {
            this.add_msg_callback(text);
        }

        var message_box = this.get_message_box(text, user_email, iso_ts, align_right);

        this.message_area.append(message_box);

        // If overflow, auto-scroll to bottom
        if (this.message_area[0].offsetHeight < this.message_area[0].scrollHeight) {
            this.ScrollToBottom();
        }

        return message_box;
    };

    this.ScrollToBottom = function () {
        this.message_area[0].scrollTop = this.message_area[0].scrollHeight;
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

    this.get_message_box = function (text, user_email, iso_ts, align_right=false) {
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

        return message_box;
    };

    this.get_iso_ts_label = function (user_email, iso_ts, align_right=false) {
        var iso_ts_label;
        var side_padding = Dash.Size.Padding * 4.9;

        var iso_ts_css = {
            "color": this.dark_mode ? "rgba(245, 245, 245, 0.4)" : "gray",
            "font-family": "sans_serif_italic",
            "background": "none",
            "position": "absolute",
            "top": 0,
            "height": Dash.Size.RowHeight * 0.7,
            "font-size": (Dash.Size.Padding * 1.2) + "px"
        };

        if (align_right) {
            iso_ts_label = Dash.Gui.GetHTMLContext(
                iso_ts + " - " + (Dash.User.GetByEmail(user_email)["first_name"] || ""),
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
                (Dash.User.GetByEmail(user_email)["first_name"] || "") + " - " + iso_ts,
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
        var content_label = Dash.Gui.GetHTMLContext(text, {"background": "none"}, this.color);

        var content_container = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin": 0,
                "padding": 0,
                "margin-top": Dash.Size.RowHeight * 0.7,
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
                "margin-right": Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5),
            });

            content_box.css({
                "border-top-right-radius": Dash.Size.Padding * 0.1,
            });
        }

        else {
            content_container.css({
                "margin-left": Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5)
            });

            content_box.css({
                "border-top-left-radius": Dash.Size.Padding * 0.1
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
            this.dark_mode ? "rgba(245, 245, 245, 0.4)" : "gray"
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
