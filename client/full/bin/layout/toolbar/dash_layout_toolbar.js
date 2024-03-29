function DashLayoutToolbar (binder, color=null) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.objects = [];
    this.stroke_height = 1;
    this.stroke_sep_removed = false;
    this.html = Dash.Gui.GetHTMLContext();
    this.allow_padding_refactoring = true;
    this.refactor_itom_padding_requested = false;
    this.stroke_sep = Dash.Gui.GetHTMLAbsContext();
    this.height = Dash.Size.ButtonHeight + this.stroke_height;

    DashLayoutToolbarInterface.call(this);

    this.setup_styles = function () {
        this.html.css({
            "background": Dash.Color.Lighten(this.color.Background, 7),
            "height": this.height, // +1 for the bottom stroke
            "padding-right": Dash.Size.Padding * 0.5,
            "display": "flex",
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.stroke_sep.css({
            "background": this.color.Pinstripe,
            "top": "auto",
            "height": this.stroke_height
        });

        this.html.append(this.stroke_sep);
    };

    this.on_input_changed = function (obj_index) {
        var obj = this.objects[obj_index];

        obj["callback"](obj["html"].Text(), obj["html"]);
    };

    this.on_input_submitted = function (obj_index, from_autosave=false, from_blur=false, from_enter=false) {
        var obj = this.objects[obj_index];

        if (obj["on_enter_include_source_bools"]) {
            obj["on_enter"](obj["html"].Text(), obj["html"], obj["additional_data"], from_autosave, from_blur, from_enter);
        }

        else {
            obj["on_enter"](obj["html"].Text(), obj["html"], obj["additional_data"]);
        }
    };

    this.on_input_autosaved = function (obj_index) {
        var obj = this.objects[obj_index];

        obj["on_autosave"](obj["html"].Text(), obj["html"], obj["additional_data"]);
    };

    this.on_button_clicked = function (obj_index, data=null) {
        var obj = this.objects[obj_index];

        obj["callback"](obj["html"], data, this);
    };

    this.on_combo_updated = function (callback, selected_id, previous_selected_option, additional_data) {
        if (callback) {
            callback(selected_id, previous_selected_option, this, additional_data);
        }

        else {
            Dash.Log.Warn("Warning: No on_combo_updated() callback >> selected_option: " + selected_id);
        }
    };

    this.refactor_item_padding = function () {
        // refactor padding, but do it on the next frame since
        // the most likely time to do this happens after packing
        // a bunch of elements in the initialization of the Toolbar

        if (!this.allow_padding_refactoring || this.refactor_itom_padding_requested) {
            return;
        }

        this.refactor_itom_padding_requested = true;

        (function (self) {
            requestAnimationFrame(function () {
                self._refactor_item_padding();
            });
        })(this);
    };

    // Never call this directly. Instead, use this.refactor_item_padding()
    this._refactor_item_padding = function () {
        if (!this.refactor_itom_padding_requested) {
            return;
        }

        this.refactor_itom_padding_requested = false;

        for (var i = 0; i < this.objects.length; i++) {
            var html = this.objects[i]["html_elem"];

            if (i === (this.objects.length - 1)) {
                // This is the last element, and it gets no right-margin
                //since the toolbar itself has a margin built in to the left and right
                html.css({"margin-right": 0, "margin-left": 0});
            }

            else {
                html.css({"margin-right": Dash.Size.Padding * 0.5, "margin-left": 0});
            }
        }
    };

    this.setup_styles();
}
