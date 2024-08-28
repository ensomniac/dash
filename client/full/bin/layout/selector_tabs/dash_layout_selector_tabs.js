class DashLayoutSelectorTabs {

    constructor (binder, layout_name) {

        this.binder = binder;
        this.color  = this.binder.color || Dash.Color.Light;
        this.layout_name = layout_name;

        this.layout         = new Dash.Layout.Tabs.Top(
                                this,
                                this.layout_name,
                                this.color
                            );

        this.html             = this.layout.html;
        this.selector_menu    = null;
        this.new_button       = null;
        this.first_tab        = null;
        this.on_new_callback  = null;

        // this.active_ss_id     = Dash.Local.Get("active_ss_id");
        // this.data             = null;
        // this.song_selector    = null;
        // this.details_tab      = null;
        // this.active_tab       = null;
        // this.active_tab_name  = null;
        // this.initialized      = false;
        // this.active_set_data  = null;

        this.setup_styles();

    };

    setup_styles () {

        this.selector_menu = new Dash.Gui.SelectorMenu(
            this,
            this.on_selector_menu_clicked,
            "music",
            {"item_icon": "battle_axe"}
        );

        this.new_button = new Dash.Gui.Button(
            "Create New Item",
            this.on_new_button_clicked,
            this,
            this.color,
            {"style": "toolbar"}
        );

        this.new_button.html.css({
            "opacity": 0,
        });

        this.layout.AppendHTML(this.selector_menu.html);
        this.layout.PrependHTML(this.new_button.html);

        this.html.css({
            // "padding": Dash.Size.Padding,
        });

        (function(self){

            requestAnimationFrame(function(){
                self.new_button.html.css({"margin-top": Dash.Size.Padding * 0.5});
                self.new_button.html.stop().animate({"opacity": 1});
            });

        })(this);

    };

    on_selector_menu_clicked () {
        console.log("Menu Clicked");
    };

    on_new_button_clicked () {

        if (this.on_new_callback) {
            this.on_new_callback();
        }
        else {
            console.log("Dash.Warn: Missing callback for new button");
        };

    };

    SetNewItemCB (on_new_callback, label_text="") {

        this.on_new_callback = on_new_callback;

        if (label_text) {
            this.new_button.SetText(label_text);
        };

    };

    Append (a, b, c, d, e) {
        var tab = this.layout.Append(a, b, c, d, e);

        if (!this.first_tab) {
            this.first_tab = tab;
        };

        return tab;
    };

};







