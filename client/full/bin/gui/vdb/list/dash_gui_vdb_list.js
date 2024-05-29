function DashGuiVDBList (
    vdb_type, vdb_title, get_obj_view_cb=null, get_row_text_cb=null, get_combo_types_cb=null,
    vdb_description="", color=null, list_column_width=null, include_toolbar=true, single_mode_data=null
) {
    this.vdb_type = vdb_type;
    this.vdb_title = vdb_title;
    this.get_obj_view_cb = get_obj_view_cb;
    this.get_row_text_cb = get_row_text_cb;
    this.get_combo_types_cb = get_combo_types_cb;
    this.vdb_description = vdb_description;
    this.color = color || Dash.Color.Light;
    this.list_column_width = list_column_width || (Dash.Size.ColumnWidth * 1.75);
    this.include_toolbar = include_toolbar;
    this.single_mode_data = single_mode_data;

    this.rows = {};
    this.api = "VDB";
    this.data = null;
    this.sort_key = "";
    this.toolbar = null;
    this.filter_key = "";
    this.filter_keys = {};
    this.new_button = null;
    this.filter_combos = [];
    this.current_item = null;
    this.loading_label = null;
    this.loading_overlay = null;
    this.searchable_list = null;
    this.pending_user_action = false;
    this.item_area = $("<div></div>");
    this.html = Dash.Gui.GetHTMLAbsContext();
    this.ls_key = "dash_gui_vdb_list_last_loaded_vdb_" + this.vdb_type;
    this.refresh_data_request_failure_id = "dash_gui_vdb_list_" + this.vdb_type + "_on_data";

    this.setup_styles = function (validated=false) {
        if (!validated && !(this instanceof DashGuiVDBList)) {
            setTimeout(
                () => {
                    // If this class is inherited, use a small delay
                    // to allow for any overrides before setup
                    this.setup_styles(true);
                },
                100
            );

            return;
        }

        if (this.single_mode_data) {
            this.data = this.single_mode_data;

            if (this.data["get_combo_options"]) {
                (function (self) {
                    Dash.Request(
                        self,
                        function (response) {
                            if (!Dash.Validate.Response(response)) {
                                return;
                            }

                            self.data["combo_options"] = response["combo_options"];
                        },
                        self.api,
                        {
                            "f": "get_combo_options",
                            "combo_types": JSON.stringify(self.get_combo_types())
                        }
                    );
                })(this);
            }

            return;
        }

        Dash.SetInterval(this, this.refresh_data, 10000);

        if (this.include_toolbar) {
            this.add_toolbar();
        }

        this.html.append(this.item_area);

        this.setup_searchable_list();

        this.loading_label = new Dash.Gui.LoadingLabel(this, "Loading " + this.vdb_title + "...");

        this.html.append(this.loading_label.html);

        this.item_area.css({
            "position": "absolute",
            "left": this.list_column_width + 1, // Account for border
            "top": this.toolbar ? this.toolbar.GetHeight() : 0,
            "bottom": 0,
            "right": 0,
            "overflow-y": "auto",
            "background": this.color.Background
        });
    };

    this.AddNewButton = function (parent_html, css={}) {
        if (this.include_toolbar || this.new_button || !this.new_button_allowed()) {
            return null;
        }

        this.new_button = new Dash.Gui.Button(
            "New",
            this.create_new,
            this,
            this.color,
            {"style": "toolbar"}
        );

        this.new_button.html.css(css);

        parent_html.append(this.new_button.html);

        return this.new_button;
    };

    this.SetProperty = function (obj_id, key, value, extra_params={}) {
        if (!this.check_permission(key)) {
            return;
        }

        var params = {
            "f": "set_property",
            "vdb_type": this.vdb_type,
            "obj_id": obj_id,
            "key": key,
            "value": value,
            ...extra_params
        };

        if (this.new_button) {
            this.new_button.Request(this.api, params, this.on_data, this);
        }

        else {
            Dash.Request(this, this.on_data, this.api, params);
        }
    };

    this.SetProperties = function (obj_id, properties, extra_params={}) {
        for (var key in properties) {
            if (!this.check_permission(key)) {
                return;
            }
        }

        var params = {
            "f": "set_properties",
            "vdb_type": this.vdb_type,
            "obj_id": obj_id,
            "properties": JSON.stringify(properties),
            ...extra_params
        };

        if (this.new_button) {
            this.new_button.Request(this.api, params, this.on_data, this);
        }

        else {
            Dash.Request(this, this.on_data, this.api, params);
        }
    };

    this.ViewObj = function (obj_id, force_set_active=false) {
        if (this.current_item != null && this.current_item.obj_id === obj_id) {
            if (force_set_active) {
                this.searchable_list.SelectRow(obj_id);
            }

            return;  // Already loaded
        }

        if (!obj_id) {
            return;
        }

        this.item_area.empty();

        this.current_item = (
            this.get_obj_view_cb ? this.get_obj_view_cb(obj_id) : null
        ) ||  new Dash.Gui.VDBEntry(this, obj_id);

        this.item_area.append(this.current_item.html);

        Dash.Local.Set(this.ls_key, obj_id);

        this._set_active_list_item(obj_id);

        if (force_set_active) {
            this.searchable_list.SelectRow(obj_id);
        }
    };

    this.DeleteObj = function (obj_id, button=null) {
        this.pending_user_action = true;

        if (!window.confirm("Are you sure you want to delete this entry?")) {
            this.pending_user_action = false;

            return;
        }

        // if (!window.confirm("Last chance! This cannot be undone.")) {
        //     this.pending_user_action = false;
        //
        //     return;
        // }

        if (button) {
            button.Disable();
            button.SetLoading(true);
        }

        (function (self) {
            self.rows[obj_id].html.stop().animate(
                {
                    "height": 0,
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "padding-top": 0,
                    "padding-bottom": 0
                },
                500,
                function () {
                    self.pending_user_action = false;
                }
            );

            Dash.Request(
                self,
                function (response) {
                    self.on_data(response);

                    if (button) {
                        button.SetLoading(false);
                        button.Enable();
                    }
                },
                self.api,
                {
                    "f": "delete",
                    "vdb_type": self.vdb_type,
                    "obj_id": obj_id
                }
            );
        })(this);
    };

    // Intended to be overridden
    this.get_no_new_button_types = function () {
        return [];
    };

    // Intended to be overridden
    this.get_re_alphabetize_types = function () {
        return [];
    };

    // Intended to be overridden
    this.get_reverse_order_types = function () {
        return [];
    };

    // Intended to be overridden
    this.check_permission = function (key) {
        return !Dash.User.Init["access"]?.["restricted"];
    };

    this.on_data_cb = function (response) {
        // Intended to be overridden
    };

    this.filter_data_on_data = function (response) {
        // Intended to be overridden
    };

    this.new_button_allowed = function () {
        return (
               !Dash.User.Init["access"]?.["restricted"]
            && !(this.get_no_new_button_types().includes(this.vdb_type))
        );
    };

    this.add_toolbar = function () {
        this.toolbar = new Dash.Layout.Toolbar(this, this.color);

        if (this.vdb_description) {
            var label = this.toolbar.AddText(this.vdb_description, this.color);

            label.label.css({
                "font-family": "sans_serif_bold",
                "font-size": "90%",
                "color": this.color.StrokeLight,
                "height": Dash.Size.ButtonHeight,
                "line-height": Dash.Size.ButtonHeight + "px"
            });

            label.html.css({
                "height": Dash.Size.ButtonHeight,
                "line-height": Dash.Size.ButtonHeight + "px",
                "white-space": "nowrap",
                "overflow": "hidden",
                "text-overflow": "ellipsis"
            });

            // If it gets cut off, you can hover to see the full description
            label.html.attr("title", this.vdb_description);
        }

        this.toolbar.AddExpander();

        if (this.new_button_allowed()) {
            this.new_button = this.toolbar.AddButton("New", this.create_new);
        }

        this.html.append(this.toolbar.html);
    };

    this.setup_searchable_list = function () {
        this.searchable_list = (function (self) {
            return new Dash.Layout.SearchableRevolvingList(
                self,
                function (row) {
                    self.on_selection(row.ID());
                }
            );
        })(this);

        this.searchable_list.OverrideGetDataForKey(this.get_row_text);
        this.searchable_list.SetRecallID(this.ls_key);

        this.html.append(this.searchable_list.html);

        this.searchable_list.html.css({
            "position": "absolute",
            "left": 0,
            "top": this.toolbar ? this.toolbar.GetHeight() : 0,
            "bottom": 0,
            "width": this.list_column_width,
            "border-right": "1px solid " + this.color.Pinstripe
        });
    };

    this.on_selection = function (row_id) {
        this.ViewObj(row_id);
    };

    this.get_row_text = function (row_id) {
        var data = this.get_data()[row_id] || {};
        var text = data["display_name"] || row_id || "";

        return (
            this.get_row_text_cb ? this.get_row_text_cb(data, text) : ""
        ) || text;
    };

    this.get_data = function () {
        return this.data["data"];
    };

    this.get_combo_types = function () {
        return (this.get_combo_types_cb ? this.get_combo_types_cb() : []) || [];
    };

    this.on_data = function (response, track=true) {
        if (track) {
            if (!Dash.Validate.Response(response)) {
                return;
            }
        }

        else {
            if (!Dash.Validate.Response(response, false)) {

                // The requests are made every 15 seconds, so if it's still not resolved after 30
                // seconds, the portal was updated or something is wrong - either way, need to reload.
                Dash.Requests.TrackRequestFailureForID(this.refresh_data_request_failure_id, 2);

                return;
            }

            Dash.Requests.ResetRequestFailuresForID(this.refresh_data_request_failure_id);
        }

        var combo_options = null;

        if (this.data && this.data["combo_options"]) {
            combo_options = this.data["combo_options"];
        }

        this.data = response;

        this.filter_data_on_data(response);

        if (combo_options && !this.data["combo_options"]) {
            this.data["combo_options"] = combo_options;
        }

        if (this.loading_label) {
            Dash.Log.Log("List data:", this.data);

            this.loading_label.Clear();

            this.loading_label = null;
        }

        var new_obj_id = "";

        if (this.data["new_object"]) {
            new_obj_id = this.data["new_object"];

            delete this.data["new_object"];

            this.reset_filters();
        }

        if (!this.single_mode_data) {
            var order = this.redraw_rows();

            if (this.current_item) {
                var current_id = this.current_item.obj_id;

                if (this.data["data"][current_id]) {
                    if (this.current_item.hasOwnProperty("Update")) {
                        this.current_item.Update();
                    }
                }

                else {
                    // Dash.Log.Warn(
                    //     "Unable to update view since the data no longer seems to exist",
                    //     current_id,
                    //     this.data
                    // );
                }
            }

            this.view_obj(new_obj_id, new_obj_id, order);
        }

        this.on_data_cb(response);

        if (this.loading_overlay) {
            this.loading_overlay.Hide();
        }
    };

    this.reset_filters = function () {
        this.filter_key = "";
        this.filter_keys = {};

        for (var combo of this.filter_combos) {
            combo.Update(null, "", true);
        }
    };

    this.view_obj = function (selected_id="", new_obj_id="", order=[], force_set_active=false) {
        if (!selected_id) {
            selected_id = this.searchable_list.LastSelectedRowID() || Dash.Local.Get(this.ls_key);
        }

        force_set_active = force_set_active || Boolean(new_obj_id);

        if (order.length) {
            if (!order.includes(selected_id)) {
                selected_id = order[0];
                force_set_active = true;
            }
        }

        else {
            return;
        }

        this.ViewObj(selected_id, force_set_active);
    };

    this.create_new = function () {
        var params = {
            "f": "create_new",
            "vdb_type": this.vdb_type
        };

        if (this.filter_key) {
            params["additional_data"] = JSON.stringify({"filter_key": this.filter_key});
        }

        if (this.new_button) {
            this.new_button.Request(this.api, params, this.on_data, this);
        }

        else {
            Dash.Request(this, this.on_data, this.api, params);
        }
    };

    this.redraw_rows = function () {
        if (this.pending_user_action || !this.searchable_list) {
            return [];
        }

        var update_data = {
            "order": this.get_list_order(),
            "data": this.get_list_data()
        };

        this.searchable_list.Update(update_data);

        var id;

        for (id in this.rows) {
            this.rows[id].html.detach();
        }

        for (var i = 0; i < update_data["order"].length; i++) {
            var row_id = update_data["order"][i];
            var row_data = update_data["data"][row_id];

            if (this.rows[row_id]) {  // This row already exists
                this.rows[row_id].Update(row_data);
            }

            else {  // row.Update() is called automatically on newly-created elements
                this.rows[row_id] = new Dash.Gui.VDBListRow(this, row_data);
            }
        }

        for (id in this.rows) {
            if (!update_data["order"].includes(id)) {
                this.rows[id].html.remove();

                delete this.rows[id];
            }
        }

        return update_data["order"];
    };

    this.get_list_data = function () {
        return Dash.GetDeepCopy(this.data["data"]);
    };

    this.get_list_order = function () {
        this.data["order"] = this.get_re_alphabetized_order();

        return this.data["order"];
    };

    this.get_re_alphabetized_order = function () {
        if (!this.get_re_alphabetize_types().includes(this.vdb_type)) {
            return Dash.GetDeepCopy(this.data["order"]);
        }

        var sort = [];
        var order = [];

        for (var id of this.data["order"]) {
            sort.push([
                this.get_row_text(id),
                id
            ]);
        }

        sort = sort.sort();

        for (var pair of sort) {
            order.push(pair[1]);
        }

        if (this.get_reverse_order_types().includes(this.vdb_type)) {
            order.reverse();
        }

        return order;
    };

    this.refresh_data = function () {
        this._refresh_data();
    };

    this._refresh_data = function (extra_params={}) {
        if (!this.vdb_type) {
            // Dash.Log.Warn("Missing VDB type");

            return;
        }

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.on_data(response, false);
                },
                self.api,
                {
                    "f": "get_all",
                    "vdb_type": self.vdb_type,
                    "combo_types": JSON.stringify(self.get_combo_types()),
                    ...extra_params
                }
            );
        })(this);
    };

    this._set_active_list_item = function (obj_id) {
        for (var id in this.rows) {
            if (id === obj_id) {
                this.rows[id].SetActive(true);
            }

            else {
                this.rows[id].SetActive(false);
            }
        }
    };

    this.setup_styles();
}
