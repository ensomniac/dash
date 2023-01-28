function DashGuiContext2DEditorPanelContentEdit (content) {
    this.content = content;

    this.contexts = {};
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.can_edit = this.content.can_edit;  // TODO: propagate

    this.setup_styles = function () {
        for (var key of ["general", ...this.content.PrimitiveTypes]) {
            this.add_context(key);
        }
    };

    this.InputInFocus = function () {
        for (var key in this.contexts) {
            if (!this.contexts[key]["visible"]) {
                continue;
            }

            for (var input of this.contexts[key]["inputs"]) {
                if (input.InFocus()) {
                    return true;
                }
            }
        }

        return false;
    };

    this.Redraw = function () {
        for (var key in this.contexts) {
            if (key === "general") {
                continue;
            }

            this.hide_context(key);
        }

        var selected_layer = this.panel.GetSelectedLayer();

        if (!selected_layer) {
            this.hide_context("general");

            return;
        }

        // Always show general context when a layer is selected
        this.show_context("general");

        // TODO: something like this
        this.show_context((selected_layer["primitive"] || {})["type"]);
    };

    this.show_context = function (key) {
        if (!key || !this.contexts[key] || this.contexts[key]["visible"]) {
            return;
        }

        this.contexts[key]["html"].show();

        this.contexts[key]["visible"] = true;
    };

    this.hide_context = function (key) {
        if (!key || !this.contexts[key] || !this.contexts[key]["visible"]) {
            return;
        }

        this.contexts[key]["html"].hide();

        this.contexts[key]["visible"] = false;
    };

    this.add_context = function (key) {
        this.contexts[key] = {
            "html": $("<div></div>"),
            "visible": false,
            "inputs": []  // TODO: any inputs that get added to these contexts should be added to this list
        };

        this.html.append(this.contexts[key]["html"]);
    };

    this.setup_styles();
}
