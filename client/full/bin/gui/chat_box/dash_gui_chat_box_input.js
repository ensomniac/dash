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
    this.combo_enter_key_event_fired = false;
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

        this.input.html.css({
            "box-shadow": this.dark_mode ? "0px 5px 0px -4px rgba(245, 245, 245, 0.4)" : "0px 5px 0px -4px rgba(0, 0, 0, 0.2)",
            "flex-grow": 2,
            "background": "none"
        });

        this.input.input.css({
            "width": "95%"  // This is kind of hacky, but margin and padding weren't affect this element and it was bleeding outside of its html container
        });

        this.input.DisableBlurSubmit();
        this.input.OnSubmit(this.msg_submit_callback, this.chat_box);
        this.input.OnChange(this.on_input, this);

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

        for (var i in this.at_combo_options) {
            var label_text = this.at_combo_options[i]["label_text"];

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
            this.color
        );

        this.at_button.UseAsIconButtonCombo("at_sign", 1);
        this.at_button.DisableFlash();
        this.at_button.SetListVerticalOffset(-(this.at_button.html.height() + Dash.Size.Padding));

        this.at_button.html.attr("title", "Mention");

        this.html.append(this.at_button.html);
    };

    this.on_combo_changed = function (selected_combo) {
        this.combo_enter_key_event_fired = true;

        var new_text = "";
        var old_text = this.Text();

        if (old_text.endsWith("@")) {
            old_text = old_text.substring(0, old_text.length - 1);
        }

        new_text += old_text;

        if (old_text && old_text.length > 0 && !old_text.endsWith(" ")) {
            new_text += " ";
        }

        new_text += "@" + selected_combo["label_text"] + " ";

        this.SetText(new_text);
        this.Focus();
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

        this.submit_button.SetHoverHint("Submit");

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
