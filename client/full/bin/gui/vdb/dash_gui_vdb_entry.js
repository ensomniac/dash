function DashGuiVDBEntry (
    list_view, obj_id, include_display_name_key=true, refresh_ms=35000,
    include_primary_header=true, init_with_prop_box=false
) {
    this.list_view = list_view;
    this.obj_id = obj_id;
    this.include_display_name_key = include_display_name_key;
    this.refresh_ms = refresh_ms;
    this.include_primary_header = include_primary_header;
    this.init_with_prop_box = init_with_prop_box;

    this.full_data = null;
    this.vdb_3d_box = null;
    this.property_box = null;
    this.initialized = false;
    this.loading_label = null;
    this.primary_header = null;
    this.html = $("<div></div>");
    this.display_name_input = null;
    this.vdb_type = this.list_view.vdb_type;
    this.color = this.list_view.color || Dash.Color.Light;
    this.read_only = Dash.User.Init["access"]?.["restricted"];
    this.refresh_full_data_request_failure_id = "dash_gui_vdb_entry_on_data";

    this.setup_loader = function (validated=false) {
        if (!validated && !(this instanceof DashGuiVDBEntry)) {
            setTimeout(
                () => {
                    // If this class is inherited, use a small delay
                    // to allow for any overrides before setup
                    this.setup_loader(true);
                },
                100
            );

            return;
        }

        if (!this.list_view.data) {
            this.add_loading_label();

            setTimeout(
                () => {
                    this.setup_loader(true);
                },
                100
            );

            return;
        }

        if (!this.get_data_from_list_view()) {
            // console.error("Object (" + this.obj_id + ") does not exist!");

            return;
        }

        this.add_loading_label();

        if (this.refresh_ms) {
            Dash.SetInterval(this, this.refresh_full_data, this.refresh_ms);
        }

        else {
            this.refresh_full_data();
        }
    };

    // Call this from an overridden class to have a
    // callback fire whenever update is called
    this.OnUpdate = function (on_update_cb) {
        this.on_update_cb = on_update_cb;
    };

    this.Update = function () {
        if (!this.property_box) {
            return;
        }

        if (!this.full_data) {
            var base_data = this.get_data_from_list_view();

            for (var key in base_data) {
                this.full_data[key] = base_data[key];
            }
        }

        if (this.property_box) {
            this.property_box.Update();
        }

        if (this.on_update_cb) {
            this.on_update_cb();
        }
    };

    this.setup_styles = function () {
        // Intended to be overridden
    };

    this.on_data_cb = function (previous_data) {
        // Intended to be overridden
    };

    // Intended to be overridden
    this.get_primary_header_icon_name = function () {
        return "";
    };

    this.add_loading_label = function () {
        if (this.loading_label) {
            return;
        }

        var text;

        try {
            text = this.get_data_from_list_view()["display_name"];
        }

        catch {
            text = this.obj_id;
        }

        this.loading_label = new Dash.Gui.LoadingLabel(this, "Loading " + text + "...");

        this.html.append(this.loading_label.html);
    };

    this.add_3d = function (
        header_text="3D", asset_bundle_only=false, pbr=false,
        include_ref_box=false, include_unity_preview=false, get_unity_preview_cb=null
    ) {
        var data = this.get_data();

        this.vdb_3d_box = new Dash.Gui.VDB3D(
            this.vdb_type,
            this.obj_id,
            data["3d_pipeline_assets"] || {
                "asset_bundle": data["asset_bundle"] || {},
                "graphic": data["graphic"] || {},
                "model": data["model"] || {},
                "texture": data["texture"] || {},
                "textures": data["textures"] || {}
            },
            this.color,
            header_text,
            asset_bundle_only,
            pbr,
            this.read_only,
            include_ref_box,
            include_unity_preview,
            get_unity_preview_cb
        );

        this.property_box.AddHTML(this.vdb_3d_box.html);

        // Override
        this.on_data_cb = function () {
            this.vdb_3d_box.UpdateAssetBundle(this.get_data()["3d_pipeline_assets"]);
        };
    };

    this.add_property_box = function () {
        if (this.property_box) {
            return;
        }

        this.property_box = new Dash.Gui.PropertyBox(this, this.get_data, this.set_data);

        this.init_property_box();

        this.html.append(this.property_box.html);
    };

    this.init_property_box = function (property_box=null, add_header=true) {
        if (!property_box) {
            property_box = this.property_box;
        }

        property_box.SetTopRightLabel(this.get_data()["id"]);
        property_box.Flatten();

        if (add_header) {
            this.add_primary_header(property_box);
        }

        if (this.include_display_name_key) {
            this.display_name_input = property_box.AddInput("display_name", "Display Name", "", null, true);
        }
    };

    this.add_primary_header = function (property_box) {
        if (!this.include_primary_header) {
            return;
        }

        this.primary_header = property_box.AddHeader(
            this.get_data()["display_name"] || "Properties", "display_name"
        );

        var icon_name = this.get_primary_header_icon_name();

        if (icon_name) {
            this.primary_header.ReplaceBorderWithIcon(icon_name);
        }
    };

    this.get_data_from_list_view = function () {
        return this.list_view.data["data"][this.obj_id];
    };

    this.get_data = function () {
        return this.full_data || {};
    };

    this.add_color_box = function (label_text="", key_prefix="", num_colors=3, header=true) {
        if (header) {
            this.property_box.AddHeader("Colors").ReplaceBorderWithIcon("color_palette");
        }

        var colors_box = $("<div></div>");

        colors_box.css({
            "display": "flex",
            "margin-left": Dash.Size.Padding * 1.25,
            "margin-top": Dash.Size.Padding * (label_text ? 2.5 : 1)
        });

        if (label_text) {
            var label = $("<div>" + label_text + "</div>");

            label.css({
                "position": "absolute",
                "top": -Dash.Size.Padding * 1.5,
                "left": Dash.Size.Padding * 0.5,
                "font-family": "sans_serif_bold",
                "font-size": "80%",
                "color": this.color.StrokeDark
            });

            colors_box.append(label);
        }

        for (var num of Array(num_colors).keys()) {
            var key = this.get_color_key(num + 1, key_prefix);
            var color_picker = this.get_color_picker(num + 1, key_prefix, false);

            colors_box.append(color_picker.html);

            color_picker.html.attr("title", "Color code:\n" + key);
        }

        this.property_box.AddHTML(colors_box);
    };

    this.get_color_picker = function (color_num, key_prefix="", include_label=true) {
        var color_picker = (function (self) {
            return Dash.Gui.GetColorPicker(
                self,
                function (color_val) {
                    self.on_color_selected(color_num, color_val, key_prefix);
                },
                include_label ? ("Color #" + color_num.toString()) : "none",
                self.color,
                self.get_data()[self.get_color_key(color_num, key_prefix)] || "#00ff00"
            );
        })(this);

        if (this.read_only) {
            color_picker.input.attr("disabled", true);
        }

        return color_picker;
    };

    this.get_color_key = function (color_num, key_prefix) {
        if (key_prefix) {
            return "col_" + key_prefix + "_" + color_num.toString();
        }

        return "col_" + color_num.toString();
    };

    this.on_color_selected = function (color_num, color_val, key_prefix) {
        if (!color_num || !color_val) {
            return;
        }

        this.set_data(this.get_color_key(color_num, key_prefix), color_val);
    };

    this.on_data = function (response) {
        if (!Dash.Validate.Response(response, false)) {
            var refresh_sec = this.refresh_ms / 1000;
            var max_attempts = refresh_sec >= 20 ? 2 : (parseInt((20 / refresh_sec).toString()));

            Dash.Requests.TrackRequestFailureForID(this.refresh_full_data_request_failure_id, max_attempts);

            return;
        }

        Dash.Requests.ResetRequestFailuresForID(this.refresh_full_data_request_failure_id);

        var previous_data = this.full_data ? Dash.GetDeepCopy(this.full_data) : {};

        this.full_data = response;

        Dash.Log.Log("Entry data:", this.full_data);

        if (this.loading_label) {
            this.loading_label.Clear();

            this.loading_label = null;
        }

        if (!this.initialized) {
            this.initialized = true;

            this._setup_styles();
        }

        else {
            this.Update();
        }

        this.on_data_cb(previous_data);
    };

    this.redraw_on_core_change = function () {
        if (this.list_view.loading_overlay && this.list_view.loading_overlay.IsShowing()) {
            setTimeout(
                () => {
                    this.redraw_on_core_change();
                },
                50
            );

            return;
        }

        this.list_view.current_item = null;

        this.list_view.ViewObj(this.obj_id);
    };

    this.on_core_combo_change = function (key, selected_id) {
        if (this.list_view.loading_overlay) {
            this.list_view.loading_overlay.Show();
        }

        else {
            this.list_view.loading_overlay = new Dash.Gui.LoadingOverlay(
                this.color,
                "none",
                "Loading relevant fields",
                this.list_view.html
            );
        }

        this.property_box.on_combo_updated(key, selected_id);

        this.redraw_on_core_change();
    };

    this.set_data = function (key, value) {
        this._set_data(key, value);
    };

    this.refresh_full_data = function () {
        this._refresh_full_data();
    };

    this._refresh_full_data = function (extra_params={}) {
        Dash.Request(
            this,
            this.on_data,
            "VDB",
            {
                "f": "get_details",
                "vdb_type": this.vdb_type,
                "obj_id": this.obj_id,
                ...extra_params
            }
        );
    };

    this._set_data = function (key, value, extra_params={}) {
        if (this.get_data(key) === value || value == null) {
            return;
        }

        // Without this, the property box's update interval sometimes reverts the
        // field to the stored (previous) value before the new response is received
        this.full_data[key] = value;

        this.list_view.SetProperty(this.obj_id, key, value, extra_params);
    };

    // This is an internal setup that applies to all entries.
    this._setup_styles = function () {
        if (this.init_with_prop_box) {
            this.add_property_box();
        }

        this.setup_styles();
        this.Update();
    };

    this.setup_loader();
}
