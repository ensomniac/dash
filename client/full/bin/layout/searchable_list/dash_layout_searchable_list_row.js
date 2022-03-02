function DashLayoutSearchableListRow (slist, row_id, optional_row_data) {

    this.slist      = slist;
    this.color      = this.slist.color;
    this.row_height = this.slist.row_height;
    this.row_id     = row_id;

    this.on_row_draw_callback = this.slist.on_row_draw_callback;
    this.get_data_callback = this.slist.get_data_callback;

    this.html          = $("<div></div>");
    this.content_layer = $("<div></div>");
    this.hover         = $("<div></div>");
    this.display_name_label = null;
    this.pending_update = null;
    this.observer = null;
    this.is_visible = false;
    this.cached_draw_response = null;
    this.pending_drawable = null;

    this.setup_styles = function () {

        this.html.append(this.hover);
        this.html.append(this.content_layer);

        this.html.css({
            "height": this.row_height,
            "line-height": Dash.Size.ButtonHeight + "px",
            "border-bottom": "1px solid " + this.color.Pinstripe,
            "border-top": "1px solid " + "rgba(0, 0, 0, 0)",
            "cursor": "pointer",
            "user-select": "none",
        });

        this.hover.css({
            "position": "absolute",
            "background": "rgba(255, 255, 255, 0.5)",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "pointer-events": "none",
            "user-select": "none",
            "opacity": 0,
        });

        this.setup_connections();

        (function(self){
            // This has to process on the next frame since
            // the dom elements aren't attached this frame
            requestAnimationFrame(function(){
                self.initialize_visibility();
            });
        })(this);

    };

    this.initialize_visibility = function(){

        if (this.observer) {
            return;
        };

        this.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting){
                this.on_visible();
            } else {
                this.on_hidden();
            }
        });

        this.observer.observe(this.html[0]);

    };

    this.on_visible = function () {
        this.is_visible = true;

        if (this.pending_update) {
            this.pending_update = false;
            this.cached_draw_response = this.pending_drawable(this.row_id);
        };

    };

    this.on_hidden = function () {
        this.is_visible = false;
    };

    this.SetContent = function (html) {
        this.content_layer.empty().append(html);
    };

    // Call to redraw / on new data
    this.Update = function () {

        var search_term = null;
        this.pending_drawable = this.on_row_draw_callback || this.update_display_name_label.bind(this);

        if (this.visible) {
            this.cached_draw_response = this.pending_drawable(this.row_id);
            return this.cached_draw_response;
        }
        else {
            this.pending_update = true;
            return this.cached_draw_response || this.get_data_callback()[this.row_id]["display_name"] || this.row_id;
        };

    };

    this.setup_display_name_label = function () {
        // The display name label is used if there is no callback to draw the
        // row. This can be useful for simply populating a list of elements

        this.display_name_label = $("<div></div>");

        this.display_name_label.css({
            "height": Dash.Size.ButtonHeight,
            "line-height": Dash.Size.ButtonHeight + "px",
            "padding-left": Dash.Size.Padding * 0.5,
            "color": this.color.Text,
        });

        this.content_layer.empty().append(this.display_name_label);

    };

    this.update_display_name_label = function (row_id, text="") {
        if (!this.display_name_label) {
            this.setup_display_name_label();
        }

        if (!text) {
            text = this.get_data_callback()[this.row_id]["display_name"] || this.row_id;
        }

        this.display_name_label.text(text);

        return text;
    };

    this.SetActive = function (is_active) {

        if (is_active) {

            this.html.css({
                "border-top": "1px solid " + "rgba(255, 255, 255, 0.5)",
                "background": Dash.Color.Light.AccentGood,
            });

            this.content_layer.css({
                "opacity": 1.0,
            });

        }
        else {

            this.html.css({
                "background": "none",
                "border-top": "1px solid " + "rgba(0, 0, 0, 0)",
            });

            this.content_layer.css({
                "opacity": 0.6,
            });

        };

    };

    this.setup_connections = function () {

        (function (self) {

            self.html.click(function () {
                self.slist.SetActiveRowID(self.row_id);
            });

            self.html.mouseenter(function () {
                self.hover.stop().animate({"opacity": 1}, 50);
            });

            self.html.mouseleave(function () {
                self.hover.stop().animate({"opacity": 0}, 100);
            });

        })(this);

    };

    this.setup_styles();

};
