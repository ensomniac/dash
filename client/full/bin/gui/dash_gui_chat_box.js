function DashGuiChatBox (header_text, binder, add_msg_callback, color=Dash.Color.Light) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_callback.bind(this.binder);
    this.color = color;

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

    this.AddMessage = function (text, user_email=null, timestamp=null, fire_callback=false) {
        if (!text) {
            console.log("ERROR: AddMessage() requires a 'text' param");

            return;
        }

        if (!timestamp) {
            timestamp = new Date().toISOString();
        }

        if (!user_email) {
            user_email = Dash.User.Data["email"];
        }

        timestamp = Dash.ReadableDateTime(timestamp, false);

        if (fire_callback) {
            this.add_msg_callback(text);
        }

        this.message_area.append(this.get_message_box(text, user_email, timestamp));

        // If overflow, auto-scroll to bottom
        if (this.message_area[0].offsetHeight < this.message_area[0].scrollHeight) {
            this.ScrollToBottom();
        }
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

    this.get_message_box = function (text, user_email, timestamp) {
        var message_box = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-top": Dash.Size.Padding * 0.75,
                "padding": 0,
                "display": "flex",
                "background": "none"
            },
            this.color
        );

        var timestamp_label = Dash.Gui.GetHTMLContext(
            (Dash.User.GetByEmail(user_email)["first_name"] || "") + " - " + timestamp,
            {
                "color": this.dark_mode ? "rgba(245, 245, 245, 0.4)" : "gray",
                "font-family": "sans_serif_italic",
                "background": "none",
                "position": "absolute",
                "top": 0,
                "right": 0,
                "text-align": "right",
                "height": Dash.Size.RowHeight * 0.7,
                "font-size": (Dash.Size.Padding * 1.2) + "px"
            },
            this.color
        );

        message_box.append(this.get_user_icon(user_email));
        message_box.append(this.get_message_content_container(text));
        message_box.append(timestamp_label);

        return message_box;
    };

    this.get_message_content_container = function (text) {
        var content_label = Dash.Gui.GetHTMLContext(text, {"background": "none"}, this.color);

        var content_container = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin": 0,
                "padding": 0,
                "margin-left": Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5),
                "margin-top": Dash.Size.RowHeight * 0.7,
                "display": "flex"
            },
            this.color
        );

        var content_box = Dash.Gui.GetHTMLBoxContext(
            {
                "margin": Dash.Size.Padding * 0.2,
                "padding": Dash.Size.Padding,
                "border-radius": Dash.Size.Padding,
                "border-top-left-radius": Dash.Size.Padding * 0.1,
                "box-shadow": this.dark_mode ? "0px 2px 2px 1px rgba(255, 255, 255, 0.2)" : "0px 4px 10px 1px rgba(0, 0, 0, 0.1)",
                "background": this.color.BackgroundRaisedTop || this.color.BackgroundRaised,
                "display": "flex"
            },
            this.color
        );

        content_box.append(content_label);

        content_container.append(content_box);

        return content_container;
    };

    this.get_user_icon = function (user_email) {
        var user_icon = $("<div></div>");
        var user_icon_size = Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.25);
        var img = Dash.User.GetImageByEmail(user_email);

        user_icon.css({
            "position": "absolute",
            "left": 0,
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

        return user_icon;
    };

    this.add_message = function () {
        this.AddMessage(this.message_input.Text(), null, null, true);

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
