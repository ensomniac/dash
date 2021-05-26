
function DashGuiIconButton(icon_name, callback, binder, color, options={}){

    this.icon = null;
    this.icon_height = null;
    this.icon_name = icon_name;
    this.icon_default_opacity = 0.8;
    this.icon_size_mult = options["size_mult"] || 1.0;

    DashGuiButton.call(this, "", callback, binder, color, options);

    this.setup_icon = function(){

        if (this.style == "toolbar") {
            this.icon_height = Dash.Size.RowHeight;
            this.icon_size_mult = 0.75;
            this.setup_toolbar_icon();
        }
        else if ("default") {
            this.icon_height = this.html.height()-(Dash.Size.Padding * 1.2);
            this.setup_default_icon();
        }
        else {
            this.icon_height = this.html.height()-(Dash.Size.Padding * 1.2);
            console.log("Warning: Unhandled button / icon style: " + this.style);
            this.setup_default_icon();
        };

    }

    this.setup_toolbar_icon = function(){

        this.icon = new Dash.Gui.Icon(
            this.color,          // Dash Color
            this.icon_name,      // Icon name / asset path
            this.icon_height,    // Height...
            this.icon_size_mult, // Size mult for the icon, within the container
        );

        this.highlight.css({
            "background": this.color.AccentGood,
            "top": "auto",
            "height": 3,
            "bottom": -3,
        });

        this.html.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.icon.html.css({
            "opacity": this.icon_default_opacity,
        });

        this.html.append(this.icon.html);

    };

    this.setup_default_icon = function(){

        this.icon = new Dash.Gui.Icon(
            this.color,          // Dash Color
            this.icon_name,      // Icon name / asset path
            this.icon_height,    // Height...
            this.icon_size_mult, // Size mult for the icon, within the container
        );

        this.highlight.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.html.css({
            "background": "rgba(0, 0, 0, 0)",
        });

        this.icon.html.css({
            "opacity": this.icon_default_opacity,
        });

        this.html.append(this.icon.html);

    };

    this.on_hover_in = function(){
        this.highlight.stop().animate({"opacity": 1}, 50);
        this.icon.html.stop().animate({"opacity": 1}, 50);
    };

    this.on_hover_out = function(){
        this.highlight.stop().animate({"opacity": 0}, 100);
        this.icon.html.stop().animate({"opacity": this.icon_default_opacity}, 100);
    };

    // this.on_hover_in = function(){
    //     this.highlight.stop().animate({"opacity": 1}, 50);

    //     if (this.is_selected) {
    //         this.label.css("color", this.color_set.Text.SelectedHover);
    //     }
    //     else {
    //         this.label.css("color", this.color_set.Text.BaseHover);
    //     };

    // };

    // this.on_hover_out = function(){
    //     this.highlight.stop().animate({"opacity": 0}, 100);

    //     if (this.is_selected) {
    //         this.label.css("color", this.color_set.Text.Selected);
    //     }
    //     else {
    //         this.label.css("color", this.color_set.Text.Base);
    //     };

    // };




    this.setup_icon();

};
