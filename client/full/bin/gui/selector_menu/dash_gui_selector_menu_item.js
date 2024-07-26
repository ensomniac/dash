function DashGuiSelectorItem (tray, details) {

    this.tray    = tray;
    this.details = details;
    this.color   = this.tray.color;
    this.menu    = this.tray.selector_menu;

    this.height  = this.tray.item_height;
    this.width   = this.tray.item_width;

    this.html    = $("<div class='SelectorMenuItem'></div>");
    this.label   = $("<div>" + this.details["display_name"] + "</div>");
    this.hover   = Dash.Gui.GetHTMLAbsContext();

    this.setup_styles = function () {

        this.icon_size = this.height - (Dash.Size.Padding);
        this.icon_name = this.menu.options["item_icon"] || this.menu.icon_name;

        this.icon = new Dash.Gui.Icon(
            this.color,
            this.icon_name,
            this.icon_size,
            0.5,    // icon_size_mult
            this.color.Button.Text.Base, // icon_color
        );

        this.html.css({
            "width":       this.width,
            "height":      this.height,
            "margin":      0,
            "padding":     0,
            "cursor":      "pointer",
            "user-select": "none",
            "background":  this.color.Button.Background.Base,
            "border-radius": Dash.Size.BorderRadius,
            "margin-bottom": Dash.Size.Padding,
            "margin-right": Dash.Size.Padding,
        });

        this.icon.html.css({
            "position":      "absolute",
            "left":          Dash.Size.Padding * 0.5,
            "top":           Dash.Size.Padding * 0.5,
            "border-radius": this.icon_size * 0.5,
            "background":    "black",
            "pointer-events": "none",
            "user-select":    "none",
        });

        this.hover.css({
            "background":  this.menu.bg_color,
            "opacity": 0,
            "pointer-events": "none",
            "user-select":    "none",
        });

        this.label.css({
            "position": "absolute",
            "left": this.icon_size + Dash.Size.Padding,
            "top": 0,
            "width": this.width - this.icon_size - (Dash.Size.Padding * 2),
            "height": this.height,
            "line-height": this.height + "px",
            "color": this.color.Button.Text.Base,

        });

        this.html.append(this.hover);
        this.html.append(this.icon.html);
        this.html.append(this.label);

        (function(self){
            self.html.click(function(){
                self.on_click();
            });

            self.html.on("mouseenter", function(){
                self.on_hover_start();
            });

            self.html.on("mouseleave", function(){
                self.on_hover_stop();
            });

        })(this);

    };

    this.on_hover_start = function () {
        this.hover.stop().animate({"opacity": 1}, 250);
    };

    this.on_hover_stop = function () {
        this.hover.stop().animate({"opacity": 0}, 500);
    };

    this.on_click = function () {
        this.menu.OnItemClicked(this.details);
    };

    this.setup_styles();

}
