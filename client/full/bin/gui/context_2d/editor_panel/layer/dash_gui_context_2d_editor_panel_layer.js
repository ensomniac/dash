function DashGuiContext2DEditorPanelLayer (layers, index) {
    this.layers = layers;
    this.index = index;

    this.input = null;
    this.selected = false;
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.editor = this.layers.editor;
    this.can_edit = this.layers.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "padding": Dash.Size.Padding,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        this.add_input();
        this.RefreshConnections();
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
            "background": "",
            "cursor": "pointer"
        });

        this.selected = false;
    };

    this.Select = function () {
        if (this.selected) {
            return;
        }

        this.layers.DeselectLayers();

        this.html.css({
            "background": this.color.PinstripeDark,
            "cursor": "auto"
        });

        this.editor.SetCanvasActiveLayer(this.index);

        if (this.layers.initialized) {
            this.editor.AddToLog("Selected layer: " + this.get_display_name);
        }

        this.selected = true;
    };

    // TODO: restyle the row? Other than that, nothing else needs to happen within this object
    this.ToggleHidden = function (hidden) {
        if (hidden) {

        }

        else {

        }

        if (this.layers.initialized) {
            this.editor.AddToLog("Layer " + (hidden ? "hidden" : "shown") + ": " + this.get_display_name);
        }
    };

    // TODO: restyle the row? Other than that, nothing else needs to happen within this object
    this.ToggleLocked = function (locked) {
        if (locked) {

        }

        else {

        }

        if (this.layers.initialized) {
            this.editor.AddToLog("Layer " + (locked ? "locked" : "unlocked") + ": " + this.get_display_name);
        }
    };

    this.RefreshConnections = function () {
        (function (self) {
            self.html.on("click", function (e) {
                console.debug("TEST index", self.index);
                self.Select();

                e.stopPropagation();
            });
        })(this);
    };

    this.get_display_name = function () {
        return (this.input.Text().trim() || this.get_data()["display_name"] || "New Layer");
    };

    this.add_input = function () {
        this.input = new Dash.Gui.Input("New Layer", this.color);

        this.input.html.css({
            "width": Dash.Size.ColumnWidth * 1.25,  // Allow some extra space to easily select the row, as well as add other elements later
            "box-shadow": "none",
            "border": "1px solid " + this.color.PinstripeDark
        });

        this.input.input.css({
            "width": "calc(100% - " + Dash.Size.Padding + "px)"
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
