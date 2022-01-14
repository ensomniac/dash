function DashGuiSearchableListSearchInput (slist) {

    this.slist      = slist;
    this.color      = this.slist.color;
    this.row_height = this.slist.row_height;

    this.icon_size    = this.row_height-(Dash.Size.Padding*1.5);
    this.input        = new Dash.Gui.Input("Search...", this.color);
    this.icon_search  = new Dash.Gui.Icon(this.color, "search", this.icon_size);
    this.icon_clear   = new Dash.Gui.Icon(this.color, "delete", this.icon_size);
    this.html         = this.input.html;

    this.current_search_term = "";
    this.clear_icon_visible  = false;

    this.setup_styles = function () {

        this.input.OnChange(this.on_search, this);

        this.html.append(this.icon_search.html);
        this.html.append(this.icon_clear.html);

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": this.row_height,
            "border-bottom": "1px solid " + this.color.Pinstripe,
            "background": Dash.Color.Lighten(this.color.Background, 10),
            "box-shadow": "none",
            "margin-right": 0,
            "padding-right": this.row_height + Dash.Size.Padding*0.5,
        });

        this.icon_search.html.css({
            "position": "absolute",
            "right": Dash.Size.Padding*0.66,
            "top": Dash.Size.Padding*0.66,
            "pointer-events": "none",
            "user-select":    "none",
        });

        this.icon_clear.html.css({
            "position": "absolute",
            "right": Dash.Size.Padding*0.66,
            "top": Dash.Size.Padding*0.66,
            "user-select":    "none",
            "cursor": "pointer",
            "opacity": 0,
        });

        (function(self){
            self.icon_clear.html.click(function(){
                self.clear_search();
            });
        })(this);

    };

    this.clear_search = function () {
        this.input.SetText("");
        this.hide_clear_icon();
        this.on_search();
    };

    this.on_search = function () {

        var _current_search_term = this.input.Text();

        if (_current_search_term == this.current_search_term) {
            return;
        };

        this.current_search_term = _current_search_term;

        if (this.current_search_term.length > 0) {
            this.show_clear_icon();
        }
        else {
            this.hide_clear_icon();
        };

        this.slist.SetSearchTerm(this.current_search_term);

    };

    this.show_clear_icon = function () {

        if (this.clear_icon_visible) {
            return;
        };

        this.clear_icon_visible = true;
        this.icon_search.html.stop().animate({"opacity": 0}, 250);
        this.icon_clear.html.stop().animate( {"opacity": 1}, 250);

    };

    this.hide_clear_icon = function () {
        if (!this.clear_icon_visible) {
            return;
        };

        this.clear_icon_visible = false;
        this.icon_search.html.stop().animate({"opacity": 1}, 250);
        this.icon_clear.html.stop().animate( {"opacity": 0}, 250);

    };

    this.setup_styles();

};
