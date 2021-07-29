function DashCardStackBannerFooterButtonRowButton (footer, icon_name="gear", label_text="--", callback=null) {

    this.footer = footer;
    this.banner = this.footer.banner;
    this.stack = this.banner.stack;
    this.color = this.stack.color;
    this.icon_name = icon_name;
    this.label_text = label_text;
    this.callback = callback;

    this.row_height = this.banner.FooterHeight;
    this.width = this.banner.FooterButtonWidth;
    this.label_height = Dash.Size.RowHeight;
    this.click_active = false;

    this.html = Dash.Gui.GetHTMLContext();
    this.icon_circle = Dash.Gui.GetHTMLAbsContext();
    this.icon = new Dash.Gui.Icon(this.color, icon_name, this.width, 0.5, this.banner.DefaultColorB);
    this.label = Dash.Gui.GetHTMLAbsContext();

    if ((this.row_height-this.width) < this.label_height) {
        this.label_height = this.row_height-this.width;
    };

    this.setup_styles = function () {

        this.html.append(this.icon_circle);
        this.html.append(this.label);
        this.label.text(this.label_text);
        this.icon_circle.append(this.icon.html);

        this.icon.icon_html.css({
            "text-shadow": "0px 2px 3px rgba(0, 0, 0, 0.2)",
        });

        this.html.css({
            "height": this.row_height,
            "width": this.width,
            "background": "none",
            // "overflow": "visible",
        });

        this.icon_circle.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": "auto",
            "background": "rgb(250, 250, 250)",
            "height": this.width,
            "width": this.width,
            "border-radius": this.width*0.5,
            "box-shadow": "0px 6px 10px 1px rgba(0, 0, 0, 0.1), inset 0px 2px 2px 0px rgba(255, 255, 255, 1)",
        });

        this.label.css({
            "position": "absolute",
            "left": -Dash.Size.Padding,
            "bottom": 0,
            "top": "auto",
            "height": this.label_height,
            "line-height": this.label_height + "px",
            "width": this.width + (Dash.Size.Padding*2),
            "font-size": "80%",
            "background": "none",
        });

        this.setup_connections();

    };

    this.setup_connections = function(){

        (function(self){

            self.html.mousedown(function(event){
                self.on_button_clicked();
                event.preventDefault();
                return false;
            });

        })(this);

    };

    this.on_button_clicked = function() {
        // Button presses have a short timeout to prevent accidental multiple taps

        if (this.click_active) {
            return;
        };

        if (this.callback) {
            this.callback();
        }
        else {
            console.log("ERROR: No callback associated with button!");
        };

        this.click_active = true;

        (function(self){
            setTimeout(function(){
                self.click_active = false;
            }, 750);
        })(this);

    };

    this.setup_styles();

};