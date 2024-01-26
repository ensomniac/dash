class DashGuiFlowRow {
    constructor (view) {
        this.view = view;

        this.elements = [];
        this.icon_font_size = 200;
        this.color = this.view.color;
        this.html = $("<div></div>");
        this.font_size = this.view.core_gui_font_size - 100;  // Based off two elements in the row (combo and input)

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "display": "flex",
            "width": "85%"
        });
    }

    GetData () {
        var data = [];

        for (var element of this.elements) {
            if (element instanceof DashGuiFlowCombo) {
                data.push(element.ActiveID());
            }

            else if (element instanceof DashGuiFlowInput) {
                data.push(element.Text());
            }

            else if (element instanceof DashGuiFlowToggle) {
                var active = element.IsActive();

                // Only track if not default value (for non-auto-rows, this might need to be adjusted)
                if (active !== element.starting_state) {
                    data.push(active);
                }
            }

            else if (element instanceof DashGuiIconButton) {
                // pass
            }

            else {
                console.warn("Warning: Unhandled element instance type:", element);
            }
        }

        return data;
    }

    IsEmpty () {
        for (var data of this.GetData()) {
            if (data) {
                return false;
            }
        }

        return true;
    }

    AddText (text) {
        var label = this.view.GetLabel(text);

        label.css({
            "font-size": this.font_size + "%"
        });

        this.html.append(label);

        return this.track_element(label);
    }

    AddInput (bound_cb=null, placeholder_text="") {
        var input = new DashGuiFlowInput(this.view, bound_cb, placeholder_text);

        input._dash_gui_flow_row = this;

        input.html.css({
            "width": "",
            "flex": 2
        });

        input.input.css({
            "font-size": this.font_size + "%"
        });

        return this.track_element(input);
    }

    AddCombo (combo_options, bound_cb=null, starting_option_id="") {
        var combo = new DashGuiFlowCombo(this.view, combo_options, bound_cb, starting_option_id);

        combo._dash_gui_flow_row = this;

        combo.SetFontSize(this.font_size, 150, this.font_size - 25);

        return this.track_element(combo);
    }

    AddIconButton (icon_name, bound_cb=null, hover_hint="", icon_font_size_percent=0, highlight=true) {
        if (!icon_font_size_percent) {
            icon_font_size_percent = this.icon_font_size;
        }

        var size = ((icon_font_size_percent / this.icon_font_size) * 100) + "%";

        var icon_button = new Dash.Gui.IconButton(
            icon_name,
            bound_cb,
            null,
            this.color,
            {"container_size": "25%"}
        );

        icon_button.html.css({
            "align-self": "center"
        });

        icon_button.icon.html.css({
            "width": size,
            "height": size,
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        });

        icon_button.icon.icon_html.css({
            "font-size": icon_font_size_percent + "%",
            "width": "100%",
            "height": "100%"
        });

        if (highlight) {
            icon_button.AddHighlight();
        }

        if (hover_hint) {
            icon_button.SetHoverHint(hover_hint);
        }

        return this.track_element(icon_button);
    }

    AddToggle (
        starting_state=true, bound_cb=null, true_label_text="",
        false_label_text="", true_icon_name="toggle_on", false_icon_name="toggle_off"
    ) {
        var toggle = new DashGuiFlowToggle(
            this.view,
            starting_state,
            bound_cb,
            true_label_text,
            false_label_text,
            true_icon_name,
            false_icon_name,
            0,
            -125
        );

        toggle._dash_gui_flow_row = this;

        return this.track_element(toggle);
    }

    track_element (element) {
        var html = element.hasOwnProperty("html") ? element.html : element;

        html.css({
            "margin-left": this.elements.length ? Dash.Size.Padding : 0
        });

        this.elements.push(element);

        this.html.append(html);

        return element;
    }
}
