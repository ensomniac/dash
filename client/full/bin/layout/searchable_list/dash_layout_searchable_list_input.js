function DashLayoutSearchableListInput (list, on_search_cb=null, on_clear_cb=null) {
    this.list = list;
    this.on_search_cb = on_search_cb;
    this.on_clear_cb = on_clear_cb;

    this.html = null;
    this.color = this.list.color;
    this.current_search_term = "";
    this.clear_icon_visible = false;
    this.row_height = this.list.row_height;
    this.input = new Dash.Gui.Input("Search...", this.color);
    this.icon_size = this.row_height - (Dash.Size.Padding * 1.5);
    this.clear_icon = new Dash.Gui.Icon(this.color, "delete", this.icon_size);
    this.search_icon = new Dash.Gui.Icon(this.color, "search", this.icon_size);

    this.setup_styles = function () {
        this.html = this.input.html;

        this.input.OnChange(this.on_search, this);

        this.html.append(this.search_icon.html);
        this.html.append(this.clear_icon.html);

        this.search_icon.Mirror();

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
            "padding-right": this.row_height + Dash.Size.Padding * 0.5
        });

        this.search_icon.html.css({
            "position": "absolute",
            "right": Dash.Size.Padding * 0.66,
            "top": Dash.Size.Padding * 0.66,
            "pointer-events": "none",
            "user-select": "none"
        });

        this.clear_icon.html.css({
            "position": "absolute",
            "right": Dash.Size.Padding * 0.66,
            "top": Dash.Size.Padding * 0.66,
            "user-select": "none",
            "cursor": "pointer",
            "opacity": 0
        });

        (function (self) {
            self.clear_icon.html.on("click", function () {
                self.clear_search();
            });
        })(this);
    };

    this.clear_search = function () {
        this.input.SetText("");

        this.hide_clear_icon();
        this.on_search();

        if (this.on_clear_cb) {
            this.on_clear_cb();
        }
    };

    this.on_search = function () {
        var _current_search_term = this.input.Text();

        if (_current_search_term === this.current_search_term) {
            return;
        }

        this.current_search_term = _current_search_term;

        if (this.current_search_term.length > 0) {
            this.show_clear_icon();
        }

        else {
            this.hide_clear_icon();
        }

        // Require a min of 2 to search, but allow 0 to reset the list
        if (this.current_search_term.length === 1) {
            return;
        }

        if (this.on_search_cb) {
            this.on_search_cb(this.current_search_term);
        }

        else {
            this.list.OnSearchTermChanged(this.current_search_term);
        }
    };

    this.show_clear_icon = function () {
        if (this.clear_icon_visible) {
            return;
        }

        this.clear_icon_visible = true;

        this.search_icon.html.stop().animate({"opacity": 0}, 250);

        this.clear_icon.html.stop().animate( {"opacity": 1}, 250);
    };

    this.hide_clear_icon = function () {
        if (!this.clear_icon_visible) {
            return;
        }

        this.clear_icon_visible = false;

        this.search_icon.html.stop().animate({"opacity": 1}, 250);

        this.clear_icon.html.stop().animate( {"opacity": 0}, 250);
    };

    this.setup_styles();
}
