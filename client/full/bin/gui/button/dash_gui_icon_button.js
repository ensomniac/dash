
function DashGuiIconButton(icon_name, callback, binder, color, options){

    this.icon = null;
    this.icon_height = null;
    this.icon_name = icon_name;
    this.icon_default_opacity = 0.8;

    DashGuiButton.call(this, "", callback, binder, color, options);

    this.setup_icon = function(){

        // This is bad and should be instead derived from a stable button
        // height property, which doesn't exist yet...
        this.icon_height = this.html.height()-Dash.Size.Padding;

        this.icon = new Dash.Gui.Icon(
            this.color,       // Dash Color
            this.icon_name,   // Icon name / asset path
            this.icon_height, // Height...
            1                 // Size mult for the icon, within the container
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
        this.icon.html.stop().animate({"opacity": 1}, 50);
    };

    this.on_hover_out = function(){
        this.icon.html.stop().animate({"opacity": this.icon_default_opacity}, 100);
    };

    this.setup_icon();

};
