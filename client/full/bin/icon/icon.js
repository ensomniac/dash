function DashIcon(color, icon_name) {

    this.color = color || Dash.Color.Light;
    this.theme = "light";

    this.html = $("<div class='GuiIcon'></div>");
    this.icon_html = $('<i></i>');

    this.html.append(this.icon_html);

    this.name = icon_name || "";
    this.size = null;
    this.size_mult = null;

    this.margin_top = "auto";
    this.margin_bottom = "auto";
    this.margin_left = "auto";
    this.margin_right = "auto";
    this.padding_right = 0;
    this.padding_left = 0;
    this.padding_top = 0;
    this.padding_bottom = 0;
    this.position_right = false;

    this.SetColor = function(color_override){
        this.color_override = color_override;

        if (this.color_override) {

            this.icon_html.css({
                "color": this.color_override,
            });

        }
        else {
            this.icon_html.css({
                "color": this.icon.get_css(this.size, this.color)["color"],
            });
        };

    };

    this.Set = function(name){
        this.name = name;

        this.icon = GuiIcons(this.name);

        if (!this.icon_html){
            this.icon_html.attr('class', this.icon.get_class());
        }
        else{
            (function(self){
                self.icon_html.stop().animate({"opacity": 0}, 200, function(){
                    self.icon_html.attr('class', self.icon.get_class());
                    self.icon_html.stop().animate({"opacity": 1}, 200);
                });
            })(this);
        };

        this.draw();

    };

    this.SetSizeMult = function(mult){
        this.size_mult = mult;
        this.draw();
    };

    this.SetVerticalAlign = function(position, padding){

        this.parent_height = this.html.parent().height();

        if (position == "center"){
            this.padding_top = (this.parent_height - this.size)*0.5;
            this.margin_bottom = "";
            this.margin_top = "";
        }
        else if (position == "bottom"){
            this.padding_top = (this.parent_height - this.size);
            this.margin_bottom = "";
            this.margin_top = "";
        }
        else{
            this.padding_top = padding;
            this.margin_bottom = "";
            this.margin_top = "";
        };

        this.draw();
    };

    this.SetHorizontalAlign = function(position, padding){

        this.parent_width = this.html.parent().width();

        if (!padding){
            padding = (this.parent_height - this.size)*0.5;
        };

        if (position == "right"){
            this.position_right = true;
            this.padding_left = "";
            this.padding_right = padding;
        }
        else if (position == "left"){
            this.padding_right = "";
            this.padding_left = padding;
        }
        else{
            this.padding_left = padding;
        };

        this.draw();
    };

    this.SetTooltip = function(tooltip){
        this.html.attr("title", tooltip);
    };



    this.setup_styles = function(){

        this.html.css({
            "position": "absolute",
            "cursor": "pointer",
            "-webkit-user-select": "none",
        });

    };

    this.draw = function(){

        // this.size = Style.IconSize(this.size_mult);
        this.size = Dash.Size.RowHeight;

        this.html.css({
            "width": this.size,
            "height": this.size,
            "top": this.padding_top,
            "left": this.padding_left,
            "right": this.padding_right,
            "bottom": this.padding_bottom,
            "margin-top": this.margin_top,
            "margin-bottom": this.margin_bottom,
            "margin-left": this.margin_left,
            "margin-right": this.margin_right,
        });

        if (this.name && this.icon){
            this.icon_html.css(this.icon.get_css(this.size, this.color));

            if (this.color_override) {
                this.icon_html.css({
                    "color": this.color_override,
                });
            };

        };

    };

    this.update = function(icon_id){
        this.id = icon_id;
        this.url = ICON_MAP["url_prefix"] + ICON_MAP["icons"][this.id][0];
        this.default_size = ICON_MAP["icons"][this.id][1];

    };

    this.setup_styles();
    this.draw();

    if (this.name) {
        this.Set(this.name);
    };

};