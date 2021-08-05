/** @member DashGuiCombo*/

function DashGuiComboSearch () {
    this.is_searchable = true;
    this.search_active = false;
    this.search_input = null;
    this.search_container = null;
    this.search_max_results = 10;
    this.search_results = [];
    this.search_result_rows = [];
    this.search_result_ids = [];
    this.search_result_index = 0;

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
            self.html[0].addEventListener("keydown", function (event) {
                if (event.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }

                if (!self.html.is(":visible")) {
                    return;
                }

                if (self.search_result_ids.length < 1) {
                    return;
                }

                switch (event.key) {
                    case "Down":
                        self.on_search_arrow_down();

                        break;

                    case "ArrowDown":
                        self.on_search_arrow_down();

                        break;

                    case "Up":
                        self.on_search_arrow_up();

                        break;

                    case "ArrowUp":
                        self.on_search_arrow_up();

                        break;

                    default:
                        return;
                }
                event.preventDefault();
            }, true);
        })(this);
    };

    this.on_search_arrow_up = function () {
        if (parseInt(this.search_result_index) === 0) {
            return;
        }

        this.search_result_index -= 1;
        this.draw_search_button_index_selection();
    };

    this.on_search_arrow_down = function () {
        var new_index = this.search_result_index+1;

        if (new_index > this.search_result_ids.length-1) {
            return;
        }

        this.search_result_index = new_index;
        this.draw_search_button_index_selection();
    };

    this.draw_search_button_index_selection = function () {
        for (var i in this.search_result_rows) {

            var button = this.search_result_rows[i];

            if (parseInt(i) === parseInt(this.search_result_index)) {
                button.SetSearchResultActive(true);
            }

            else {
                button.SetSearchResultActive(false);
            }
        }
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
        this.search_result_rows = [];
        this.search_result_ids = [];
        this.search_result_index = 0;

        this.label_container.css({
            "opacity": 1,
        });
    };

    this.create_search_input = function () {
        this.search_container = $("<div></div>");
        this.html.append(this.search_container);

        this.search_container.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "width": this.list_width,
            "height": this.html.height()
        });

        this.search_input = new Dash.Gui.Input(" Type to search...", this.color);
        this.search_input.SetText(this.selected_option_id["label_text"]);

        this.search_input.OnChange(this.on_search_text_changed, this);
        this.search_input.OnSubmit(this.on_search_text_selected, this);
        this.search_input.DisableBlurSubmit();

        this.search_container.append(this.search_input.html);

        this.search_input.html.css({
            "box-shadow": "none",
            "background": "none",
        });

        if (this.style === "row") {
            this.search_input.html.css({
                "left": -Dash.Size.Padding,
                "top": -Dash.Size.Padding * 0.5
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

                self.manage_search_list(true);
            });
        })(this);
    };

    this.on_search_text_changed = function () {
        var search = this.search_input.Text().toLocaleLowerCase();

        if (search.length === 0) {
            this.manage_search_list(true);

            return;
        }

        this.search_results = [];

        for (var i in this.option_list) {
            var opt = this.option_list[i]["label_text"].toLocaleLowerCase();

            if (search.length < 3) {
                // For a short search, only match the beginning
                if (opt.startsWith(search)) {
                    this.search_results.push(this.option_list[i]["id"]);
                }
            }

            else {
                if (opt.includes(search)) {
                    this.search_results.push(this.option_list[i]["id"]);
                }
            }

            if (this.search_results.length >= this.search_max_results) {
                break;
            }
        }

        this.manage_search_list();
    };

    this.on_search_text_selected = function () {
        var search = this.search_input.Text();

        if (search.length < 1) {
            this.on_click();

            return;
        }

        var selected_id = this.search_result_ids[this.search_result_index];
        var selected_option = null;

        for (var i in this.option_list) {
            var content = this.option_list[i];

            if (content["id"] === selected_id) {
                selected_option = content;

                break;
            }
        }

        if (selected_option) {
            this.on_selection(selected_option);
        }
    };

    this.manage_search_list = function (show_all=false) {
        this.rows.stop().css({"height": "auto"});

        this.search_result_rows = [];
        this.search_result_ids = [];
        this.search_result_index = 0;

        for (var i in this.option_list) {
            var content = this.option_list[i];
            var button = this.row_buttons[i];

            button.SetSearchResultActive(false);

            if (show_all || this.search_results.includes(content["id"])) {
                if (show_all && !this.search_results.includes(content["id"])) {
                    this.search_results.push(content["id"]);
                }

                this.search_result_ids.push(content["id"]);
                this.search_result_rows.push(button);

                button.html.css({
                    "display": "block",
                });
            }

            else {
                button.html.css({
                    "display": "none",
                });
            }
        }

        if (this.search_result_rows.length > 0) {
            this.search_result_rows[0].SetSearchResultActive(true);
        }
    };
}
