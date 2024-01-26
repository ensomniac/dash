class DashGuiFlowStepArea {
    constructor (view) {
        this.view = view;

        this.step = null;
        this.color = this.view.color;
        this.html = $("<div></div>");

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "display": "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center"
        });
    }

    SetActiveStep (id) {
        this.html.empty();

        this.step = new DashGuiFlowStep(this, id);

        this.html.append(this.step.html);

        this.view.init_step(id);
    }

    InitBoolStep (
        key, header_text, false_id, false_text, true_id, true_text, tip_text="", tip_more_text="",
        font_size_override=null, false_sub_text="", true_sub_text="", default_state=null, tip_at_top=false
    ) {
        this.step.AddHeader(header_text);

        if (tip_at_top && tip_text) {
            this.step.AddTipText(tip_text, true, tip_more_text);
        }

        var has_default = typeof default_state === "boolean";

        if (has_default) {
            this.step.AddToggle(
                default_state,
                (active) => {
                    this.view.UpdateLocal(key, active ? true_id : false_id);
                },
                true_text,
                false_text
            ).html.css({
                "margin-top": Dash.Size.Padding * 3,
                "margin-bottom": Dash.Size.Padding * 3
            });
        }

        else {
            var step_id = this.step.ID();  // Lock this ID to a var for the below callback, just in case

            var options = this.step.AddOptions((selected_id) => {
                this.OnOptionSelected(step_id, selected_id, key);
            });

            options.html.css({
                "margin-top": Dash.Size.Padding * 3,
                "margin-bottom": Dash.Size.Padding * 3
            });

            var false_option = options.AddOption(
                false_id,
                false_text,
                "",
                "",
                false_sub_text,
                true
            );

            var true_option = options.AddOption(
                true_id,
                true_text,
                "",
                "",
                true_sub_text,
                true
            );

            if (font_size_override) {
                false_option.OverrideFontSize(font_size_override);

                true_option.OverrideFontSize(font_size_override);
            }
        }

        if (!tip_at_top && tip_text) {
            this.step.AddTipText(tip_text, false, tip_more_text);
        }

        this.step.AddContinueButton(null, "", has_default);
    }

    // Standard/basic implementation
    InitOptionsStep (
        header_text, key, add_options_bound_cb, load_obj_data=false, can_continue_bound_cb=null,
        cont_step_id_override="", missing_button=true, missing_bound_cb=null,
        missing_text="Don't see what you're looking for?"
    ) {
        this.step.AddHeader(header_text);

        var step_id = this.step.ID();  // Lock this ID to a var for the below callback, just in case

        var options = this.step.AddOptions((selected_id) => {
            this.OnOptionSelected(step_id, selected_id, key, load_obj_data);
        });

        add_options_bound_cb(options);

        if (missing_button) {
            this.step.AddMissingOptionButton(missing_bound_cb, missing_text);
        }

        this.step.AddContinueButton(can_continue_bound_cb, cont_step_id_override);

        return options;
    }

    OnOptionSelected (step_id, value, key, load_obj_data=false) {
        if (this.step.ID() !== step_id) {
            return;  // Just in case
        }

        this.view.UpdateLocal(key, value);

        if (load_obj_data) {
            this.view.LoadObjData();
        }

        this.step.ShowContinueButton();
    }
}
