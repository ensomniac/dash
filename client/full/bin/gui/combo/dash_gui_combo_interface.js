/**@member DashGuiCombo*/

function DashGuiComboInterface () {
    this.EnableSearchSelection = function () {
        DashGuiComboSearch.call(this, this);

        this.setup_search_selection();
    };

    // Only tested using the Default style
    this.UseAsIconButtonCombo = function (icon_name=null, icon_size_mult=null) {
        if (icon_name || icon_size_mult) {
            this.dropdown_icon.html.remove();

            this.add_dropdown_icon(icon_size_mult, icon_name);
        }

        this.html.css({
            "margin-left": Dash.Size.Padding * 0.5
        });

        this.inner_html.css({
            "background": "none"
        });

        this.dropdown_icon.html.css({
            "margin-left": 0,
            "inset": 0
        });

        this.label.remove();
        this.highlight.remove();
    };

    this.DisableFlash = function () {
        this.flash_enabled = false;
    };

    this.SetListVerticalOffset = function (offset) {
        offset = parseInt(offset);

        if (!Number.isInteger(offset)) {
            console.log("ERROR: SetListVerticalOffset() requires an integer:", offset, typeof offset);

            return;
        }

        this.list_offset_vertical = offset;
    };

    this.GetActiveID = function () {
        return this.selected_option_id;
    };

    this.SetLabel = function (content) {
        this.label.text(content["label"]);
    };

    this.SetID = function (combo_id) {
        this.selected_option_id = ComboUtils.GetDataFromID(this.option_list, combo_id);

        this.on_selection(this.selected_option_id, true);
        this.flash();
    };

    this.SetWidth = function (width) {
        this.html.css({"width": width});
        this.rows.css({"width": width});
    };

    this.SetModeOff = function () {
        var cmd_options = {"command": "TurnModeOff", "mindtwin_id": "markiplier", "mode": ""};

        this.link.tab_view.send_trigger("json_command", cmd_options);
    };

    this.Request = function (api, server_data, on_complete_callback, bind_to) {
        if (!this.load_dots) {
            this.setup_load_dots();
        }

        if (this.load_dots.IsActive()) {
            console.log("Request active...");

            return;
        }

        this.load_dots.Start();
        this.on_request_response_callback = null;
        var binder = bind_to || this.binder;

        if (binder && on_complete_callback) {
            this.on_request_response_callback = on_complete_callback.bind(binder);
        }

        (function (self) {
            $.post(api, server_data, function (response) {
                self.load_dots.Stop();

                var response_json = $.parseJSON(response);

                if (self.on_request_response_callback) {
                    self.on_request_response_callback(response_json);
                }
            });
        })(this);
    };

    this.Update = function (label_list, selected, ignore_callback=false) {
        // If the same item is selected, don't fire the callback on updating the list
        if (!ignore_callback) {
            ignore_callback = (selected["id"] == this.selected_option_id);
        }

        if (label_list) {
            this.option_list = label_list;
        }

        if (selected) {
            this.selected_option_id = selected;
        }

        this.on_selection(this.selected_option_id, ignore_callback);

        if (this.bool) {
            this.option_list.reverse();
        }
    };
}
