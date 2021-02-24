
function DashGuiLayoutTabs(Binder){

    this.html = $("<div></div>");
    this.binder = Binder;
    this.recall_id = (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase();

    this.list = $("<div></div>");
    this.content = $("<div></div>");

    this.all_content = [];
    this.selected_index = -1;

    this.width = Dash.Size.ColumnWidth;
    this.background_color = Dash.Color.Dark;
    this.is_sub = false;

    this.color_selected = Dash.Color.Primary;
    this.color_default = Dash.Color.ButtonColor;

    this.setup_styles = function(){

        this.html.append(this.list);
        this.html.append(this.content);

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            // "background": "red",
        });

        this.list.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
        });

        this.content.css({
            "position": "absolute",
            "left": this.width,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": Dash.Color.Light,
            "overflow-y": "auto",
        });

        this.update_styles();

        (function(self){
            requestAnimationFrame(function(){
                self.load_last_selection();
            });
        })(this);

    };

    this.update_styles = function(){
        // Called to style anything that might change between the default behavior and the sub style

        var sub_border = "none";
        var box_shadow = "none";

        this.color_selected = Dash.Color.Primary;
        this.color_default = Dash.Color.ButtonColor;
        this.width = Dash.Size.ColumnWidth;
        this.background_color = Dash.Color.Dark;

        if (this.is_sub) {
            this.width = Dash.Size.ColumnWidth*0.5;
            // this.background_color = "rgba(0, 0, 0, 0)";
            // this.color_selected = LightBackgroundColor;
            // this.color_default = DarkPanelColor;
            sub_border =  "1px solid " + "rgba(255, 255, 255, 0.1)";
            box_shadow = "inset -20px -10px 20px 0px rgba(0, 0, 0, 0.11)";
        };

        this.list.css({
            "width": this.width,
            "background": this.background_color,
            "border-left": sub_border,
            "box-shadow": box_shadow,
        });

        this.content.css({
            "left": this.width,
        });

        for (var i in this.all_content) {
            this.style_button_content(this.all_content[i]);
        };

    };

    this.SetSubMenu = function(is_sub){
        this.is_sub = is_sub;
        this.update_styles();
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
                // content_data["button"].SetColor(this.color_selected);
                button = content_data["button"];
            }
            else {
                content_data["button"].SetSelected(false);
                // content_data["button"].SetColor(this.color_default);
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

    };

    this.style_button_content = function(content_data){

        content_data["button"].SetTextAlign("left");
        content_data["button"].html.css({
            // "margin": 0,
            // "padding-left": d.Size.Padding,
            // "padding-right": d.Size.Padding,
            // "padding-top": d.Size.Padding*0.5,
            // "padding-bottom": d.Size.Padding*0.5,
            "margin-bottom": 1,
        });

        content_data["button"].SetBorderRadius(0);

        content_data["button"].label.css({
            "font-size": "85%",
            // "font-family": "sans_serif_bold",
        });

        if (this.is_sub) {
            // content_data["button"].html.css({
            //     "background": "black",
            // });

            // content_data["button"].highlight.css({
            //     "background": "orange",
            // });
        };

    };

    this.Add = function(label_text, content_div_html_class){

        var content_data = {};
        content_data["label_text"] = label_text;
        content_data["content_div_html_class"] = content_div_html_class;
        content_data["button"] = null;

        (function(self, index){
            content_data["button"] = new d.Gui.Button(label_text, function(){
                self.LoadIndex(index);
            }, self);
        })(this, this.all_content.length);

        this.list.append(content_data["button"].html);
        this.style_button_content(content_data);
        this.all_content.push(content_data);

        return content_data["button"];

    };

    this.setup_styles();

};
