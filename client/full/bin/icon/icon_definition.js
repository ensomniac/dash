function GuiIconDefinition(label, fa_style, fa_id, size_mult, left_offset_mult, top_offset_mult){

    // fa_styles
    // r = regular
    // s = solid
    // l = light
    // b = brands
    // fa_styles

    this.label = label || "";
    this.fa_style = fa_style;
    this.fa_id = fa_id;
    this.left_offset_mult = left_offset_mult || 0;
    this.top_offset_mult = top_offset_mult || 0;
    this.size_mult = size_mult || 1;

    this.get_class = function(){

        var icon_class = 'fa' + this.fa_style + ' fa-' + this.fa_id + '';
        return icon_class;
    };

    this.get_css = function(size, color){
        var new_size = size*this.size_mult;

        console.log(color.Text);
        console.log(color);

        var icon_css = {
            "position": "absolute",
            "top": 0,
            "left": 0,
            "bottom": 0,
            "right": 0,
            "width": size,
            "height": size,
            "font-size": new_size + "px",
            "line-height": size + "px",
            "text-align": "center",
            "color": color.Text,
        };

        return icon_css;
    };
};
