function GuiIconDefinition(icon, label, fa_style, fa_id, size_mult, left_offset_mult, top_offset_mult){

    // fa_styles
    // r = regular
    // s = solid
    // l = light
    // b = brands
    // fa_styles

    this.icon = icon;
    this.label = label || "";
    this.fa_style = fa_style;
    this.fa_id = fa_id;
    this.left_offset_mult = left_offset_mult || 0;
    this.top_offset_mult = top_offset_mult || 0;

    this.get_class = function(){
        var icon_class = 'fa' + this.fa_style + ' fa-' + this.fa_id + '';
        return icon_class;
    };

    this.get_css = function(){

        var icon_fnt_size = this.icon.size*this.icon.size_mult;

        var icon_css = {
            "position": "absolute",
            "top": 0,
            "left": 0,
            "bottom": 0,
            "right": 0,
            "width": this.icon.size,
            "height": this.icon.size,
            "font-size": icon_fnt_size + "px",
            "line-height": this.icon.size + "px",
            "text-align": "center",
            "color": this.icon.color.Text,
            // "color": "white",
        };

        if (!this.icon.color.Text) {
            console.log("Error: Incorrect color object passed to DashIcon:");
            console.log(this.color);
            console.trace();
            debugger;
        };

        return icon_css;

    };

};
