function DashGuiLayoutTabs(binder, side_tabs) {
    this.binder = binder;
    this.side_tabs = side_tabs;

    this.all_content = [];
    this.selected_index = -1;
    this.current_index = null;
    this.html = $("<div></div>");
    this.tab_top = $("<div></div>");
    this.tab_bottom = $("<div></div>");
    this.content_area = $("<div></div>");
    this.recall_id = (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase();

    if (this.side_tabs) {
        this.color = Dash.Color.Dark;
        this.tab_area = $("<div></div>");
        this.tab_middle = $("<div></div>");
        this.tab_area_size = Dash.Size.ColumnWidth;
    }

    else {
        // TODO: This should probably also be converted to a better div grouping

        this.color = Dash.Color.Light;
        this.list_backing = $("<div></div>");
        this.tab_area_size = Dash.Size.RowHeight + Dash.Size.Padding;
    }

    this.setup_styles = function () {
        if (this.side_tabs) {
            this.set_styles_for_side_tabs();
        }

        else {
            this.set_styles_for_top_tabs();
        }

        (function (self) {
            requestAnimationFrame(function () {
                self.load_last_selection();
            });
        })(this);
    };

    this.OnTabChanged = function (callback) {
        this.on_tab_changed_cb = callback.bind(this.binder);
    };

    this.GetCurrentIndex = function () {
        return this.current_index;
    };

    this.LoadIndex = function (index) {
        if (index > this.all_content.length-1) {
            return;
        }

        Dash.Local.Set("sidebar_index_" + this.recall_id, index);

        this.current_index = index;

        var button = null;

        for (var i in this.all_content) {
            var content_data = this.all_content[i];

            if (parseInt(i) === parseInt(index)) {
                content_data["button"].SetSelected(true);
                button = content_data["button"];
            }

            else {
                content_data["button"].SetSelected(false);
            }
        }

        this.content_area.empty();

        var content_html;

        if (typeof this.all_content[index]["content_div_html_class"] === "object") {
            content_html = this.all_content[index]["content_div_html_class"];
        }

        else if (typeof this.all_content[index]["content_div_html_class"] === "function") {
            content_html = new this.all_content[index]["content_div_html_class"]().html;
        }

        else {
            content_html = this.all_content[index]["content_div_html_class"].bind(this.binder)(button);
        }

        if (!content_html) {
            console.log("ERROR: Unknown content!");

            content_html = $("<div>Error Loading Content</div>");
        }

        this.content_area.append(content_html);

        if (this.on_tab_changed_cb) {
            this.on_tab_changed_cb(this.all_content[index]);
        }
    };

    this.AppendHTML = function (html) {
        html.css({
            "margin-bottom": 1,
        });

        
        this.tab_top.append(html);
    };

    this.MidpendHTML = function (html) {
        if (!this.side_tabs) {
            console.log("MidpendHTML only works for side tabs right now");

            return;
        }

        html.css({
            "margin-top": 1,
            "margin-bottom": 1
        });

        this.tab_middle.append(html);
    };

    this.PrependHTML = function (html) {
        html.css({
            "margin-top": 1,
        });

        this.tab_bottom.append(html);
    };

    this.AppendImage = function (img_url, height=null) {
        // TODO: Move the concept of an 'Image' into dash as a light abstraction for managing aspect ratios

        // TODO: This AppendImage is a hack. We need to revise the stack of objects in this
        //  container so they derive from some abstraction to simplify append/prepend

        var image = $("<div></div>");

        image.css({
            "height": height || Dash.Size.RowHeight * 2,
            "background-image": "url(" + img_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center",
        });

        this.tab_top.append(image);

        return image;
    };

    this.Append = function (label_text, content_div_html_class, optional_params) {
        return this._add(label_text, content_div_html_class, this.tab_top, optional_params);
    };

    this.Midpend = function (label_text, content_div_html_class, optional_params) {
        if (!this.side_tabs) {
            console.log("Midpend only works for side tabs right now");

            return;
        }

        return this._add(label_text, content_div_html_class, this.tab_middle, optional_params);
    };

    this.Prepend = function (label_text, content_div_html_class, optional_params) {
        return this._add(label_text, content_div_html_class, this.tab_bottom, optional_params);
    };

    this.set_styles_for_side_tabs = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.content_area.css({
            "position": "absolute",
            "top": 0,
            "left": this.tab_area_size,
            "bottom": 0,
            "right": 0
        });

        this.tab_area.css({
            "display": "flex",
            "flex-direction": "column",
            "position": "absolute",
            "top": 0,
            "left": 0,
            "bottom": 0,
            "width": this.tab_area_size,
            "background": this.color.Background
        });

        this.tab_top.css({
            "width": this.tab_area_size
        });

        this.tab_middle.css({
            "margin-top": Dash.Size.Padding * 0.2,
            "margin-bottom": Dash.Size.Padding * 0.2,
            "flex-grow": 2,
            "overflow-y": "auto",
            "width": this.tab_area_size
        });

        this.tab_bottom.css({
            "width": this.tab_area_size
        });

        this.tab_area.append(this.tab_top);
        this.tab_area.append(this.tab_middle);
        this.tab_area.append(this.tab_bottom);

        this.html.append(this.content_area);
        this.html.append(this.tab_area);
    };

    this.set_styles_for_top_tabs = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0
        });

        this.list_backing.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": this.tab_area_size,
            "background": this.color.Tab.AreaBackground
        });

        this.tab_top.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "display": "flex",
            "height": this.tab_area_size
        });

        this.tab_bottom.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "display": "flex",
            "height": this.tab_area_size
        });

        // The right side / non-tab area / content
        this.content_area.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "background": Dash.Color.Light.Background,
            "top": this.tab_area_size
        });

        this.html.append(this.list_backing);
        this.html.append(this.tab_top);
        this.html.append(this.tab_bottom);
        this.html.append(this.content_area);
    };

    this.load_last_selection = function () {
        if (parseInt(this.selected_index) !== -1) {
            // A selection was already made externally
            return;
        }

        if (this.all_content.length === 0) {
            return;
        }

        var last_index = parseInt(Dash.Local.Get("sidebar_index_" + this.recall_id)) || 0;

        if (last_index > this.all_content.length-1) {
            last_index = 0;
        }

        this.LoadIndex(last_index);
    };

    this._add = function (label_text, content_div_html_class, anchor_div, optional_params={}) {
        var content_data = {
            "label_text": label_text,
            "content_div_html_class": content_div_html_class,
            "button": null,
            "optional_params": optional_params
        };

        (function (self, index) {
            var style = self.side_tabs ? "tab_side" : "tab_top";

            content_data["button"] = new Dash.Gui.Button(
                label_text,                         // Label
                function () {                       // Callback
                    self.LoadIndex(index);
                },
                self,                               // Binder
                self.color,                         // Dash Color Set
                {"style": style}                    // Options
            );
        })(this, this.all_content.length);

        anchor_div = anchor_div || this.tab_top;

        anchor_div.append(content_data["button"].html);

        this.all_content.push(content_data);

        return content_data["button"];
    };

    this.setup_styles();
}
