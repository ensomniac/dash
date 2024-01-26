class DashGuiFlowList extends DashLayoutSearchableRevolvingList {
    constructor (view, on_row_click_bound_cb=null) {
        super(
            null,
            on_row_click_bound_cb,
            {"font-size": "115%"},
            "",
            Dash.Size.ButtonHeight * 1.25,
            view.color
        );

        this.view = view;
        this.loading_overlay = null;

        this.extend_styles();
    }

    extend_styles () {
        var border = "1px solid " + this.color.Pinstripe;

        this.html.css({
            "flex": 2,
            "display": "flex",
            "flex-direction": "column",
            "min-height": this.list.full_row_height * 5,
            "max-height": this.list.full_row_height * 10,
            "border-radius": Dash.Size.BorderRadius
        });

        this.list.html.css({
            "position": "",
            "inset": "",
            "display": "flex",
            "flex-direction": "column",
            "flex": 2
        });

        this.list.container.css({
            "background": this.color.PinstripeLight,
            "position": "",
            "inset": "",
            "flex": 2,
            "border-left": border,
            "border-right": border,
            "border-bottom": border,
            "border-bottom-left-radius": Dash.Size.BorderRadius,
            "border-bottom-right-radius": Dash.Size.BorderRadius
        });

        this.input.html.css({
            "position": "",
            "inset": "",
            "font-size": this.label_css["font-size"],
            "flex": "none"
        });
    }

    ShowLoadingOverlay () {
        if (!this.loading_overlay) {
            this.loading_overlay = new Dash.Gui.LoadingOverlay(this.color, "none", "Loading", this.html);

            this.loading_overlay.modal.modal.css({
                "padding": 0,
                "padding-left": Dash.Size.Padding * 0.5,
                "padding-right": Dash.Size.Padding * 0.5,
                "margin": Dash.Size.Padding * 0.5
            });

            this.loading_overlay.modal.background.css({
                "border-radius": Dash.Size.BorderRadius
            });
        }

        this.loading_overlay.Show();
    }

    HideLoadingOverlay () {
        if (!this.loading_overlay) {
            return;
        }

        this.loading_overlay.Hide();
    }
}
