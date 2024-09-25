class DashLayoutSelectorTabs {

    constructor (binder, layout_name) {

        this.binder = binder;
        this.color  = this.binder.color || Dash.Color.Light;
        this.layout_name = layout_name;

        if (!this.layout_name) {
            console.error("DashLayoutSelectorTabs > Error: Invalid Layout Name: " + this.layout_name);
            console.trace();
            debugger;
        };

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
        this.on_selected_callback = null;
        this.menu_initialized = null;
        this.menu_items       = null;

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

        (function (self) {

            requestAnimationFrame(function () {
                self.new_button.html.css({"margin-top": Dash.Size.Padding * 0.5});
                self.new_button.html.stop().animate({"opacity": 1});
            });

        })(this);

    };

    on_selector_menu_clicked (menu_item) {
        // var item_id = menu_item["id"];
        this.LoadItem(menu_item["id"]);
        // console.log("Menu Item Selected: ", item_id);
    };

    on_new_button_clicked () {

        if (this.on_new_callback) {
            this.on_new_callback();
        }
        else {
            console.log("Dash.Warn: Missing callback for new button");
        };

    };

    get ls_key () {
        return this.layout_name + "_last_selected";
    };

    get ActiveContent () {
        return this.layout.active_content;
    };

    LoadLastSelectedItem () {
        var item_id = Dash.Local.Get(this.ls_key);

        if (!item_id && this.selector_menu.items.length > 0) {
            item_id = this.selector_menu.items[0]["id"];
        };

        if (item_id) {
            this.LoadItem(item_id);
        };

    };

    LoadItem (item_id) {

        Dash.Local.Set(this.ls_key, item_id);

        var menu_item = this.menu_items[item_id];

        if (menu_item && this.first_tab) {
            this.first_tab.SetText(menu_item["display_name"]);
        };

        if (this.on_selected_callback) {

            if (menu_item) {
                this.on_selected_callback(item_id);
            }
            else {
                this.on_selected_callback(null);
            };

        };

        if (this.menu_initialized) {
            this.layout.LoadIndex(this.layout.GetCurrentIndex());
        };

    };

    SetMenuItems (menu_items) {

        this.menu_items = {};
        for (var x in menu_items) {
            this.menu_items[menu_items[x]["id"]] = menu_items[x]
        };

        this.selector_menu.SetItems(menu_items);

        if (!this.menu_initialized) {
            this.LoadLastSelectedItem();
        };

        var item_id = Dash.Local.Get(this.ls_key);

        if (item_id && this.menu_items[item_id] && this.first_tab) {
            this.first_tab.SetText(this.menu_items[item_id]["display_name"]);
        };

        this.menu_initialized = true;

    };

    SetNewItemCB (on_new_callback, label_text="") {

        this.on_new_callback = on_new_callback.bind(this.binder);

        if (label_text) {
            this.new_button.SetText(label_text);
        };

    };

    SetOnSelectedCB (on_selected_callback) {
        this.on_selected_callback = on_selected_callback.bind(this.binder);
    };

    Append (a, b, c, d, e) {
        var tab = this.layout.Append(a, b, c, d, e);

        if (!this.first_tab) {
            this.first_tab = tab;
        };

        return tab;
    };

    LoadIndex (index) {
        return this.layout.LoadIndex(index);
    };

};







