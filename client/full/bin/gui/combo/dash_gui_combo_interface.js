/**@member DashGuiCombo*/

function DashGuiComboInterface () {
    this.SetReadOnly = function (read_only=false) {
        this.read_only = read_only;
    };

    this.DisableShowRowsOnEmptySearch = function () {
        // This is for ludicrously long lists, but really
        // should display a certain max of rows, or recent
        // rows, etc - but this is needed for a quick thing,
        // no time right now to fully work out a better version.
        this.show_rows_on_empty_search = false;
    };

    this.SetHoverHint = function (hint) {
        this.label_container.attr("title", hint);
    };

    this.GetMultiSelections = function (ids_only=true) {
        if (!this.multi_select) {
            return;
        }

        var selections = [];  // Selected option(s)

        for (var row of this.row_buttons) {
            if (row.IsMultiSelected()) {
                selections.push(ids_only ? row.option["id"] : row.option);
            }
        }

        return selections;
    };

    this.ClearAllMultiSelections = function () {
        if (!this.multi_select) {
            return;
        }

        for (var row of this.row_buttons) {
            if (row.IsMultiSelected()) {
                row.checkbox.Toggle(true);
            }
        }

        this.update_label_for_multi_select();
    };

    this.SetDefaultSearchSubmitCombo = function (combo_option) {
        // If the user has entered text in the search bar and has no results,
        // but hits enter/submits the entry anyway, this combo will be the result

        if (!Dash.Validate.Object(combo_option) || !combo_option["id"] || !(combo_option["label_text"] || combo_option["display_name"])) {
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
    this.UseAsIconButtonCombo = function (icon_name=null, icon_size_mult=null, icon_color=null) {
        if (icon_name || icon_size_mult) {
            this.dropdown_icon.html.remove();

            this.add_dropdown_icon(icon_size_mult || 0.75, icon_name);
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

        this.dropdown_icon.SetColor(icon_color || this.color_set.Background.Base);
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

    this.ActiveLabel = function () {
        return this.selected_option["label_text"] || this.selected_option["display_name"];
    };

    // Deprecated
    this.GetActiveOption = function () {
        return this.ActiveOption();
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

    this.OptionList = function () {
        return this.option_list;
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

    // If the same item is selected, don't fire the callback on updating the list
    this.Update = function (combo_list=null, selected=null, ignore_callback=false) {
        if (this.multi_select) {
            this.update_label_for_multi_select();

            // Do we need to do more here?

            return;
        }

        if (typeof selected === "string") {
            if (combo_list !== null) {
                for (var combo of combo_list) {
                    if (combo["id"] === selected) {
                        selected = combo;

                        break;
                    }
                }
            }

            if (typeof selected === "string") {
                console.warn("Warning: A combo object is using a string to identify a selected property. This should be an object only.");

                console.log("combo_list", combo_list);
                console.log("selected", selected);
                console.log("ignore_callback", ignore_callback);

                return;
            }
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
