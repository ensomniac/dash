function DashGuiChatBoxMessage (chat_box, text, user_email, iso_ts, align_right=false, include_delete_button=false, index=0, color=Dash.Color.Light, id=null) {
    this.chat_box = chat_box;
    this.text = text;
    this.user_email = user_email;
    this.iso_ts = iso_ts;
    this.align_right = align_right;
    this.include_delete_button = include_delete_button;
    this.index = index;
    this.color = color;
    this.id = id;

    this.html = null;
    this.user_icon = null;
    this.text_label = null;
    this.text_bubble = null;
    this.iso_ts_label = null;
    this.delete_button = null;
    this.text_bubble_container = null;
    this.dark_mode = this.chat_box.dark_mode;
    this.iso_label_height = Dash.Size.RowHeight * 0.7;
    this.secondary_css_color = this.chat_box.secondary_css_color;

    this.setup_styles = function () {
        this.html = Dash.Gui.GetHTMLContext(
            "",
            {
                "margin-top": Dash.Size.Padding,
                "padding": 0,
                "display": "flex",
                "background": "none"
            },
            this.color
        );

        if (this.align_right) {
            this.html.css({
                "flex-direction": "row-reverse"
            });
        }

        this.add_user_icon();
        this.add_text_bubble_container();
        this.add_iso_ts_label();

        if (this.include_delete_button) {
            this.add_delete_button();
        }
    };

    this.RightAligned = function () {
        return this.align_right;
    };

    this.Index = function () {
        return this.index;
    };

    this.Text = function () {
        return this.text;
    };

    this.ID = function () {
        return this.id;
    };

    this.SetIndex = function (index) {
        index = parseInt(index);
        
        if (!Number.isInteger(index)) {
            console.log("ERROR: SetIndex() requires an integer:", index, typeof index);

            return;
        }

        this.index = index;
    };

    this.SetText = function (text) {
        if (typeof text !== "string") {
            console.log("ERROR: SetText() requires a string");

            return;
        }

        this.text = text;

        this.text_label.text(this.text);
    };

    this.add_user_icon = function () {
        this.user_icon = $("<div></div>");
        
        var icon_size = Dash.Size.ButtonHeight + (Dash.Size.Padding * 0.25);
        var img = Dash.User.GetImageByEmail(user_email);

        this.user_icon.css({
            "position": "absolute",
            "top": Dash.Size.RowHeight * 0.65,
            "width": icon_size,
            "height": icon_size,
            "margin": Dash.Size.Padding * 0.25,
            "padding": 0,
            "border-radius": icon_size * 0.75,
            "border": (Dash.Size.Stroke * 0.75) + "px solid " + this.color.Button.Background.Base,
            "background-image": "url(" + img["thumb_url"] + ")",
            "background-size": "cover"
        });

        if (this.align_right) {
            this.user_icon.css({
                "right": 0
            });
        }

        else {
            this.user_icon.css({
                "left": 0
            });
        }
        
        this.html.append(this.user_icon);
    };

    this.add_text_bubble_container = function () {
        var corner_radius = Dash.Size.Padding * 0.05;
        var side_margin = Dash.Size.ButtonHeight + (Dash.Size.Padding * 1.5);

        this.text_label = Dash.Gui.GetHTMLContext(this.text, {"background": "none"}, this.color);

        this.text_bubble_container = Dash.Gui.GetHTMLContext(
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

        this.text_bubble = Dash.Gui.GetHTMLBoxContext(
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

        if (this.align_right) {
            this.text_bubble_container.css({
                "margin-right": side_margin
            });

            this.text_bubble.css({
                "border-top-right-radius": corner_radius
            });
        }

        else {
            this.text_bubble_container.css({
                "margin-left": side_margin
            });

            this.text_bubble.css({
                "border-top-left-radius": corner_radius
            });
        }

        this.text_bubble.append(this.text_label);

        this.text_bubble_container.append(this.text_bubble);
        
        this.html.append(this.text_bubble_container);
    };

    this.add_iso_ts_label = function () {
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

        if (this.align_right) {
            this.iso_ts_label = Dash.Gui.GetHTMLContext(
                this.iso_ts + " - " + name,
                {
                    ...iso_ts_css,
                    "right": side_padding,
                    "text-align": "right",
                },
                this.color
            );
        }

        else {
            this.iso_ts_label = Dash.Gui.GetHTMLContext(
                name + " - " + this.iso_ts,
                {
                    ...iso_ts_css,
                    "left": side_padding,
                    "text-align": "left",
                },
                this.color
            );
        }

        this.html.append(this.iso_ts_label);
    };

    this.add_delete_button = function () {
        var side_padding = Dash.Size.Padding * 3.2;

        this.delete_button = new Dash.Gui.IconButton(
            this.dark_mode ? "trash_solid" : "trash",
            this.delete,
            this,
            this.color,
            {"container_size": this.iso_label_height, "size_mult": 0.75}
        );

        this.delete_button.html.css({
            "position": "absolute",
            "top": 0,
            "height": this.iso_label_height
        });

        this.delete_button.icon.icon_html.css({
            "color": this.secondary_css_color
        });

        if (this.align_right) {
            this.delete_button.html.css({
                "right": side_padding
            });
        }

        else {
            this.delete_button.html.css({
                "left": side_padding
            });
        }

        this.html.append(this.delete_button.html);
    };

    this.delete = function () {
        if (!window.confirm("Are you sure you want to delete this message? This cannot be undone.")) {
            return;
        }

        this.chat_box.delete_message(this);

        this.html.remove();
    };

    this.setup_styles();
}
