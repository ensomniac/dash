function DashGuiPaneSlider(binder, is_vertical, default_size){

    this.binder = binder;
    this.is_vertical = is_vertical || false;
    this.default_size = default_size || Dash.Size.ColumnWidth;

    this.html = $("<div></div>");
    this.content_a = $("<div></div>");
    this.content_b = $("<div></div>");
    this.divider = $("<div></div>");
    this.divider_hover = $("<div></div>");

    this.recall_id = "dash_pane_" + (this.binder.constructor + "").replace(/[^A-Za-z]/g, "")
    this.recall_id = this.recall_id.slice(0, 100).trim().toLowerCase();

    this.locked_width = this.default_size;

    if (Dash.Local.Get(this.recall_id)) {
        this.locked_width = parseInt(Dash.Local.Get(this.recall_id));
    };

    this.divider_size = Dash.Size.Padding*0.1;
    this.divider_hover_size = Dash.Size.Padding*1.5; // A slightly larger size for dragging
    this.min_width = this.default_size || Dash.Size.ColumnWidth*0.5;

    this.divider_color = "rgba(0, 0, 0, 0.2)";
    this.divider_color_active = "rgba(0, 0, 0, 0.6)";

    this.drag_properties = {};

    this.SetPaneContentA = function(html){
        this.content_a.empty().append(html);
    };

    this.SetPaneContentB = function(html){
        this.content_b.empty().append(html);
    };

    this.setup_styles = function(){

        this.html.append(this.content_a);
        this.html.append(this.content_b);
        this.html.append(this.divider);
        this.html.append(this.divider_hover);

        this.html.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "bottom": 0,
        });

        if (this.is_vertical) {
            this.setup_vertical();
        }
        else {
            this.setup_horizontal();
        };

        this.draw();

    };

    this.setup_vertical = function(){

        this.content_a.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "overflow-y": "auto",
        });

        this.content_b.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "overflow-y": "auto",
        });

        this.divider.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "height": this.divider_size,
            "background": this.divider_color,
        });

        this.divider_hover.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "bottom": 0,
            "height": this.divider_hover_size,
            "background": "rgba(0, 0, 0, 0)",
            "opacity": 0.5,
            "cursor": "ns-resize",
        });

    };

    this.setup_horizontal = function(){

        this.content_a.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "overflow-x": "auto",
        });

        this.content_b.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "overflow-x": "auto",
        });

        this.divider.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": this.divider_size,
            "background": this.divider_color,
        });

        this.divider_hover.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": this.divider_hover_size,
            "background": "rgba(0, 0, 0, 0)",
            "opacity": 0.5,
            "cursor": "ew-resize",
        });

    };

    this.setup_connections = function(){

        (function(self){

            self.divider_hover.mouseenter(function(){

                self.divider.css({
                    "background": self.divider_color_active,
                });

            });

            self.divider_hover.mouseleave(function(){

                self.divider.css({
                    "background": self.divider_color,
                });

            });

            self.html.mousemove(function(e){

                if (self.drag_active) {

                    if (self.is_vertical) {
                        self.drag_properties["last_pos"] = e.screenY;
                    }
                    else {
                        self.drag_properties["last_pos"] = e.screenX;
                    };

                    self.on_drag();
                };

            });

            self.divider_hover.mousedown(function(e){

                if (!self.drag_active) {
                    self.drag_active = true;
                    self.drag_properties["start_locked_width"] = self.locked_width;

                    if (self.is_vertical) {
                        self.drag_properties["start_pos"] = e.screenY;
                    }
                    else {
                        self.drag_properties["start_pos"] = e.screenX;
                    };

                    self.on_draw_start();
                };

            });

            self.html.mouseup(function(e){
                if (!self.drag_active) {return;};

                if (self.drag_active) {
                    self.drag_active = false;
                    self.on_draw_end();
                };

            });

        })(this);

    };

    this.on_draw_start = function(){
        // Called when dragging starts
    };

    this.on_draw_end = function(){
        // Called when dragging ends
        Dash.Local.Set(this.recall_id, this.locked_width);
    };

    this.on_drag = function(){
        this.drag_properties["change"] = this.drag_properties["start_pos"]-this.drag_properties["last_pos"];
        var width_now = this.locked_width;
        this.locked_width = this.drag_properties["start_locked_width"] + this.drag_properties["change"];

        var content_a_size = 0;

        if (this.is_vertical) {
            content_a_size = this.html.height()-this.locked_width;
        }
        else {
            content_a_size = this.html.width()-this.locked_width;
        };

        if (content_a_size < this.min_width) {
            // Clamp content A
            this.locked_width = width_now;
        };

        if (this.locked_width < this.min_width) {
            // Clamp content B
            this.locked_width = this.min_width;
        };

        this.draw();
    };

    this.draw = function(){

        if (this.is_vertical) {
            this.draw_vertical();
        }
        else {
            this.draw_horizontal();
        };

    };

    this.draw_vertical = function(){

        this.content_a.css({
            "bottom": this.locked_width+(this.divider_size*0.5),
        });

        this.content_b.css({
            "height": this.locked_width-(this.divider_size*0.5),
        });

        this.divider.css({
            "bottom": this.locked_width-(this.divider_size*0.5),
            "top": "auto",
        });

        this.divider_hover.css({
            "bottom": this.locked_width-(this.divider_hover_size*0.5),
            "top": "auto",
        });

    };

    this.draw_horizontal = function(){

        this.content_a.css({
            "right": this.locked_width+(this.divider_size*0.5),
        });

        this.content_b.css({
            "width": this.locked_width-(this.divider_size*0.5),
            "left": "auto",
        });

        this.divider.css({
            "right": this.locked_width-(this.divider_size*0.5),
            "left": "auto",
        });

        this.divider_hover.css({
            "right": this.locked_width-(this.divider_hover_size*0.5),
            "left": "auto",
        });

    };

    this.setup_styles();
    this.setup_connections();

};

