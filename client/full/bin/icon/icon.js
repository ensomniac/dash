function DashIcon(color, icon_name, container_size, icon_size_mult) {

    this.color = color || Dash.Color.Light;
    this.theme = "light";

    this.html = $("<div class='GuiIcon'></div>");
    this.icon_html = null;

    this.name = icon_name || "unknown";
    this.size = container_size || Dash.Size.RowHeight;
    this.size_mult = icon_size_mult || 1;
    this.icon_definition = GuiIcons(this);

    this.setup_styles = function(){

        this.icon_html = $('<i class="' + this.icon_definition.get_class() + '"></i>');
        this.html.append(this.icon_html);

        this.html.css({
            "width": this.size,
            "height": this.size,
            "margin": 0,
            "padding": 0,
            "cursor": "pointer",
            "-webkit-user-select": "none",
        });

        this.icon_html.css(this.icon_definition.get_css());

    };

    this.update = function(icon_id){
        this.id = icon_id;
        this.url = ICON_MAP["url_prefix"] + ICON_MAP["icons"][this.id][0];
        this.default_size = ICON_MAP["icons"][this.id][1];

    };

    this.setup_styles();

};
