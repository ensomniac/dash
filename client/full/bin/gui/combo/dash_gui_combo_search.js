/**@member DashGuiCombo*/

function DashGuiComboSearch () {
    this.search_input = null;
    this.search_results = [];
    this.is_searchable = true;
    this.search_active = false;
    this.search_result_ids = [];
    this.search_container = null;
    this.search_result_rows = [];
    this.manage_search_button_map = null;

    this.setup_search_selection = function () {
        this.html.css({
            "cursor": "text",
        });

        if (this.highlight) {
            this.highlight.css({
                "cursor": "text",
            });
        }

        if (this.inner_html) {
            this.inner_html.css({
                "cursor": "text",
            });
        }

        (function (self) {
            self.html.on(
                "keydown." + self.random_id,
                function (event) {
                    self.handle_arrow_input(self, event);
                }
            );
        })(this);

        this.search_set_up = true;
    };

    this.activate_search = function () {
        this.search_active = true;

        if (!this.search_input) {
            this.create_search_input();
        }

        this.label_container.css({
            "opacity": 0,
        });
    };

    this.hide_searchable = function () {
        this.hide_skirt();

        this.search_active = false;

        if (this.search_container) {
            this.search_container.remove();

            this.search_container = null;
        }

        if (this.search_input) {
            this.search_input.html.remove();

            this.search_input = null;
        }

        this.search_results = [];
        this.combo_option_index = 0;
        this.search_result_ids = [];
        this.search_result_rows = [];

        this.label_container.css({
            "opacity": 1
        });
    };

    this.create_search_input = function () {
        this.search_container = $("<div></div>");
        this.html.append(this.search_container);

        this.search_container.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": this.rows.width(),
            "height": this.html.height()
        });

        this.search_input = new Dash.Gui.Input("Type to search...", this.color);

        this.search_input.SetText(
            this.multi_select ? this.get_multi_select_label() : (
                this.selected_option["label_text"] || this.selected_option["display_name"]
            )
        );
        this.search_input.SetOnChange(this.on_search_text_changed, this);
        this.search_input.SetOnChangeDelayMs(250);
        this.search_input.SetOnSubmit(this.on_search_text_submitted, this);
        this.search_input.DisableBlurSubmit();
        this.search_input.Flatten();

        this.search_container.append(this.search_input.html);

        if (this.style === "row") {
            this.search_input.html.css({
                "left": -Dash.Size.Padding
            });

            this.search_input.input.css({
                "position": "absolute",
                "inset": 0
            });
        }

        else {
            this.search_input.html.css({
                "top": Dash.Size.Padding * 0.5
            });

            this.search_input.input.css({
                "color": this.color_set.Text.Base
            });
        }

        (function (self) {
            requestAnimationFrame(function () {
                self.search_input.input.select();

                self.manage_search_list(self.show_rows_on_empty_search);
            });
        })(this);
    };

    this.on_search_text_changed = function () {
        this.search_results = [];

        var search_text = this.search_input.Text().toLocaleLowerCase("en-US");

        if (search_text.length === 0) {
            this.manage_search_list(this.show_rows_on_empty_search);

            return;
        }

        var label;
        var option;
        var added_ids = [];

        // As of writing, this doesn't seem necessary for performance, even
        // with very long lists drawing 1000 results without any noticeable
        // lag. If performance is an issue at any point, this should be the
        // first place to start. If moving forward with this in the future,
        // at the very least, need to display a little tag that says something
        // like "showing top 50 results" when the limit is hit, so it's
        // clear that not every potential match is shown. To do it right,
        // we'd need to also offer a way to load more, or load all, etc.
        var max_results = 0;  // 100;

        // OLD LOGIC ---------------------------------------------------------
        // Can revert to this if the new method turns out to be too heavy on
        // performance, but preferably, if performance is the issue, start by setting
        // max_results to 100 and whittle that number down as needed, until resolved.
        // If reverting to this, comment out this.search_input.SetOnChangeDelayMs in this.create_search_input.
        //
        // var respect_search_results_order = false;
        //
        // for (option of this.option_list) {
        //     label = (option["label_text"] || option["display_name"] || "").toString();
        //
        //     if (!label.length) {
        //         continue;
        //     }
        //
        //     var opt = label.toLocaleLowerCase("en-US");
        //
        //     if (search_text.length < 3) {
        //         // For a short search, only match the beginning
        //         if (opt.startsWith(search_text)) {
        //             this.search_results.push(option["id"]);
        //         }
        //     }
        //
        //     else {
        //         if (opt.includes(search_text)) {
        //             this.search_results.push(option["id"]);
        //         }
        //     }
        //
        //     if (max_results && this.search_results.length >= max_results) {
        //         break;
        //     }
        // }

        // NEW LOGIC ---------------------------------------------------------
        // This logic is the same as the logic in DashMobileSearchableCombo.filter_datalist,
        // so if any logic is added here, be sure to mirror that there as well.

        var respect_search_results_order = true;

        // First, list options that start with the input text
        for (option of this.option_list) {
            label = (option["label_text"] || option["display_name"] || "").toString();

            if (!label.length || !label.toLocaleLowerCase("en-US").startsWith(search_text)) {
                continue;
            }

            this.search_results.push(option["id"]);

            added_ids.push(option["id"]);

            if (max_results && this.search_results.length >= max_results) {
                break;
            }
        }

        // Below those options, list options that don't start with the input text, but contain it
        for (option of this.option_list) {
            if (added_ids.includes(option["id"])) {
                continue;
            }

            label = (option["label_text"] || option["display_name"] || "").toString();

            if (!label.length || !label.toLocaleLowerCase("en-US").includes(search_text)) {
                continue;
            }

            this.search_results.push(option["id"]);

            added_ids.push(option["id"]);

            if (max_results && this.search_results.length >= max_results) {
                break;
            }
        }

        this.manage_search_list(false, respect_search_results_order);
    };

    this.on_search_text_submitted = function () {
        if (this.multi_select) {
            return;
        }

        var search_text = this.search_input.Text();

        if (search_text.length < 1) {
            this.on_click();

            return;
        }

        var selected_id = this.search_result_ids[this.combo_option_index];

        for (var option of this.option_list) {
            if (option["id"] === selected_id) {
                this.on_selection(option, false, search_text);

                return;
            }
        }
    };

    this.manage_search_list = function (show_all=false, respect_search_results_order=false) {
        var i;
        var id;
        var option;
        var button;

        this.combo_option_index = 0;
        this.search_result_ids = [];
        this.search_result_rows = [];

        if (show_all) {
            respect_search_results_order = false;

            for (id in this.manage_search_button_map) {
                this.manage_search_button_map[id].html.detach();
            }

            for (button of this.row_buttons) {
                this.rows.append(button.html);
            }
        }

        var option_list = respect_search_results_order ? [] : this.option_list;

        this.manage_search_button_map = respect_search_results_order ? {} : null;

        if (respect_search_results_order) {
            var map = {};

            for (i in this.option_list) {
                option = this.option_list[i];
                button = this.row_buttons[i];

                button.html.detach();

                if (this.search_results.includes(option["id"])) {
                    map[option["id"]] = option;

                    this.manage_search_button_map[option["id"]] = button;
                }

                else {
                    if (  // Include default combo
                           this.default_search_submit_combo
                        && this.default_search_submit_combo["id"] === option["id"]
                    ) {
                        option_list.push(option);

                        this.rows.append(button.html);
                    }
                }
            }

            for (id of this.search_results) {
                option_list.push(map[id]);

                this.rows.append(this.manage_search_button_map[id].html);
            }
        }

        this.rows.stop().css({
            "height": "auto",
            "overflow": this.max_rows_before_scroll ? (
                option_list.length <= this.max_rows_before_scroll ? "hidden" : "auto"
            ) : "hidden"
        });

        for (i in option_list) {
            option = option_list[i];
            button = respect_search_results_order ? this.manage_search_button_map[option["id"]] : this.row_buttons[i];

            button.SetSearchResultActive(false);

            if (
                   show_all
                || respect_search_results_order
                || (  // Include default combo
                       this.default_search_submit_combo
                    && this.default_search_submit_combo["id"] === option["id"]
                )
                || this.search_results.includes(option["id"])
            ) {
                if (show_all && !this.search_results.includes(option["id"])) {
                    this.search_results.push(option["id"]);
                }

                if (!this.search_result_ids.includes(option["id"])) {
                    this.search_result_ids.push(option["id"]);
                }

                if (!this.search_result_rows.includes(button)) {
                    this.search_result_rows.push(button);
                }

                button.html.css({
                    "display": "block"
                });
            }

            else {
                button.html.css({
                    "display": "none"
                });
            }
        }

        // if (this.search_result_rows.length === 0 && this.default_search_submit_combo) {
        //     // Is something supposed to happen here? Why is this empty?
        // }

        if (this.search_result_rows.length > 0) {
            this.search_result_rows[0].SetSearchResultActive(true);
        }
    };
}
