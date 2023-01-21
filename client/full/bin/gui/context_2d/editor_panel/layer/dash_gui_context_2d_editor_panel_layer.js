function DashGuiContext2DEditorPanelLayer (layers, index) {
    this.layers = layers;
    this.index = index;

    this.input = null;
    this.selected = false;
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.editor = this.layers.editor;
    this.can_edit = this.layers.can_edit;
    this.height = Dash.Size.ButtonHeight * 1.5;

    this.setup_styles = function () {
        this.html.css({
            "padding": Dash.Size.Padding * 0.5,
            "height": this.height
        });

        this.add_input();
    };

    this.IsSelected = function () {
        return this.selected;
    };

    this.GetIndex = function () {
        return this.index;
    };

    this.InputInFocus = function () {
        return this.input.InFocus();
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        this.html.css({
            "background": ""
        });

        this.selected = false;
    };

    this.Select = function () {
        if (this.selected) {
            return;
        }

        this.layers.DeselectLayers();

        this.html.css({
            "background": this.color.AccentGood
        });

        this.editor.SetCanvasActiveLayer(this.index);

        if (this.layers.initialized) {
            this.editor.AddToLog("Selected layer: " + this.input.Text().trim() || this.get_data()["display_name"] || (this.index + 1));
        }

        this.selected = true;
    };

    // TODO: restyle the row? Other than that, nothing else needs to happen within this object
    this.ToggleHidden = function (hidden) {
        if (hidden) {

        }

        else {

        }
    };

    // TODO: restyle the row? Other than that, nothing else needs to happen within this object
    this.ToggleLocked = function (locked) {
        if (locked) {

        }

        else {

        }
    };

    this.add_input = function () {
        this.input = new Dash.Gui.Input("New Layer", this.color);

        this.input.html.css({
            "background": "none",
            "margin-top": (this.height * 0.5) - (Dash.Size.RowHeight * 0.5)
        });

        // TODO: add event (if not exists in interface already) to set background color to
        //  white/etc when input receives focus, and back to none when it loses focus

        var value = this.get_data()["display_name"];

        if (value) {
            this.input.SetText(value);
        }

        if (this.can_edit) {
            this.input.SetOnSubmit(this.on_input_submit, this);
            this.input.SetOnAutosave(this.on_input_submit, this);
        }

        else {
            this.input.SetLocked(true);
        }

        this.html.append(this.input.html);
    };

    this.on_input_submit = function () {
        this.layers.set_data("display_name", this.input.Text().trim(), this.index);
    };

    this.get_data = function () {
        return this.layers.get_data()[this.index] || {};
    };

    this.setup_styles();
}
