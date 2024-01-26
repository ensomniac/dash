class DashGuiFlowTipImage {
    constructor (view, url, width=null, height=null) {
        this.view = view;

        this.color = this.view.color;
        this.html = Dash.File.GetImagePreview(url, width, height);

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "padding": Dash.Size.Padding,
            "border": "1px solid " + this.color.PinstripeDark,
            "border-radius": Dash.Size.BorderRadius,
            "max-width": this.view.content_area_size * 0.5
        });
    }

    SetURL (url, width=null, height=null) {
        this.html.css({
            "background-image": "url(" + url + ")"
        });

        // Copied from Dash.File.GetImagePreview
        Dash.File.set_preview_size(this.html, width ? width : height, width ? height : "100%");
    }
}
