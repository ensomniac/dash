function DashGuiSelectorMenuTray (selector_menu) {

    this.selector_menu = selector_menu;
    this.color         = this.selector_menu.color;
    this.icon_size     = this.selector_menu.icon_size;

    this.item_height = Dash.Size.RowHeight   * 2;
    this.item_width  = Dash.Size.ColumnWidth * 2;

    this.num_rows = 3;
    this.num_cols = 1;

    this.html  = $("<div class='SelectorMenuTray'></div>");
    this.close_skirt = $("<div></div>");
    this.background  = $("<div></div>");
    this.content     = $("<div></div>");

    this.setup_styles = function () {

        this.html.css({
            "position": "absolute",
            "left":   0,
            "right":  0,
            "top":    0,
            "bottom": 0,
            "pointer-events": "none",
            "user-select":    "none",
        });

        this.background.css({
            "position": "fixed",
            "left":   0,
            "top":    0,
            "width": 500,
            "height": Dash.Size.ColumnWidth * 3,
            "background": "rgba(255, 255, 255, 0.0)",
            "pointer-events": "auto",
            "user-select":    "none",
        });

        this.close_skirt.css({
            "position": "fixed",
            "left":   0,
            "top":    0,
            "right": 0,
            "bottom": 0,
            "background": "rgba(0, 0, 0, 0.3)",
            "pointer-events": "auto",
            "user-select":    "none",
        });

        this.content.css({
            "position": "absolute",
            "display":  "flex",
            "flex-wrap": "wrap",
            "justify-content": "left",
            "align-items": "flex-start",
            "align-content": "flex-start",
            "left":   0,
            "top":    0,
            "right":  0,
            "bottom": 0,
            "border-radius":  Dash.Size.BorderRadius,
            "background":     this.color.Background,
            // "background":     "blue",
            "pointer-events": "auto",
            "user-select":    "none",
            "box-shadow": "0px 10px 30px 0px rgba(0, 0, 0, 0.5)",
            "padding-left": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding,
        });

        this.background.append(this.content);

        (function(self){

            self.close_skirt.click(function(){
                self.Hide();
            });

            self.content.click(function(event){
                event.preventDefault();
                return false;
            });

            self.background.click(function(){
                self.Hide();
            });

            self.background.on("mouseleave", function(){
                self.Hide();
            });

        })(this);

    };

    this.get_content_size = function () {

        var row_padding = (Dash.Size.Padding * 1) + (Dash.Size.Padding * (this.num_rows - 1));
        var col_padding = (Dash.Size.Padding * 1) + (Dash.Size.Padding * (this.num_cols - 1));

        var content_size = {};
        content_size["width"]  = (this.item_width * this.num_cols)  + col_padding;
        content_size["height"] = (this.item_height * this.num_rows) + row_padding;

        return content_size;

    };

    this.rebuild_items = function () {

        if (this.selector_menu.items.length <= 3) {
            this.num_rows = 3;
            this.num_cols = 1;
        }
        else if (this.selector_menu.items.length <= 6) {
            this.num_rows = 3;
            this.num_cols = 2;
        }
        else if (this.selector_menu.items.length <= 9) {
            this.num_rows = 3;
            this.num_cols = 3;
        }
        else if (this.selector_menu.items.length <= 12) {
            this.num_rows = 4;
            this.num_cols = 3;
        }
        else if (this.selector_menu.items.length <= 15) {
            this.num_rows = 5;
            this.num_cols = 3;
        }
        else if (this.selector_menu.items.length <= 20) {
            this.num_rows = 5;
            this.num_cols = 4;
        };

        this.content.empty();

        for (var x in this.selector_menu.items) {
            var item_details = this.selector_menu.items[x];
            var item = new DashGuiSelectorItem(this, item_details);
            this.content.append(item.html);
        };

        this.selector_menu.items_built = true;

    };

    this.Show = function () {

        if (!this.selector_menu.items_built) {
            this.rebuild_items();
        };

        this.close_skirt.stop();
        this.background.stop();
        this.content.stop();

        this.content_size = this.get_content_size();

        var offset = this.selector_menu.html.offset();
        var ex_mouse_buffer_px = this.selector_menu.size * 2;

        this.close_skirt.css({
            "opacity": 0,
        });

        this.background.css({
            "left": offset["left"] - ex_mouse_buffer_px,
            "top":  offset["top"]  - ex_mouse_buffer_px,
            "width":  this.content_size["width"]  + (ex_mouse_buffer_px * 2),
            "height": this.content_size["height"] + (ex_mouse_buffer_px * 2),
        });

        this.content.css({
            "left":   ex_mouse_buffer_px,
            "top":    ex_mouse_buffer_px + this.selector_menu.size,
            "width":  this.content_size["width"],
            "height": 1,
            "overflow": "hidden",
        });

        $("body").append(this.close_skirt);
        $("body").append(this.background);

        this.close_skirt.stop().animate({"opacity": 1}, 300);

        this.content.animate({"height": this.content_size["height"]}, 200);

    };

    this.Hide = function () {

        (function(self){

            self.close_skirt.stop().animate({"opacity": 0}, 300, function(){
                self.close_skirt.detach();
            });

            self.content.stop().animate({"height": 1}, 200, function(){
                self.background.detach();
            });

        })(this);

    };

    this.setup_styles();

}
