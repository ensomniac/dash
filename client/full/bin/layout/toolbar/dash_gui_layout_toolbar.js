function DashGuiLayoutToolbar (binder, color) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.objects = [];
    this.html = new Dash.Gui.GetHTMLContext();
    this.stroke_sep = new Dash.Gui.GetHTMLAbsContext();

    DashGuiLayoutToolbarInterface.call(this);

    this.setup_styles = function () {
        this.html.css({
            "background": this.color.Background,
            "height": Dash.Size.ButtonHeight + 1, // +1 for the bottom stroke
            "padding-right": Dash.Size.Padding  *0.5,
            "display": "flex",
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.stroke_sep.css({
            "background": this.color.AccentGood,
            "top": "auto",
            "height": 1
        });

        this.html.append(this.stroke_sep);
    };

    this.on_combo_updated = function (callback, selected_id, previous_selected_option, additional_data) {
        if (callback) {
            callback(selected_id, previous_selected_option, this, additional_data);
        }

        else {
            console.warn("Warning: No on_combo_updated() callback >> selected_option: " + selected_id);
        }
    };

    this.on_input_changed = function (obj_index) {
        var obj = this.objects[obj_index];

        obj["callback"](obj["html"].Text(), obj["html"]);
    };

    this.on_input_submitted = function (obj_index) {
        var obj = this.objects[obj_index];

        obj["on_enter_callback"](obj["html"].Text(), obj["html"], obj["additional_data"]);
    };

    this.on_button_clicked = function (obj_index, data=null) {
        var obj = this.objects[obj_index];

        obj["callback"](obj["html"], data, this);
    };

    this.setup_styles();
}
