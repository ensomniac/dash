function DashGuiChatBoxInput (chat_box, msg_submit_callback, at_combo_options=null, color=null) {
    this.chat_box = chat_box;  // Also acts as binder
    this.msg_submit_callback = msg_submit_callback.bind(this.chat_box);
    this.at_combo_options = at_combo_options;
    this.color = color || Dash.Color.Light;
    
    this.html = null;
    this.input = null;
    this.pen_icon = null;
    this.at_button = null;
    this.submit_button = null;
    this.dark_mode = this.chat_box.dark_mode;
    this.secondary_css_color = this.chat_box.secondary_css_color;

    this.setup_styles = function () {
        var css = {
            "display": "flex",
            "height": Dash.Size.RowHeight,
            "background": "none",
            "flex": "none"  // Don't allow this.html to flex in its parent container
        };

        if (Dash.IsMobile) {
            css["border-top"] = "1px solid " + this.color.Pinstripe;
            css["padding-top"] = Dash.Size.Padding * 0.5;
        }

        this.html = Dash.Gui.GetHTMLContext("", css, this.color);

        this.add_pen_icon();
        this.add_input();

        if (this.at_combo_options) {
            this.add_at_button();
        }

        this.add_submit_button();
    };
    
    this.Text = function () {
        return this.input.Text();
    };

    this.SetText = function (text) {
        return this.input.SetText(text);
    };

    this.Focus = function () {
        this.input.Focus();
    };

    this.add_input = function () {
        this.input = new Dash.Gui.Input("Leave a note...", this.color);

        var padding = Dash.Size.Padding * (Dash.IsMobile ? 0.75 : 0.5);

        var html_css = {
            "box-shadow": this.dark_mode ? "0px 5px 0px -4px rgba(245, 245, 245, 0.4)" : "0px 5px 0px -4px rgba(0, 0, 0, 0.2)",
            "flex-grow": 2,
            "background": "none"
        };

        var input_css = {
            "width": "calc(100% - " + (Dash.Size.Padding + (Dash.IsMobile ? padding : 0)) + "px)",
            "padding-left": padding,
            "padding-right": padding
        };

        if (Dash.IsMobile) {
            html_css["height"] = Dash.Size.RowHeight * 0.75;
            input_css["line-height"] = (Dash.Size.RowHeight * 0.75) + "px";
        }

        this.input.html.css(html_css);

        this.input.input.css(input_css);

        this.input.DisableBlurSubmit();

        if (!Dash.IsMobile) {
            this.input.SetOnSubmit(this.msg_submit_callback, this.chat_box);
        }

        this.input.SetOnChange(this.on_input, this);

        this.html.append(this.input.html);
    };

    this.on_input = function () {
        // Expand the combo if user typed "@", but hide it if they keep typing or backspace
        if (this.Text().endsWith("@")) {
            this.at_button.ShowTray();
        }

        else {
            if (this.input.InFocus()) {
                this.at_button.HideTray();
            }
        }
    };

    this.add_at_button = function () {
        var labels = [];

        for (var option of this.at_combo_options) {
            var label_text = option["label_text"] || option["display_name"];

            if (labels.includes(label_text)) {
                console.error("Error: ChatBox 'at_combo_options' cannot have items with identical 'label_text' values");

                return;
            }

            labels.push(label_text);
        }

        this.at_button = new Dash.Gui.Combo(
            "",
            this.on_combo_changed,
            this,
            this.at_combo_options,
            null,
            this.color,
            {"is_user_list": true}
        );

        this.at_button.UseAsIconButtonCombo(
            "at_sign",
            Dash.IsMobile ? 0.7 : 1,
            Dash.IsMobile ? Dash.Color.Mobile.AccentPrimary : null
        );

        this.at_button.DisableFlash();
        this.at_button.SetListVerticalOffset(-(this.at_button.html.height() + Dash.Size.Padding));

        this.at_button.html.attr("title", "Mention");

        if (Dash.IsMobile) {
            this.at_button.html.css({
                "margin-left": -(Dash.Size.Padding * 0.5),
                "margin-top": -(Dash.Size.Padding * 0.2)
            });
        }

        this.html.append(this.at_button.html);
    };

    this.on_combo_changed = function (selected_combo) {
        var new_text = "";
        var old_text = this.Text();

        if (old_text.endsWith("@")) {
            old_text = old_text.substring(0, old_text.length - 1);
        }

        new_text += old_text;

        if (old_text && old_text.length > 0 && !old_text.endsWith(" ")) {
            new_text += " ";
        }

        new_text += "@" + (selected_combo["label_text"] || selected_combo["display_name"]) + " ";

        this.SetText(new_text);
        this.Focus();
    };

    this.add_submit_button = function () {
        this.submit_button = new Dash.Gui.IconButton(
            "share",
            this.msg_submit_callback,
            this,
            this.color,
            {"size_mult": Dash.IsMobile ? 0.7 : 1}
        );

        var css = {
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding * (Dash.IsMobile ? 0.25 : 1),
            "margin-right": Dash.Size.Padding * 0.3
        };

        if (Dash.IsMobile) {
            css["margin-top"] = -(Dash.Size.Padding * 0.15);

            this.submit_button.SetIconColor(Dash.Color.Mobile.AccentPrimary);
        }

        this.submit_button.html.css(css);

        this.submit_button.SetHoverHint("Submit");

        this.html.append(this.submit_button.html);
    };

    this.add_pen_icon = function () {
        this.pen_icon = new Dash.Gui.Icon(
            this.color,
            "pen",
            null,
            Dash.IsMobile ? 0.65 : 0.9,
            this.secondary_css_color
        );

        var css = {
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.IsMobile ? 0 : Dash.Size.Padding * 0.25,
            "margin-right": Dash.Size.Padding * (Dash.IsMobile ? -0.5 : 0),
            "pointer-events": "none",
            "transform": "scale(-1, 1)"  // Flip the icon horizontally
        };

        if (Dash.IsMobile) {
            css["margin-top"] = -(Dash.Size.Padding * 0.25);
        }

        this.pen_icon.html.css(css);

        this.html.append(this.pen_icon.html);
    };


    this.setup_styles();
}
