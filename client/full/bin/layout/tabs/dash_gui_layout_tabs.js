class DashGuiLayoutTabs {

    // TODO - convert this to a proper class
    constructor(Binder, side_tabs) {

    this.html = $("<div></div>");
    this.binder = Binder;
    this.recall_id = (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase();
    this.side_tabs = side_tabs;

    if (this.side_tabs) {
        this.color = Dash.Color.Dark;
    }
    else {
        this.color = Dash.Color.Light;
    };

    this.list_backing = $("<div></div>");
    this.list_top = $("<div></div>");
    this.list_bottom = $("<div></div>");

    this.content = $("<div></div>");

    this.all_content = [];
    this.selected_index = -1;

    this.size = Dash.Size.ColumnWidth; // Thickness

    this.setup_styles = function(){

        this.html.append(this.list_backing);
        this.html.append(this.list_top);
        this.html.append(this.list_bottom);
        this.html.append(this.content);

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
        });

        if (this.side_tabs) {
            this.set_styles_for_side_tabs();
        }
        else {
            this.set_styles_for_top_tabs();
        };

        this.update_styles();

        (function(self){
            requestAnimationFrame(function(){
                self.load_last_selection();
            });
        })(this);

    };

    this.OnTabChanged = function(callback){
        this.on_tab_changed_cb = callback.bind(this.binder);
    };

    this.set_styles_for_side_tabs = function(){

        this.list_backing.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
        });

        this.list_top.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
        });

        this.list_bottom.css({
            "position": "absolute",
            "left": 0,
            "bottom": 0,
        });

        // The right side / non-tab area / content
        this.content.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "overflow-y": "auto",
            "background": Dash.Color.Light.Background,
        });

    };

    this.set_styles_for_top_tabs = function(){

        this.list_backing.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
        });

        this.list_top.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "display": "flex",
        });

        this.list_bottom.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "display": "flex",
        });

        // The right side / non-tab area / content
        this.content.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "overflow-y": "auto",
            "background": Dash.Color.Light.Background,
        });

    };

    this.update_styles_for_side_tabs = function(){

        var sub_border = "none";
        var box_shadow = "none";

        box_shadow = "0px 0px 20px 10px rgba(0, 0, 0, 0.2)";

        this.size = Dash.Size.ColumnWidth;

        this.list_backing.css({
            "width": this.size,
            "background": this.color.Background,
        });

        this.list_top.css({
            "width": this.size,
        });

        this.list_bottom.css({
            "width": this.size,
        });

        this.content.css({
            "left": this.size,
            "box-shadow": box_shadow,
        });

    };

    this.update_styles_for_top_tabs = function(){

        var sub_border = "none";
        var box_shadow = "none";

        box_shadow = "inset 0px 0px 10px 1px rgba(0, 0, 0, 0.2)";
        this.size = Dash.Size.RowHeight+(Dash.Size.Padding);

        this.list_backing.css({
            "height": this.size,
            // "background": this.color.TabBackground,
            "background": this.color.Tab.AreaBackground,
            // "box-shadow": box_shadow,
        });

        this.list_top.css({
            "height": this.size,
        });

        this.list_bottom.css({
            "height": this.size,
        });

        this.content.css({
            "top": this.size,
        });

    };

    this.update_styles = function(){
        // Called to style anything that might change between
        // the default behavior and the sub style

        if (this.side_tabs) {
            this.update_styles_for_side_tabs();
        }
        else {
            this.update_styles_for_top_tabs();
        };

    };

    this.load_last_selection = function(){

        if (this.selected_index != -1) {
            // A selection was already made externally
            return;
        };

        if (this.all_content.length == 0) {
            return;
        };

        var last_index = parseInt(d.Local.Get("sidebar_index_" + this.recall_id)) || 0;

        if (last_index > this.all_content.length-1) {
            last_index = 0;
        };

        this.LoadIndex(last_index);

    };

    this.LoadIndex = function(index){

        if (index > this.all_content.length-1) {
            return;
        };

        d.Local.Set("sidebar_index_" + this.recall_id, index);
        var button = null;

        for (var i in this.all_content) {
            var content_data = this.all_content[i];

            if (i == index) {
                content_data["button"].SetSelected(true);
                button = content_data["button"];
            }
            else {
                content_data["button"].SetSelected(false);
            };

        };

        this.content.empty();

        var content_html = null;
        if (("" + typeof(this.all_content[index]["content_div_html_class"])) == "object") {
            content_html = this.all_content[index]["content_div_html_class"];
        }
        else if (("" + typeof(this.all_content[index]["content_div_html_class"])) == "function") {
            content_html = new this.all_content[index]["content_div_html_class"]().html;
        }
        else {
            content_html = this.all_content[index]["content_div_html_class"].bind(this.binder)(button);
        };

        if (!content_html) {
            console.log("ERROR: Unknown content!");
            content_html = $("<div>Error Loading Content</div>");
        };

        this.content.append(content_html);

        if (this.on_tab_changed_cb) {
            this.on_tab_changed_cb(this.all_content[index]);
        };

    };

    this.AppendHTML = function(html){
        this.list_top.append(html);
    };

    this.AppendImage = function(img_url){

        // TODO: Move the concept of an 'Image' into dash as a light
        // abstraction for managing aspect ratios

        // TODO: This AppendImage is a hack. We need to revise the
        // stack of objects in this container so they derive from
        // some abstraction to simplify append/prepend

        var image = $("<div></div>");

        image.css({
            "height": Dash.Size.RowHeight*2,
            "background-image": "url(" + img_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center",
        });

        this.list_top.append(image);

    };

    this.Append = function(label_text, content_div_html_class, optional_params){
        return this._add(label_text, content_div_html_class, this.list_top, optional_params);
    };

    this.Prepend = function(label_text, content_div_html_class, optional_params){
        return this._add(label_text, content_div_html_class, this.list_bottom, optional_params);
    };

    this._add = function(label_text, content_div_html_class, anchor_div, optional_params){

        optional_params = optional_params || {};

        var content_data = {};
        content_data["label_text"] = label_text;
        content_data["content_div_html_class"] = content_div_html_class;
        content_data["button"] = null;
        content_data["optional_params"] = optional_params;

        var button_options = {};

        if (this.side_tabs) {
            button_options["style"] = "tab_side";
        }
        else {
            button_options["style"] = "tab_top";
        };

        (function(self, index, button_options){

            content_data["button"] = new d.Gui.Button(
                label_text,                         // Label
                function(){self.LoadIndex(index);}, // Callback
                self,                               // Binder
                self.color,                         // Dash Color Set
                button_options                      // Options
            );

        })(this, this.all_content.length, button_options);

        anchor_div = anchor_div || this.list_top;
        anchor_div.append(content_data["button"].html);

        this.all_content.push(content_data);

        return content_data["button"];

    };

    this.setup_styles();

    };
};
