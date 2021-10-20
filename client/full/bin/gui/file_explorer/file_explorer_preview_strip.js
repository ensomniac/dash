function DashFileExplorerPreviewStrip (color) {
    this.color = color || Dash.Color.Light;

    this.html = $("<div></div>");
    this.preview_box = $("<div></div>");
    this.detail_box = $("<div></div>");
    this.height = Dash.Size.RowHeight * 15;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        this.html.css({
            "height": this.height
        });

        this.preview_box.css({
            "background": this.opposite_color.BackgroundRaised,
            "position": "absolute",
            "inset": 0,
            "width": this.height,
            "overflow": "auto"
        });

        this.detail_box.css({
            "background": this.color.Background,
            "padding-left": this.height,
            "height": "100%"
        });

        // this.preview_box.append(this.get_preview_content(file_data));
        // this.detail_box.append(this.get_preview_property_box(file_data));

        this.html.append(this.detail_box);
        this.html.append(this.preview_box);
    };

    this.setup_styles();
}
