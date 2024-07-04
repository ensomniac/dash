function DashGuiVDB (
    vdb_types={}, can_view_type_cb=null, on_load_view_cb=null,
    get_obj_view_cb=null, get_row_text_cb=null, get_combo_types_cb=null, color=null
) {
    this.vdb_types = vdb_types;
    this.can_view_type_cb = can_view_type_cb;
    this.on_load_view_cb = on_load_view_cb;
    this.get_obj_view_cb = get_obj_view_cb;
    this.get_row_text_cb = get_row_text_cb;
    this.get_combo_types_cb = get_combo_types_cb;
    this.color = color;

    this.last_vdb_type = "";
    this.last_list_view = null;
    this.layout = new Dash.Layout.Tabs.Top(this, "dash_gui_vdb", this.color);
    this.html = this.layout.html;

    this.setup_styles = function (validated=false) {
        if (!validated && !(this instanceof DashGuiVDB)) {
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

        for (var vdb_type in this.vdb_types) {
            if (this.can_view_type_cb && !this.can_view_type_cb(vdb_type)) {
                continue;
            }

            if (this.vdb_types[vdb_type]["prepend"]) {
                this.layout.Prepend(this.get_title(vdb_type), this.load_view, vdb_type);
            }

            else {
                this.layout.Append(this.get_title(vdb_type), this.load_view, vdb_type);
            }
        }
    };

    this.load_view = function (vdb_type) {
        this.last_vdb_type = vdb_type;

        this.last_list_view = new Dash.Gui.VDBList(
            vdb_type,
            this.get_title(vdb_type),
            this.get_obj_view_cb,
            this.get_row_text_cb,
            this.get_combo_types_cb,
            this.vdb_types[vdb_type]["description"] || "",
            this.color,
            this.vdb_types[vdb_type]["list_width"] || null,
            this.vdb_types[vdb_type]["include_toolbar"] || true,
            this.vdb_types[vdb_type]["single_mode_data"] || null,
            this.vdb_types[vdb_type]["extra_params"] || {}
        );

        if (this.on_load_view_cb) {
            this.on_load_view_cb(this.last_list_view, vdb_type);
        }

        return this.last_list_view;
    };

    this.get_title = function (vdb_type) {
        return this.vdb_types[vdb_type]["title"] || vdb_type.Title();
    };

    this.setup_styles();
}
