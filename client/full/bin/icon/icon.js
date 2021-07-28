function DashIcon (color, icon_name, container_size, icon_size_mult, icon_color=null) {
    this.color = color || Dash.Color.Light;
    this.theme = "light";

    this.html = $("<div class='GuiIcon'></div>");
    this.icon_html = null;

    this.name = icon_name || "unknown";
    this.size = container_size || Dash.Size.RowHeight;
    this.size_mult = icon_size_mult || 1;
    this.icon_definition = new GuiIcons(this);
    this.icon_color = icon_color ||this.color.Text;

    if (this.color.Button.Background.Icon && !icon_color) {
        this.icon_color = this.color.Button.Background.Icon;
    };

    if (!this.color.Text) {
        console.log("Error: Incorrect color object passed to DashIcon:", this.color);
        console.trace();
        debugger;
    }

    this.setup_styles = function () {

        this.html.css({
            "width": this.size,
            "height": this.size,
            "margin": 0,
            "padding": 0,
            "cursor": "pointer",
            "-webkit-user-select": "none"
        });

        this.icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');
        this.icon_html.css(this.icon_definition.get_css());
        this.html.append(this.icon_html);

    };

    // this.update = function (icon_id) {
    //     this.id = icon_id;
    //     this.url = ICON_MAP["url_prefix"] + ICON_MAP["icons"][this.id][0];
    //     this.default_size = ICON_MAP["icons"][this.id][1];
    // };

    this.SetIcon = function(icon_name, color=this.icon_color){

        this.name = icon_name || "unknown";
        this.icon_definition = new GuiIcons(this);

        var icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');
        icon_html.css(this.icon_definition.get_css());
        this.html.append(icon_html);

        if (this.icon_html) {
            this.icon_html.remove();
        };

        this.icon_html = icon_html;

    };

    this.setup_styles();

}
