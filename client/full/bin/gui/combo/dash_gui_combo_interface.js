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

    // See draw_click_skirt for override keys
    this.UpdateSkirtOverrides = function (overrides={}) {
        this.skirt_overrides = {
            ...this.skirt_overrides,
            ...overrides
        };
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
        if (this.search_set_up) {
            return;
        }

        DashGuiComboSearch.call(this);

        this.setup_search_selection();
    };

    this.InFocus = function (check_search_only=false) {
        if (check_search_only) {
            return (this.search_input && this.search_input.InFocus());
        }

        if (this.search_input) {
            return this.search_input.InFocus();
        }

        return this.IsExpanded();
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

    this.IsExpanded = function () {
        return this.expanded;
    };

    this.SetOnCollapseCB = function (callback=null, binder=null) {
        this.on_collapse_cb = callback && binder ? callback.bind(binder) : callback;
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

    // Only tested using the Row style
    this.UseAsButtonCombo = function (label_text) {
        this.html.css({
            "background": this.color.Button.Background.Base,
            "padding-left": Dash.Size.Padding * 0.5
        });

        this.label.css({
            "color": this.color.Button.Text.Base,
            "padding-right": Dash.Size.Padding * 0.25
        });

        if (!this.read_only) {
            this.dropdown_icon.html.remove();

            this.add_dropdown_icon(0.7, "caret_down");

            this.dropdown_icon.SetColor(this.color.Button.Text.Base);
        }

        var highlight_color = Dash.Color.GetTransparent(this.color.Button.Background.Base, 0.1);

        (function (self) {
            self.SetOnRowsDrawnCallback(function () {
                self.rows.css({
                    "background": self.color.Button.Text.Base,
                    "box-sizing": "border-box",
                    "border": "1px solid " + self.color.Button.Background.Base,
                    "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.07)",
                });

                for (var button of self.row_buttons) {
                    button.label.css({
                        "color": self.color.Button.Background.Base,
                        "border-bottom": "1px solid " + self.color.Button.Background.Base
                    });

                    button.highlight.css({
                        "background": highlight_color
                    });
                }
            });
        })(this);

        this.SetStaticLabelText(label_text);

        this.as_button_combo = true;
    };

    this.AddArrowButtons = function (
        inverted=false, allow_first=true, left_icon_name="arrow_left_heavy", right_icon_name="arrow_right_heavy"
    ) {
        if (this.multi_select) {
            console.warn("Warning: Arrow buttons are not supported when multi-select is enabled.");

            return;
        }

        if (this.left_arrow_button) {
            return;
        }

        var size = Math.max(this.html.outerHeight() || 0, this.inner_html.outerHeight() || 0);

        if (!size) {
            (function (self) {
                setTimeout(
                    function () {
                        self.AddArrowButtons();
                    },
                    100
                );
            })(this);

            return;
        }

        this.arrow_buttons_inverted = inverted;
        this.arrow_buttons_allow_first = allow_first;

        this.html.css({
            "margin-left": size,
            "margin-right": size
        });

        var options = {
            "container_size": size,
            "size_mult": 0.9
        };

        (function (self) {
            self.left_arrow_button = new Dash.Gui.IconButton(
                left_icon_name,
                function () {
                    self.on_arrow_button(!inverted);
                },
                self,
                self.color,
                options
            );

            self.right_arrow_button = new Dash.Gui.IconButton(
                right_icon_name,
                function () {
                    self.on_arrow_button(inverted);
                },
                self,
                self.color,
                options
            );
        })(this);

        this.left_arrow_button.html.css({
            "position": "absolute",
            "left": -size,
            "top": 0
        });

        this.right_arrow_button.html.css({
            "position": "absolute",
            "right": -size,
            "top": 0
        });

        this.html.append(this.left_arrow_button.html);
        this.html.append(this.right_arrow_button.html);

        this.update_arrow_buttons();
    };

    this.GetActiveIndex = function () {
        var current_id = this.ActiveID();

        for (var i in this.option_list) {
            if (this.option_list[i]["id"] === current_id) {
                return parseInt(i);
            }
        }

        return null;
    };

    this.DisableFlash = function () {
        this.flash_enabled = false;
    };

    this.SetStaticLabelText = function (value) {
        this.static_label_text = value;

        this.label.text(this.static_label_text);
    };

    this.SetOnRowsDrawnCallback = function (callback) {
        this.on_rows_drawn_cb = this.binder ? callback.bind(this.binder) : callback;
    };

    this.SetOnClickCallback = function (callback) {
        this.on_click_cb = this.binder ? callback.bind(this.binder) : callback;
    };

    this.SetGravityHeightOverride = function (value) {
        this.gravity_height_override = value;
    };

    this.SetGravityWidthOverride = function (value) {
        this.gravity_width_override = value;
    };

    this.SetGravityValueOverride = function (value) {
        this.gravity_value_override = value;
    };

    this.SetGravityParentOverride = function (html) {
        this.gravity_parent_override = html;
    };

    this.DisableAutoGravity = function () {
        this.auto_gravity = false;
    };

    this.SetListVerticalOffset = function (offset) {
        offset = parseInt(offset);

        if (!Number.isInteger(offset)) {
            console.error("Error: SetListVerticalOffset() requires an integer:", offset, typeof offset);

            return;
        }

        this.list_offset_vertical = offset;
    };

    this.Disable = function (fade=true, hide_icon=false, opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        var css = {
            "pointer-events": "none"
        };

        if (fade) {
            css["opacity"] = opacity;
        }

        this.html.css(css);

        if (hide_icon && this.dropdown_icon) {
            this.dropdown_icon.html.hide();
        }
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
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

    this.RefreshConnections = function () {
        this.html.off("mouseenter");
        this.html.off("mouseleave");
        this.html.off("click");

        this.setup_connections(true);
    };

    this.SetLoading = function (is_loading, align_right=false) {
        if (is_loading && this.load_dots) {
            return;
        }

        if (!is_loading && !this.load_dots) {
            return;
        }

        if (!is_loading && this.load_dots) {
            this.load_dots.Stop();

            this.load_dots.html.remove();

            this.load_dots = null;

            if (this.as_button_combo) {
                this.dropdown_icon.html.css({
                    "opacity": 1
                });
            }

            return;
        }

        if (!this.load_dots) {
            this.setup_load_dots(align_right || this.read_only || Boolean(this.as_button_combo));

            if (this.as_button_combo) {
                this.load_dots.SetColor(this.color.Button.Text.Base);

                this.load_dots.html.css({
                    "top": Dash.Size.Padding * 0.25,
                    "right": Dash.Size.Padding * 0.25
                });

                this.dropdown_icon.html.css({
                    "opacity": 0
                });
            }
        }

        this.load_dots.Start();
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

        if (selected !== null && typeof selected !== "object") {
            if (combo_list || this.option_list) {
                var combo;

                for (combo of (combo_list || this.option_list)) {
                    if (combo["id"].toString() === selected.toString()) {
                        selected = combo;

                        break;
                    }
                }

                // Some old code uses "none" for the default key, instead of "",
                // so this can help catch those old cases on a more broad level
                if (selected === "none") {
                    for (combo of (combo_list || this.option_list)) {
                        if (combo["id"] === "") {
                            selected = combo;

                            break;
                        }
                    }
                }
            }

            if (typeof selected !== "object") {
                if (
                       !(!this.option_list || this.option_list.length === 0)
                    && !(this.option_list.length === 1 && ["", "none"].includes(this.option_list[0]["id"])))
                {
                    console.warn(
                        "Warning: Failed to find 'selected' object in options list." +
                        "\n\ncombo_list:", combo_list, "\nselected:", selected,
                        "\nignore_callback:", ignore_callback, "\nthis.option_list:", this.option_list
                    );
                }

                // Previously, we would return in this case, but then valid option list changes wouldn't get updated
                selected = null;
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
