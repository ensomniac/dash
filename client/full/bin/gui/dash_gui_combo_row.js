
function DashGuiComboRow(Combo, option){

    this.combo = Combo;
    this.option = option;
    this.color_set = this.combo.color_set;
    this.label_text = this.option["label_text"];

    this.height = this.combo.height;
    this.html = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.label = $("<div class='Combo'>" + this.label_text + "</div>");

    this.setup_styles = function(){

        this.html.append(this.highlight);
        this.html.append(this.label);

        this.html.css({
            "height": this.height,
        });

        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": "rgba(255, 255, 255, 0.2)",
            "opacity": 0,
        });

        this.label.css({
            "text-align": this.combo.text_alignment,
            "height": this.height,
            "line-height": (this.height) + "px",
            // "font-size": "85%",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "border-bottom": "1px solid rgba(255, 255, 255, 0.05)",
            "color": this.color_set.Text.Base,
        });

    };

    this.SetWidth = function(width){
        // Prior to showing, set the width of rows

        this.html.css({
            "width": width,
        });

        this.label.css({
            "width": width-Dash.Size.Padding,
            "padding-left": Dash.Size.Padding*0.5,
            "padding-right": Dash.Size.Padding*0.5,
        });

    };

    this.setup_connections = function(){

        (function(self){

            self.label.mouseenter(function(){
                self.highlight.stop().animate({"opacity": 1}, 50);
            });

            self.html.mouseleave(function(){
                self.highlight.stop().animate({"opacity": 0}, 100);
            });

            self.label.click(function(e){
                self.combo.on_selection(self.option);
                e.preventDefault();
                return false;
            });

        })(this);

    };

    this.setup_styles();
    this.setup_connections();

};
