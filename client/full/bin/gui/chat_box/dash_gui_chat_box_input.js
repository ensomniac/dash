function DashGuiChatBoxInput (chat_box, msg_submit_callback, at_combo_options=null, color=Dash.Color.Light) {
    this.chat_box = chat_box;  // Also acts as binder
    this.msg_submit_callback = msg_submit_callback.bind(this.chat_box);
    this.at_combo_options = at_combo_options;
    this.color = color;
    
    this.html = null;
    this.input = null;
    this.pen_icon = null;
    this.at_button = null;
    this.combo_skirt = null;
    this.submit_button = null;
    this.dark_mode = this.chat_box.dark_mode;
    this.secondary_css_color = this.chat_box.secondary_css_color;

    this.setup_styles = function () {
        this.html = Dash.Gui.GetHTMLContext(
            "",
            {
                "display": "flex",
                "height": Dash.Size.RowHeight,
                "background": "none"
            },
            this.color
        );

        this.add_pen_icon();
        this.add_input();

        if (this.at_combo_options) {
            // this.add_at_button();
        }

        this.add_submit_button();
    };
    
    this.Text = function () {
        return this.input.Text();
    };

    this.SetText = function () {
        return this.input.SetText();
    };

    this.add_input = function () {
        this.input = new Dash.Gui.Input("Leave a note...", this.color);

        this.input.html.css({
            "box-shadow": this.dark_mode ? "0px 5px 0px -4px rgba(245, 245, 245, 0.4)" : "0px 5px 0px -4px rgba(0, 0, 0, 0.2)",
            "flex-grow": 2,
            "background": "none"
        });

        this.input.input.css({
            "flex-grow": 2
        });

        this.input.OnSubmit(this.msg_submit_callback, this.chat_box);

        this.html.append(this.input.html);
    };

    this.add_at_button = function () {
        this.at_button = new Dash.Gui.Combo(
            "",
            this.on_combo_changed,
            this,
            this.at_combo_options,
            null,
            this.color
        );

        this.at_button.UseAsIconButtonCombo("at_sign", 1);

        this.html.append(this.at_button.html);
    };

    this.on_combo_changed = function (combo_key, selection) {
        console.log("TEST", combo_key, selection);
    };

    this.add_submit_button = function () {
        this.submit_button = new Dash.Gui.IconButton(
            "share",
            this.msg_submit_callback,
            this,
            this.color
        );

        this.submit_button.html.css({
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding,
            "margin-right": Dash.Size.Padding * 0.3
        });

        this.html.append(this.submit_button.html);
    };

    this.add_pen_icon = function () {
        this.pen_icon = new Dash.Gui.Icon(
            this.color,
            "pen",
            null,
            0.9,
            this.secondary_css_color
        );

        this.pen_icon.html.css({
            "height": Dash.Size.RowHeight,
            "margin-left": Dash.Size.Padding * 0.25,
            "margin-right": 0,
            "pointer-events": "none",
            "transform": "scale(-1, 1)"  // Flip the icon horizontally
        });

        this.html.append(this.pen_icon.html);
    };


    this.setup_styles();
}
