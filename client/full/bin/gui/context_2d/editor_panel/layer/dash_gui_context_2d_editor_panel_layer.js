function DashGuiContext2DEditorPanelLayer (layers, id) {
    this.layers = layers;
    this.id = id;

    this.input = null;
    this.selected = false;
    this.hidden_icon = null;
    this.locked_icon = null;
    this.icon_size_mult = 0.8;
    this.html = $("<div></div>");
    this.color = this.layers.color;
    this.panel = this.layers.panel;
    this.editor = this.layers.editor;
    this.icon_area = $("<div></div>");
    this.can_edit = this.layers.can_edit;
    this.icon_color = this.color.PinstripeDark;

    this.setup_styles = function () {
        this.html.css({
            "padding": Dash.Size.Padding,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "display": "flex"
        });

        this.add_input();

        this.html.append(Dash.Gui.GetFlexSpacer());

        this.add_icon_area();
        this.RefreshConnections();

        var data = this.get_data();

        if (data["hidden"]) {
            this.ToggleHidden(data["hidden"]);
        }

        if (data["locked"]) {
            this.ToggleLocked(data["locked"]);
        }

        this.Select();
    };

    this.GetID = function () {
        return this.id;
    };

    this.SetLabel = function (value) {
        this.input.SetText(value);
    };

    this.IsSelected = function () {
        return this.selected;
    };

    // TODO: can we nix this? what's depending on it? 
    this.GetIndex = function () {
        return this.layers.get_data()["order"].indexOf(this.id);
    };

    this.GetData = function () {
        return this.get_data();
    };

    this.GetPrimitiveData = function () {
        return this.get_primitive_data();
    };

    this.SetData = function (key, value) {
        return this.set_data(key, value);
    };

    this.InputInFocus = function () {
        return this.input.InFocus();
    };

    this.Deselect = function () {
        if (!this.selected) {
            return;
        }

        this.selected = false;

        this.html.css({
            "background": "",
            "cursor": "pointer"
        });
    };

    this.Select = function (from_canvas=false) {
        if (this.selected) {
            return;
        }

        this.layers.DeselectLayers();

        this.selected = true;

        this.html.css({
            "background": this.color.PinstripeDark,
            "cursor": "auto"
        });

        if (!from_canvas) {
            this.editor.SetCanvasActivePrimitive(this.GetIndex());
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Selected layer: " + this.get_data()["display_name"]);

            this.layers.UpdateToolbarIconStates();
        }

        this.panel.SwitchContentToEditTab();
    };

    this.ToggleHidden = function (hidden) {
        if (hidden) {
            this.hidden_icon.html.show();
        }

        else {
            this.hidden_icon.html.hide();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Layer " + (hidden ? "hidden" : "shown") + ": " + this.get_data()["display_name"]);

            this.set_data("hidden", hidden);
        }
    };

    this.ToggleLocked = function (locked) {
        if (locked) {
            this.locked_icon.html.show();
        }

        else {
            this.locked_icon.html.hide();
        }

        if (!this.layers.redrawing) {
            this.editor.AddToLog("Layer " + (locked ? "locked" : "unlocked") + ": " + this.get_data()["display_name"]);

            this.set_data("locked", locked);
        }
    };

    this.RefreshConnections = function () {
        (function (self) {
            self.html.on("click", function (e) {
                self.Select();

                e.stopPropagation();
            });
        })(this);
    };

    this.add_input = function () {
        var display_name = this.get_data()["display_name"];

        this.input = new Dash.Gui.Input(display_name, this.color);

        this.input.html.css({
            "width": Dash.Size.ColumnWidth * 1.25,  // Allow some extra space to easily select the row, as well as add other elements later
            "box-shadow": "none",
            "border": "1px solid " + this.color.PinstripeDark
        });

        this.input.input.css({
            "width": "calc(100% - " + Dash.Size.Padding + "px)"
        });

        if (display_name) {
            this.input.SetText(display_name);
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

    this.add_icon_area = function () {
        this.icon_area.css({
            "display": "flex"
        });

        this.hidden_icon = new Dash.Gui.Icon(this.color, "hidden", Dash.Size.RowHeight, this.icon_size_mult, this.icon_color);
        this.locked_icon = new Dash.Gui.Icon(this.color, "lock", Dash.Size.RowHeight, this.icon_size_mult, this.icon_color);

        this.locked_icon.html.css({
            "margin-left": Dash.Size.Padding
        });

        if (!this.get_data()["hidden"]) {
            this.hidden_icon.html.hide();
        }

        if (!this.get_data()["locked"]) {
            this.locked_icon.html.hide();
        }

        this.icon_area.append(this.hidden_icon.html);
        this.icon_area.append(this.locked_icon.html);

        this.html.append(this.icon_area);
    };

    this.on_input_submit = function () {
        this.set_data("display_name", this.input.Text().trim());
    };

    this.set_data = function (key, value) {
        this.layers.set_data(key, value, this.id);
    };

    this.get_data = function () {
        return this.layers.get_data()["data"][this.id];
    };

    this.get_primitive_data = function () {  // TODO
        return (this.get_data()["primitive"] || {});
    };

    this.setup_styles();
}
