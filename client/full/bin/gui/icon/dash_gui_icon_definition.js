function DashGuiIconDefinition (icon, label, fa_style, fa_id) {
    this.icon = icon;
    this.label = label || "";
    this.fa_style = fa_style;
    this.fa_id = fa_id;

    // FA Styles:
    //     r = regular
    //     s = solid
    //     l = light
    //     b = brands

    this.get_class = function () {
        return "fa" + this.fa_style + " fa-" + this.fa_id + "";
    };

    this.get_css = function () {
        var icon_fnt_size = this.icon.size * this.icon.size_mult;

        var icon_css = {
            "position": "absolute",
            "inset": 0,
            "width": this.icon.size,
            "height": this.icon.size,
            "font-size": icon_fnt_size + "px",
            "line-height": this.icon.size + "px",
            "text-align": "center",
            "color": this.icon.icon_color
        };

        if (!this.icon.icon_color) {
            console.error("Error: Incorrect color object passed to DashGuiIcon:", this.icon.icon_color);
            
            console.trace();
            
            debugger;
        }

        return icon_css;
    };
}
