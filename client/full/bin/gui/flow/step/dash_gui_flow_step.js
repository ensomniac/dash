class DashGuiFlowStep {
    constructor (steps, step) {
        this.steps = steps;
        this.step = step;

        this.options = [];
        this.view = this.steps.view;
        this.continue_button = null;
        this.can_continue_cb = null;
        this.color = this.view.color;
        this.html = $("<div></div>");
        this.continue_button_visible = false;

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "width": "100%",
            "height": "100%",
            "display": "flex",
            "overflow-y": "auto",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center"
        });
    }

    Step () {
        return this.step;
    }

    ID () {
        return this.step["id"];
    }

    AddOptions (bound_cb=null) {
        var options = new DashGuiFlowOptions(this.view, bound_cb);

        options.html.css({
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding
        });

        this.html.append(options.html);

        this.options.push(options);

        return options;
    }

    AddDatePicker (bound_cb=null, min="", max="", label_text="") {
        var date_picker = new DashGuiFlowDatePicker(this.view, bound_cb, min, max, label_text);

        date_picker.html.css({
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding
        });

        this.html.append(date_picker.html);

        return date_picker;
    }

    AddInput (bound_cb=null, placeholder_text="") {
        var input = new DashGuiFlowInput(this.view, bound_cb, placeholder_text);

        input.html.css({
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding
        });

        this.html.append(input.html);

        return input;
    }

    AddInputWithLabel (label_text, bound_cb=null, placeholder_text="") {
        var container = $("<div></div>");

        container.css({
            "margin-top": Dash.Size.Padding * 2,
            "margin-bottom": Dash.Size.Padding * 3,
            "display": "flex",
            "width": "75%"
        });

        var label = this.AddText(label_text);

        label.css({
            "font-size": this.view.core_gui_font_size + "%",
            "font-family": "sans_serif_bold",
            "margin": 0,
            "flex": "none",
            "color": this.color.Stroke,
            "margin-right": Dash.Size.Padding
        });

        label.detach();

        container.append(label);

        var input;  // Declare this early so it can be referenced in the callback

        input = this.AddInput(
            (from_autosave=false, from_blur=false, from_enter=false) => {
                if (!bound_cb) {
                    return;
                }

                bound_cb(input.Text(), from_autosave, from_blur, from_enter);
            },
            placeholder_text
        );

        input.html.css({
            "margin": 0,
            "width": "",
            "flex": 3
        });

        input.html.detach();

        container.append(input.html);

        this.AddHTML(container);

        return {
            "html": container,
            "label": label,
            "input": input
        };
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
            50
        );

        toggle.html.css({
            "width": "100%",
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding
        });

        this.html.append(toggle.html);

        return toggle;
    }

    AddTipText (text, emphasized=false, more_text="") {
        var tip = new DashGuiFlowTipText(this.view, text, more_text);

        if (emphasized) {
            tip.Emphasize();
        }

        else {
            tip.EmphasizeOnHover();
        }

        tip.html.css({
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "flex": "none"
        });

        this.html.append(tip.html);

        return tip;
    }

    AddTipImage (url) {
        var tip = new DashGuiFlowTipImage(this.view, url);

        tip.html.css({
            "margin-bottom": Dash.Size.Padding
        });

        this.html.append(tip.html);

        return tip;
    }

    AddHeader (text) {
        var label = this.view.GetLabel(text, true);

        this.html.append(label);

        return label;
    }

    AddText (text) {
        var label = this.view.GetLabel(text);

        this.html.append(label);

        return label;
    }

    AddMissingOptionButton (bound_cb=null, text="Don't see what you're looking for?") {
        var label = this.view.GetLabel(text, false, true);

        label.on("mouseenter", () => {
            label.css({
                "color": this.color.Button.Background.Base
            });
        });

        label.on("mouseleave", () => {
            label.css({
                "color": this.view.missing_option_text_color
            });
        });

        label.on("click", bound_cb || (() => {
            this.view.RequestNewOption(this.step);
        }));

        this.html.append(label);

        return label;
    }

    AddRow () {
        var row = new DashGuiFlowRow(this.view);

        row.html.css({
            "margin-bottom": Dash.Size.Padding,
            ...this.view.row_area_css
        });

        this.html.append(row.html);

        return row;
    }

    AddRowArea (row_config=[], auto_rows=true, auto_rows_key="", auto_rows_min_required=1) {
        var row = new DashGuiFlowRowArea(
            this.view,
            row_config,
            auto_rows,
            auto_rows_key,
            auto_rows_min_required,
            true
        );

        row.html.css({
            "margin-bottom": Dash.Size.Padding,
            "flex-shrink": 3,
            "overflow-y": "auto",
            "max-height": this.view.content_area_size * 0.5
        });

        this.html.append(row.html);

        return row;
    }

    AddList (on_row_click_bound_cb=null) {
        var list = new DashGuiFlowList(this.view, on_row_click_bound_cb);

        list.html.css({
            "margin-bottom": Dash.Size.Padding,
            "width": "50%"
        });

        this.html.append(list.html);

        return list;
    }

    AddDualList (on_add_bound_cb=null, on_remove_bound_cb=null) {
        var dual_list = new DashGuiFlowListDual(this.view, on_add_bound_cb, on_remove_bound_cb);

        dual_list.html.css({
            "margin-bottom": Dash.Size.Padding,
            "width": "75%"
        });

        this.html.append(dual_list.html);

        return dual_list;
    }

    AddHTML (html) {
        this.html.append(html);
    }

    AddContinueButton (can_continue_cb=null, step_id_override="", visible=false) {
        this.continue_button_visible = visible;

        if (can_continue_cb) {
            this.can_continue_cb = can_continue_cb;
        }

        this.continue_button = new DashGuiFlowButton(
            this.is_last_step() ? "Finish" : "Continue",
            this,
            () => {
                this.Continue(step_id_override);
            }
        );

        this.continue_button.Highlight(Dash.Size.ButtonHeight * 1.75);
        this.continue_button.AddIcon("arrow_right_alt_2_heavy", 0.55);

        this.continue_button.label.css({
            "font-size": (this.view.core_gui_font_size - 50) + "%",
            "margin-left": Dash.Size.Padding * 0.7
        });

        var css = {
            "margin-top": Dash.Size.Padding * 3,
            "opacity": visible ? 1 : 0
        };

        if (!visible) {
            css["visibility"] = "hidden";
        }

        this.continue_button.html.css(css);

        this.html.append(this.continue_button.html);
    }

    ShowContinueButton (can_continue_cb=null, step_id_override="") {
        if (this.continue_button_visible) {
            return;
        }

        this.continue_button_visible = true;

        if (can_continue_cb) {
            this.can_continue_cb = can_continue_cb;
        }

        if (this.continue_button) {
            this.show_continue_button();
        }

        else {
            this.AddContinueButton(null, step_id_override);

            requestAnimationFrame(() => {
                this.show_continue_button();
            });
        }
    }

    HideContinueButton () {
        if (!this.continue_button || !this.continue_button_visible) {
            return;
        }

        this.continue_button_visible = false;

        this.continue_button.html.animate(
            {"opacity": 0},
            {
                "duration": 400,
                "complete": () => {
                    this.continue_button.html.css({
                        "visibility": "hidden"
                    });
                }
            }
        );
    }

    Continue (step_id_override="", force=false) {
        if (!force && this.can_continue_cb && !this.can_continue_cb()) {
            return;
        }

        var is_last_step = this.is_last_step();

        if (!is_last_step && typeof step_id_override === "function") {
            step_id_override = step_id_override();
        }

        if (!is_last_step && !step_id_override) {
            this.view.timeline.RefreshLockedNodes();
        }

        var node = is_last_step ? this.view.timeline.GetActiveNode() : (
            !step_id_override ? this.view.timeline.GetNextNode() : null
        );

        this.view.Save(
            true,
            () => {
                if (is_last_step) {
                    this.view.Finish();
                }

                else {
                    this.view.LoadStep(step_id_override || node.Step(),true);
                }
            },
            step_id_override || node.ID()
        );
    }

    show_continue_button () {
        this.continue_button.html.css({
            "visibility": "visible"
        });

        this.continue_button.html.animate(
            {"opacity": 1},
            400
        );
    }

    is_last_step () {
        return this.ID() === this.view.steps.Last()["id"];
    }
}
