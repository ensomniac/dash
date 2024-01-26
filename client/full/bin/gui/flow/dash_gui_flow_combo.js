class DashGuiFlowCombo extends DashGuiCombo {
    constructor (view, combo_options, bound_cb=null, starting_option_id="") {
        super(
            "",
            bound_cb,
            null,
            combo_options,
            starting_option_id,
            view.color,
            {"style": "default_bubbled"}
        );

        this.view = view;

        this.extend_styles();
    }

    extend_styles () {
        this.font_size = this.view.core_gui_font_size + "%";
        this.row_font_size = (this.view.core_gui_font_size - 50) + "%";

        this.dropdown_icon_css["top"] = "";

        this.html.css({
            "height": ""
        });

        this.inner_html.css({
            "background": "",
            "height": "",
            "line-height": "",
            "padding": Dash.Size.Padding * 0.5
        });

        this.click.css({
            "line-height": ""
        });

        this.label_container.css({
            "height": "100%",
            "align-items": "center"
        });

        this.dropdown_icon.html.css({
            "top": this.dropdown_icon_css["top"]
        });

        this.dropdown_icon.icon_html.css({
            "font-size": "200%"
        });

        this.label.css({
            "line-height": ""
        });

        requestAnimationFrame(() => {
            // To make sure the rows draw at the same size (might want to make sure this updates on resizing of window)
            this.height = this.inner_html.innerHeight() || this.inner_html.height();
        });
    }

    SetFontSize (size_num, icon_size_num=0, row_font_size=0) {
        this.font_size = size_num + "%";

        this.label.css({
            "font-size": this.font_size
        });

        if (icon_size_num) {
            this.dropdown_icon.icon_html.css({
                "font-size": icon_size_num + "%"
            });
        }

        if (row_font_size) {
            this.row_font_size = row_font_size + "%";
        }
    }
}
