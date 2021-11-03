/**@member DashGuiCombo*/

function DashGuiComboInterface () {
    this.SetHoverHint = function (hint) {
        this.label_container.attr("title", hint);
    };

    this.SetDefaultSearchSubmitCombo = function (combo_option) {
        // If the user has entered text in the search bar and has no results,
        // but hits enter/submits the entry anyway, this combo will be the result

        if (!Dash.IsValidObject(combo_option) || !combo_option["id"] || !combo_option["label_text"]) {
            console.log("Invalid combo option, cannot set default search submit combo:", combo_option);

            return;
        }

        this.default_search_submit_combo = combo_option;
    };

    this.EnableSearchSelection = function () {
        DashGuiComboSearch.call(this, this);

        this.setup_search_selection();
    };

    // TODO: Function to disable search selection if option list is reduced below this.searchable_min

    this.ShowTray = function () {
        if (!this.expanded) {
            this.show();
        }
    };

    this.HideTray = function () {
        if (this.expanded) {
            this.hide();
        }
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

        if (this.color_set.Background.Icon) {
            this.dropdown_icon.SetColor(this.color_set.Background.Icon);
        }
    };

    this.DisableFlash = function () {
        this.flash_enabled = false;
    };

    this.SetListVerticalOffset = function (offset) {
        offset = parseInt(offset);

        if (!Number.isInteger(offset)) {
            console.error("Error: SetListVerticalOffset() requires an integer:", offset, typeof offset);

            return;
        }

        this.list_offset_vertical = offset;
    };

    this.ActiveID = function () {
        return this.selected_option_id;
    };

    this.ActiveOption = function () {
        return this.selected_option;
    };

    this.Text = function () {
        return this.label.text();
    };

    this.SetLabel = function (content) {
        this.label.text(content["label"]);
    };

    this.SetWidth = function (width) {
        this.html.css({"width": width});
        this.rows.css({"width": width});
    };

    this.Request = function (endpoint, params, callback, binder=null) {
        if (!this.load_dots) {
            this.setup_load_dots();
        }

        if (this.load_dots.IsActive()) {
            console.log("Request already active...");

            return;
        }

        this.load_dots.Start();
        this.on_request_response_callback = null;

        binder = binder || this.binder;

        if (binder && callback) {
            this.on_request_response_callback = callback.bind(binder);
        }

        (function (self, endpoint, params) {
            Dash.Request(
                binder,
                function (response) {
                    self.load_dots.Stop();

                    if (self.on_request_response_callback) {
                        self.on_request_response_callback(response);
                    }
                },
                endpoint,
                params
            );
        })(this, endpoint, params);
    };

    this.Update = function (combo_list, selected, ignore_callback=false) {
        // If the same item is selected, don't fire the callback on updating the list

        if (typeof(selected) == "string") {
            console.warn("Warning: A combo object is using a string to identify a selected property. This should be an object only.");
            console.log("combo_list", combo_list);
            console.log("selected", selected);
            console.log("ignore_callback", ignore_callback);
            return;
        }

        if (!ignore_callback && selected) {
            ignore_callback = (selected["id"].toString() === this.selected_option_id);
        }

        if (combo_list) {
            this.option_list = combo_list;
        }

        if (selected) {
            this.selected_option = selected;
            this.selected_option_id = selected["id"];
        }

        this.on_selection(this.selected_option, ignore_callback);

        if (this.bool) {
            this.option_list.reverse();
        }
    };
}
