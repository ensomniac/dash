class DashGuiFlowRowArea {
    constructor (view, row_config=[], auto_rows=true, auto_rows_min_required=1, in_step=false) {
        this.view = view;
        this.row_config = row_config;
        this.auto_rows = auto_rows;
        this.auto_rows_min_required = auto_rows_min_required;
        this.in_step = in_step;

        this.rows = [];
        this.auto_row_timer = null;
        this.tip_text_timer = null;
        this.tip_text_anim_ms = 200;
        this.color = this.view.color;
        this.pre_expanded_height = 0;
        this.html = $("<div></div>");
        this.combo_click_anim_ms = 150;

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "width": "85%",
            "height": "fit-content",
            ...this.view.row_area_css
        });

        if (this.auto_rows) {
            if (this.auto_rows_min_required) {
                for (var _ of Dash.Math.Range(this.auto_rows_min_required)) {
                    this.add_row();
                }
            }

            else {
                this.add_row(true);
            }
        }
    }

    GetData (include_empty_rows=false) {
        var data = [];

        for (var row of this.rows) {
            var _data = {};
            var empty = true;
            var row_data = row.GetData();

            for (var i in this.row_config) {
                var config = this.row_config[i];

                _data[config["key"] || i] = row_data[i];

                if (row_data[i]) {
                    empty = false;
                }
            }

            if (!include_empty_rows && empty) {
                continue;
            }

            data.push(_data);
        }

        return data;
    }

    // TODO: need to auto-populate any existing data using config["key"]
    add_row (auto_added=false) {
        var row = new DashGuiFlowRow(this.view);

        row.html.css({
            "margin": 0,
            "margin-top": this.rows.length ? Dash.Size.Padding * 2 : 0,
            "width": "100%"
        });

        for (var i in this.row_config) {
            var element = null;
            var config = this.row_config[i];

            if (config["type"] === "input") {
                element = this.add_input(row, config);
            }

            else if (config["type"] === "combo") {
                element = this.add_combo(row, config);
            }

            else if (config["type"] === "toggle") {
                element = this.add_toggle(row, config);
            }

            else if (config["type"] === "text") {
                element = row.AddText(...config["params"]);
            }

            else if (config["type"] === "icon_button") {
                element = row.AddIconButton(...config["params"]);
            }

            else {
                console.warn("Warning: Unhandled config type:", config["type"]);
            }

            if (!element) {
                continue;
            }

            if (config["css"]) {
                (element.hasOwnProperty("html") ? element.html : element).css(config["css"]);
            }

            if (config["tip_text"]) {
                this.add_tip_text_hover(element, i);
            }
        }

        this.setup_auto_row(row, auto_added);

        this.html.append(row.html);

        this.rows.push(row);
    }

    // This has not been perfected yet, there are a lot of limitations, especially if the text is longer than
    // one line, since it can't overflow out of the row area container without breaking other elements' flows.
    // A proper solution would be one similar to DashGuiCombo's gravity system, when the need arises.
    add_tip_text_hover (element, index) {
        var html = (element.hasOwnProperty("html") ? element.html : element);

        html.css({
            "cursor": "help",
            "overflow": "visible"  // This might produce unexpected results, but displaying this is tricky
        });

        html.on("mouseenter", () => {
            if (!this.row_config[index]["_tip_text_element"]) {
                this.row_config[index]["_tip_text_element"] = new DashGuiFlowTipText(
                    this.view,
                    this.row_config[index]["tip_text"]
                );

                this.row_config[index]["_tip_text_element"].Emphasize();

                this.row_config[index]["_tip_text_element"].html.css({
                    "position": "absolute",
                    "z-index": 100,
                    "top": html.height(),
                    "left": 0,
                    "font-size": "60%",
                    "padding": Dash.Size.Padding * 0.5,
                    "padding-top": Dash.Size.Padding * 0.25,
                    "padding-bottom": Dash.Size.Padding * 0.25,
                    "opacity": 0
                });

                html.append(this.row_config[index]["_tip_text_element"].html);
            }

            if (this.auto_row_timer) {
                clearTimeout(this.auto_row_timer);

                this.auto_row_timer = null;
            }

            this.auto_row_timer = setTimeout(
                () => {
                    this.row_config[index]["_tip_text_element"].html.css({
                        "visibility": "visible"
                    });

                    this.row_config[index]["_tip_text_element"].html.stop().animate(
                        {"opacity": 1},
                        this.tip_text_anim_ms
                    );
                },
                400
            );
        });

        html.on("mouseleave", () => {
            if (this.auto_row_timer) {
                clearTimeout(this.auto_row_timer);

                this.auto_row_timer = null;
            }

            if (!this.row_config[index]["_tip_text_element"]) {
                return;
            }

            this.row_config[index]["_tip_text_element"].html.stop().animate(
                {"opacity": 0},
                this.tip_text_anim_ms,
                () => {
                    this.row_config[index]["_tip_text_element"].html.css({
                        "visibility": "hidden"
                    });
                }
            );
        });
    }

    remove_row (row) {
        row.html.remove();

        this.rows.Remove(row);

        this.auto_row_check_on_row_change(null, true);
    }

    setup_auto_row (row, auto_added) {
        if (!this.auto_rows) {
            return;
        }

        var min = this.rows.length <= (this.auto_rows_min_required - 1);

        var icon_button = row.AddIconButton(
            min ? "asterisk" : "close",
            min ? null : () => {
                this.remove_row(row);
            },
            min ? "Required" : "Remove row",
            row.icon_font_size * (min ? 0.5 : 1),
            !min
        );

        if (min) {
            icon_button.Disable();
            icon_button.SetIconColor(this.color.StrokeLight);

            icon_button.html.css({
                "cursor": "help",
                "pointer-events": "auto"
            });

            icon_button.icon.html.css({
                "cursor": "help"
            });

            icon_button.html.off("click");
        }

        if (auto_added) {
            icon_button.html.css({
                "visibility": "hidden"
            });

            row.html.css({
                "opacity": 0.5
            });
        }

        if (["icon_button", "toggle"].includes(this.row_config.Last()["type"])) {
            icon_button.html.css({
                "border-radius": 0,
                "border-left": "1px solid " + this.color.PinstripeDark,
                "padding-left": Dash.Size.Padding
            });
        }

        row.remove_row_button = icon_button;
    }

    add_toggle (row, config) {
        var toggle = row.AddToggle(...config["params"]);

        var cb = toggle.bound_cb;

        toggle.bound_cb = (active) => {
            if (cb) {
                cb(active, toggle);
            }

            this.auto_row_check_on_row_change(row);
        };

        return toggle;
    }

    add_input (row, config) {
        var input = row.AddInput(...config["params"]);

        if (!this.auto_rows) {
            return;
        }

        var cb = input.bound_cb;

        input.SetBoundCallback(() => {
            if (cb) {
                cb(input);
            }

            this.auto_row_check_on_row_change(row);
        });

        return input;
    }

    on_combo_collapsed (combo, row) {
        if (!combo._dash_gui_flow_row_area_click_expanded) {
            return;
        }

        combo._dash_gui_flow_row_area_click_expanded = false;

        this.html.stop().animate(
            {"height": this.pre_expanded_height || ""},
            this.combo_click_anim_ms,
            () => {
                this.html.css({
                    "height": "fit-content"
                });
            }
        );


        if (
            (
                   !this.auto_rows
                || (this.rows.indexOf(row) + 1) > this.auto_rows_min_required
            )
            && row.IsEmpty()
        ) {
            row.html.stop().animate(
                {"opacity": 0.5},
                100
            );
        }
    }

    add_combo (row, config) {
        var combo = row.AddCombo(...config["params"]);

        combo.additional_data = combo;

        if (this.in_step) {
            combo.SetGravityParentOverride(this.html);
        }

        combo.SetOnCollapseCB(() => {
            this.on_combo_collapsed(combo, row);
        });

        combo.html.on("click", () => {
            this.on_combo_clicked(combo, row);
        });

        if (!this.auto_rows) {
            return;
        }

        var cb = combo.callback;

        // Track changes
        combo.callback = (selected_option, previous_option, combo) => {
            if (cb) {
                cb(selected_option, previous_option, combo);
            }

            this.auto_row_check_on_row_change(row);
        };

        return combo;
    }

    on_combo_clicked (combo, row) {
        if (combo.IsExpanded()) {
            combo._dash_gui_flow_row_area_click_expanded = true;

            row.html.stop().animate(
                {"opacity": 1},
                100
            );

            this.pre_expanded_height = this.html.height() ;

            if (combo.last_rows_height > this.html.height()) {
                this.html.stop().animate(
                    {
                        "height": (
                              combo.last_rows_height
                            + ((combo.html.height() + (Dash.Size.Padding * 2)) * (this.rows.length - 1))
                        )
                    },
                    this.combo_click_anim_ms
                );
            }

            else {
                this.html.stop().animate(
                    {
                        "height": this.pre_expanded_height + (Dash.Size.Padding * 2)
                    },
                    this.combo_click_anim_ms
                );
            }
        }

        else {
            this.on_combo_collapsed(combo, row);
        }

        Dash.Gui.ScrollToElement(this.html, combo.html);

        for (var other_row of this.rows) {
            if (other_row === row) {
                continue;
            }

            for (var element of other_row.elements) {
                if (element instanceof DashGuiFlowCombo) {
                    var collapse_cb = element.on_collapse_cb;

                    element.SetOnCollapseCB(null);
                    element.HideTray();
                    element.SetOnCollapseCB(collapse_cb);
                }
            }
        }
    }

    auto_row_check_on_row_change (row=null, _from_removal=false) {
        if (!this.auto_rows) {
            return;
        }

        if (row && row !== this.rows.Last()) {
            return;
        }

        if (this.auto_row_timer) {
            clearTimeout(this.auto_row_timer);

            this.auto_row_timer = null;
        }

        this.auto_row_timer = setTimeout(
            () => {
                this._auto_row_check_on_row_change(_from_removal);
            },
            300
        );
    }

    _auto_row_check_on_row_change (_from_removal=false) {
        var last_row = this.rows.Last();
        var empty = last_row.IsEmpty();

        if (empty) {
            if (_from_removal) {
                return;
            }
        }

        else {
            this.add_row(true);
        }

        last_row.remove_row_button.html.css({
            "visibility": empty ? "hidden" : "visible"
        });

        last_row.html.css({
            "opacity": 1
        });
    }
}
