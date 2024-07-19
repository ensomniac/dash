function DashGuiSelectorMenu (binder, selected_callback, icon_name="unknown", options={}) {

    this.binder            = binder;
    this.selected_callback = selected_callback;

    // Default Options
    this.options    = options || {};
    this.color      = this.options["color"] || this.binder.color || Dash.Color.Light;
    this.icon_color = this.options["icon_color"] || this.color.Button.Text.Base;
    this.bg_color   = this.options["bg_color"] || this.color.Button.Background.Selected;
    this.size       = this.options["size"] || Dash.Size.ButtonHeight;
    this.icon_name  = this.options["icon_name"] || icon_name || "unknown";
    this.icon_sm    = this.options["icon_size_mult"] || 0.6;

    this.html  = $("<div class='SelectorMenu'></div>");
    this.hover = Dash.Gui.GetHTMLAbsContext();
    this.icon  = null;
    this.tray  = new DashGuiSelectorMenuTray(this);

    this.setup_styles = function () {

        this.icon = new Dash.Gui.Icon(
            this.color,
            this.icon_name,
            this.size,
            this.icon_sm, // icon_size_mult
            this.icon_color, // icon_color
        );

        this.html.css({
            "width":       this.size,
            "height":      this.size,
            "margin":      0,
            "padding":     0,
            "cursor":      "pointer",
            "user-select": "none",
            "background":  this.bg_color,
            "border-radius": Dash.Size.BorderRadius,
        });

        this.hover.css({
            "background":  "rgba(255, 255, 255, 0.4)",
            "opacity": 0,
        });

        this.html.append(this.hover);
        this.html.append(this.icon.html);
        this.html.append(this.tray.html);

        (function(self){
            self.html.click(function(){
                self.toggle_menu();
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




    this.toggle_menu = function () {
        console.log("toggle_menu")
        this.tray.Show();
    };

    this.open_menu = function () {
        console.log("open")
    };

    this.close_menu = function () {
        console.log("close")
    };



    this.setup_styles();
}
