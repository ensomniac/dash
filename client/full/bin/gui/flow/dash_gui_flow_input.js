class DashGuiFlowInput extends DashGuiInput {
    constructor (view, bound_cb=null, placeholder_text="") {
        super(
            placeholder_text,
            view.color
        );

        this.view = view;
        this.bound_cb = bound_cb;

        this.extend_styles();
    }

    extend_styles () {
        this.html.css({
            "background": "",
            "box-shadow": "",
            "height": "",
            "border-radius": "",
            "width": "75%",
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

        this.input.css({
            "font-size": this.view.core_gui_font_size + "%",
            "padding": 0,
            "line-height": "",
            "width": "100%"
        });

        this.SetBoundCallback(this.bound_cb);
    }

    SetBoundCallback (bound_cb) {
        this.bound_cb = bound_cb;

        if (this.bound_cb) {
            this.SetOnChange(this.bound_cb);
            this.SetOnSubmit(this.bound_cb);
            this.SetOnAutosave(this.bound_cb, null, true);
            this.SetAutosaveDelayMs(100);
        }

        else {
            // Not needed for now, but can handle later
        }
    }
}
