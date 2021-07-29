function DashGuiChatBox (header_text, binder, add_msg_callback, color=Dash.Color.Light) {
    this.header_text = header_text;
    this.binder = binder;
    this.add_msg_callback = add_msg_callback.bind(this.binder);
    this.color = color;

    this.header = null;
    this.html = Dash.Gui.GetHTMLBoxContext();
    this.message_area = null;
    this.message_input = null;

    this.setup_styles = function () {
        this.SetHeaderText();

        this.message_area = Dash.Gui.GetHTMLBoxContext({
            "padding": 0,
            "box-shadow": "none"
        });

        this.html.append(this.message_area);

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
    };

    this.get_message_box = function (text, user_email, timestamp) {
        var message_box = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-top": Dash.Size.Padding * 0.5,
                "padding": 0,
                "display": "flex"
            }
        );

        var content_label = Dash.Gui.GetHTMLContext(text, {"background": "none"});

        var content_container = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin": 0,
                "padding": 0,
                "margin-left": Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5),
                "margin-right": Dash.Size.ColumnWidth + (Dash.Size.Padding * 0.5),
                "top": 0,
                "height": "100%",
                "display": "flex"
            }
        );

        var content_box = Dash.Gui.GetHTMLBoxContext({
            "margin": Dash.Size.Padding * 0.2,
            "padding": Dash.Size.Padding,
            "border-radius": Dash.Size.Padding,
            "border-top-left-radius": Dash.Size.Padding * 0.1,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.1)",
            "background": this.color.BackgroundRaisedTop || this.color.BackgroundRaised,
            "display": "flex"
        });

        var timestamp_label = Dash.Gui.GetHTMLContext(
            timestamp,
            {
                "color": "gray",
                "font-family": "sans_serif_italic",
                "background": "none",
                "position": "absolute",
                "top": Dash.Size.Padding * 1.1,
                "right": 0,
                "text-align": "right",
                "width": Dash.Size.ColumnWidth
            }
        );

        content_box.append(content_label);

        content_container.append(content_box);

        message_box.append(this.get_user_icon(user_email));
        message_box.append(content_container);
        message_box.append(timestamp_label);

        return message_box;
    };

    this.get_user_icon = function (user_email) {
        var user_icon = $("<div></div>");
        var user_icon_size = Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.25);
        var img = Dash.User.GetImage(user_email);

        user_icon.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
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
        var message_input_row = Dash.Gui.GetHTMLContext("", {"display": "flex", "height": Dash.Size.RowHeight});
        var pen_icon = new Dash.Gui.Icon(this.color, "pen", null, 0.9, "gray");

        pen_icon.html.css({
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding * 1.85,
            "margin-right": 0,
            "pointer-events": "none",
            "transform": "scale(-1, 1)"  // Flip the icon horizontally
        });

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

        this.message_input = new Dash.Gui.Input("Leave a new note...", this.color);

        this.message_input.html.css({
            "box-shadow": "0px 5px 0px -4px rgba(0, 0, 0, 0.2)",
            "flex-grow": 2
        });

        this.message_input.OnSubmit(this.add_message, this);

        message_input_row.append(pen_icon.html);
        message_input_row.append(this.message_input.html);
        message_input_row.append(send_button.html);

        this.html.append(message_input_row);
    };

    this.setup_styles();
}
