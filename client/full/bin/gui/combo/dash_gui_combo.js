function DashGuiCombo (label, callback, binder, option_list, selected_option_id, color=null, options={}, bool=false) {
    this.name = label;  // Unused (except in multi-select mode, for which it's now been repurposed)
    this.callback = callback.bind(binder);
    this.binder = binder;
    this.option_list = option_list;
    this.selected_option_id = selected_option_id;
    this.color = color || Dash.Color.Light;
    this.options = options;
    this.bool = bool;

    this.color_set = null;
    this.row_buttons = [];
    this.click_skirt = null;
    this.searchable_min = 20;
    this.initialized = false;
    this.dropdown_icon = null;
    this.flash_enabled = true;
    this.gravity_vertical = 0;
    this.is_searchable = false;
    this.selected_option = null;
    this.combo_option_index = 0;
    this.gravity_horizontal = 0;
    this.list_offset_vertical = 0;
    this.highlighted_button = null;
    this.init_labels_drawn = false;
    this.previous_selected_option = null;
    this.show_rows_on_empty_search = true;
    this.default_search_submit_combo = null;
    this.html = $("<div class='Combo'></div>");
    this.rows = $("<div class='Combo'></div>");
    this.click = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.style = this.options["style"] || "default";
    this.read_only = this.options["read_only"] || false;
    this.label = $("<div class='ComboLabel Combo'></div>");
    this.multi_select = this.options["multi_select"] || false;
    this.additional_data = this.options["additional_data"] || {};
    this.label_container = $("<div class='ComboLabel Combo'></div>");

    // Originally wrote this to check programmatically for every combo, but
    // got concerned that it was inefficient to check any and every combo
    this.is_user_list = this.options["is_user_list"] || false;

    // This is managed in this.handle_arrow_input(), but should ideally also
    // be set back to false in whatever code is referencing this attribute
    this.enter_key_event_fired = false;

    this.random_id = "combo_" + Dash.Math.RandomID() + "_" +
                     (this.option_list[0]["label_text"] || this.option_list[0]["display_name"]) +
                     "_" + this.option_list[0]["id"];

    DashGuiComboInterface.call(this);

    this.initialize_style = function () {
        // Toss a warning if this isn't a known style, so we don't fail silently
        this.styles = ["default", "row"];

        if (!this.styles.includes(this.style)) {
            console.error("Error: Unknown Dash Combo Style: " + this.style);

            this.style = "default";
        }

        if (this.style === "row") {
            this.color_set  = this.color.Button;

            DashGuiComboStyleRow.call(this);
        }

        else {
            this.color_set  = this.color.Button;

            DashGuiComboStyleDefault.call(this);
        }

        this.setup_styles();
        this.initialize_rows();
    };

    this.hide_skirt = function () {
        if (!this.click_skirt) {
            return;
        }

        for (var i in this.click_skirt) {
            this.click_skirt[i].remove();
        }

        this.click_skirt = null;
    };

    this.add_dropdown_icon = function (icon_size_mult=0.75, icon_name="arrow_down") {
        if (this.read_only) {
            return;
        }

        this.dropdown_icon = new Dash.Gui.Icon(
            this.color,
            icon_name,
            Dash.Size.RowHeight,
            icon_size_mult,
            this.style === "default" ? this.color.Button.Text.Base : null
        );

        this.dropdown_icon.html.addClass("ComboLabel");
        this.dropdown_icon.html.addClass("Combo");

        this.dropdown_icon.html.css(this.dropdown_icon_css);

        this.label_container.append(this.dropdown_icon.html);
    };

    this.draw_click_skirt = function (height, width) {
        this.hide_skirt();

        if (this.is_searchable) {
            height = this.html.height();
        }

        this.click_skirt = [
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>")
        ];

        var skirt_thickness = Dash.Size.ColumnWidth * 1.2;
        var skirt_top = skirt_thickness;
        var bottom_top = height;
        var right_width = skirt_thickness;

        if (this.gravity_vertical > 0) {
            skirt_top += this.gravity_vertical;
            bottom_top = this.html.height();
        }

        // top -> right -> bottom -> left
        var set_left = [0, width, 0, -skirt_thickness];
        var set_top = [-skirt_top, -skirt_top, bottom_top, -skirt_top];
        var set_width = [width, right_width, width, skirt_thickness];
        var set_height = [skirt_thickness, height + (skirt_thickness * 2), skirt_thickness, height + (skirt_thickness * 2)];

        for (var i in this.click_skirt) {
            var panel = this.click_skirt[i];

            panel.css({
                "position": "absolute",
                "left": set_left[i] - this.gravity_horizontal,
                "top": set_top[i] + this.list_offset_vertical,
                "width": set_width[i],
                "height": set_height[i],
                "z-index": 1000,
                "cursor": "pointer"
            });

            this.html.append(panel);

            this.trim_skirt_panel(panel);
        }
    };

    // Trim the skirts if they extend beyond the window size (for divs that don't manage their overflow)
    this.trim_skirt_panel = function (panel) {
        if ((panel.offset().left + panel.width()) > window.innerWidth) {
            panel.css({
                // Remaining space - the rough width of a scrollbar in case there is one
                "width": Math.floor(window.innerWidth - panel.offset().left) - (Dash.Size.Padding * 2)
            });
        }

        if ((panel.offset().top + panel.height()) > window.innerHeight) {
            panel.css({
                "height": Math.floor(window.innerHeight - panel.offset().top)
            });
        }
    };

    this.initialize_rows = function () {
        if (this.multi_select) {
            this.update_label_for_multi_select();

            this.initialized = true;

            return;
        }

        var selected_obj = null;

        if (this.option_list.length > 0) {
            selected_obj = this.option_list[0];
        }

        if (this.selected_option_id) {
            for (var option of this.option_list) {
                if (option["id"].toString() === this.selected_option_id.toString()) {
                    selected_obj = option;

                    break;
                }
            }
        }

        if (selected_obj) {
            this.on_selection(selected_obj);
        }

        else {
            // It appears that, in this case, this.initialized doesn't get set to true - is that deliberate?
            this.label.text("No Options");
        }
    };

    this.setup_load_dots = function () {
        this.load_dots = new Dash.Gui.LoadDots(Dash.Size.ButtonHeight - Dash.Size.Padding);

        this.load_dots.SetOrientation("vertical");
        this.load_dots.SetColor("rgba(0, 0, 0, 0.7)");

        this.html.append(this.load_dots.html);

        if (this.text_alignment.toString() === "right") {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding * 0.5,
                "right": -(Dash.Size.ButtonHeight - Dash.Size.Padding * 1.5),
            });
        }

        else {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding * 0.5,
                "left": -(Dash.Size.ButtonHeight - Dash.Size.Padding * 1.5),
            });
        }
    };

    this.setup_label_list = function () {
        this.rows.css({
            "background": this.color_set.Background.Base,
            "box-shadow": "0px 0px 100px 1px rgba(0, 0, 0, 0.4)",
            "opacity": 1,
            "left": 0,
            "top": 0,
            "width": "auto"  // This is important so it can auto-size
        });

        // TODO: Make this.rows grab focus while active?

        this.rows.empty();

        this.row_buttons = [];

        for (var i in this.option_list) {
            var button = new DashGuiComboRow(this, this.option_list[i]);

            this.rows.append(button.html);

            this.row_buttons.push(button);
        }

        this.init_labels_drawn = true;
    };

    this.on_click = function (skirt_clicked=false) {
        if (this.read_only) {
            return;
        }

        if (!skirt_clicked && this.initialized && this.multi_select) {
            if (!this.expanded) {
                this.show();
            }

            // The user may still be making selections, let them click out when done (or hit the escape key)
            return;
        }

        if (this.flash_enabled) {
            this.flash();
        }

        if (this.is_searchable && this.search_active) {
            this.hide_searchable();
        }

        if (this.expanded) {
            this.hide();
        }

        else {
            this.show();
        }
    };

    this.flash = function () {
        this.click.stop().css({"opacity": 1});
        this.click.stop().animate({"opacity": 0}, 2000);
    };

    // Called when a selection in the combo is made
    this.on_selection = function (selected_option, ignore_callback=false, search_text=null) {
        if (this.multi_select) {
            this.update_label_for_multi_select();
        }

        else {
            this._on_selection(selected_option, ignore_callback, search_text);
        }

        this.initialized = true;

        Dash.Temp.SetLastComboChanged(this);
    };

    this._on_selection = function (selected_option, ignore_callback=false, search_text=null) {
        var label_text = selected_option["label_text"] || selected_option["display_name"];

        if (!label_text) {
            this.label.text("ERROR");

            return;
        }

        this.hide();

        this.label.text(label_text);

        this.previous_selected_option = this.selected_option;
        this.selected_option = selected_option;
        this.selected_option_id = selected_option["id"];

        if (this.initialized && !ignore_callback && this.callback) {
            this.callback(selected_option, this.previous_selected_option, this.additional_data, search_text);
        }
    };

    this.update_label_for_multi_select = function () {
        if (!this.multi_select) {
            return;
        }

        this.label.text(this.get_multi_select_label());
    };

    this.get_multi_select_label = function () {
        if (!this.multi_select) {
            return "";
        }

        if (!this.row_buttons.length) {
            return (this.name || "Multiple Options");
        }

        var selections = this.GetMultiSelections(false);

        if (selections.length === 1) {
            return (selections[0]["label_text"] || selections[0]["display_name"] || this.name || "Nothing Selected");
        }

        if (selections.length > 1) {
            return "Multiple Selections";
        }

        return (this.name || "Nothing Selected");
    };

    // Prior to showing, set the width of rows (this is all important, so it can auto-size)
    this.pre_show_size_set = function () {
        this.setup_label_list();

        var i;
        var label_width = 0;

        this.rows.css({
            "width": "fit-content"
        });

        for (i in this.row_buttons) {
            var scroll_width = this.row_buttons[i].html[0]["scrollWidth"];

            if (scroll_width <= label_width) {
                continue;
            }

            label_width = scroll_width;
        }

        for (i in this.row_buttons) {
            this.row_buttons[i].SetWidthToFit(label_width);
        }

        var html_width = this.inner_html ? this.inner_html.width() : this.html.width();

        if (html_width > this.rows.width()) {
            this.rows.css({
                "width": html_width
            });

            for (i in this.row_buttons) {
                this.row_buttons[i].SetWidthToFit(html_width);
            }
        }
    };

    this.determine_gravity = function (end_height) {
        var gravity = null;
        var total_height = this.html.offset().top + this.html.height() + end_height;

        this.gravity_vertical = 0;
        this.gravity_horizontal = 0;

        // Expand the combo upwards if not enough room below
        if (total_height > window.innerHeight) {

            // As long as there's enough room above
            if (end_height < this.html.offset().top) {
                gravity = this.html.height() - end_height;
            }

            // Otherwise, if there's enough room on screen, raise it up enough to not cause overflow
            else {
                if (end_height < window.innerHeight) {
                    gravity = -(Math.floor(total_height - this.html.height() - window.innerHeight));
                }
            }

            if (gravity !== null) {
                this.gravity_vertical = Math.abs(gravity);

                this.rows.css({
                    "top": gravity + this.list_offset_vertical
                });
            }
        }

        // If the row list width is wider than this.html (assuming this.html is deliberately placed/contained on the page)
        if (this.rows.width() > this.html.width()) {

            // Expand the combo to the left if not enough room on the right
            if ((this.html.offset().left + this.html.width() + this.rows.width()) > window.innerWidth) {

                // As long as there's enough room to the left
                if (this.rows.width() < this.html.offset().left) {
                    gravity = this.html.width() - this.rows.width();

                    this.gravity_horizontal = Math.abs(gravity);

                    this.rows.css({
                        "left": gravity
                    });
                }
            }
        }
    };

    this.show = function () {
        this.pre_show_size_set();

        // This is an extra safety check in case the combo was updated after setup
        // (very unlikely to be triggered, but just in case)
        if (!this.is_searchable && this.option_list.length > this.searchable_min) {
            this.EnableSearchSelection();
        }

        if (this.is_searchable && this.option_list.length < this.searchable_min) {
            // TODO: DisableSearchSelection() - function needs to be written

            // This is important for cases where the combo option list changes after setup
        }

        if (this.is_searchable) {
            this.activate_search();
        }

        this.rows.detach();

        this.html.append(this.rows);

        this.expanded = true;

        this.rows.stop();

        var start_height = this.rows.height();

        this.rows.css({
            "height": "auto",
        });

        var end_height = this.rows.height();

        this.determine_gravity(end_height);
        this.draw_click_skirt(end_height, this.rows.width());

        this.rows.css({
            "height": start_height,
            "z-index": 2000
        });

        this.rows.animate({"height": end_height}, 150);

        if (this.is_searchable) {
            this.rows.css({
                "top": this.html.height() + this.list_offset_vertical
            });

            this.manage_search_list();
        }

        if (!this.is_searchable) {
            (function (self) {
                $(window).on(
                    "keydown." + self.random_id,
                    function (event) {
                        self.handle_arrow_input(self, event);
                    }
                );
            })(this);
        }
    };

    this.hide = function () {
        this.expanded = false;
        this.highlighted_button = null;

        this.hide_skirt();

        this.rows.stop();
        this.rows.animate({"height": 0, "opacity": 0}, 250, function () {$(this).css({"z-index": 10});});

        if (this.is_searchable && this.search_active) {
            this.hide_searchable();
        }

        if (!this.is_searchable) {
            $(window).off("keydown." + this.random_id);
        }

        if (this.initialized && this.multi_select && this.callback) {
            var selections = this.GetMultiSelections();

            this.update_label_for_multi_select();

            this.callback(selections, this.additional_data);

            Dash.Temp.SetLastComboChanged(this);
        }
    };

    this.setup_connections = function () {
        (function (self) {
            $(window).on("click." + self.random_id, function (event) {
                if (!self.html.is(":visible")) {
                    $(window).off("click." + self.random_id);  // Kill this when leaving the page

                    return;
                }

                if (!self.expanded) {
                    return;
                }

                if (!$(event.target).hasClass("Combo")) {
                    self.hide();

                    event.preventDefault();

                    if (event.originalEvent) {
                        event.originalEvent.preventDefault();
                    }

                    return false;
                }
            });

            self.html.on("mouseenter", function () {
                self.highlight.stop().css({"opacity": 1});
            });

            self.html.on("mouseleave", function () {
                self.highlight.stop().animate({"opacity": 0}, 200);
            });

            self.html.on("click", function (e) {
                if ($(e.target).hasClass("ComboLabel")) {
                    self.on_click();

                    e.preventDefault();

                    return false;
                }

                if ($(e.target).hasClass("ComboClickSkirt")) {
                    self.on_click(true);

                    e.preventDefault();

                    return false;
                }
            });

            // This delayed check is important because the option_list size may have changed after the first frame
            setTimeout(
                function () {
                    if (!self.is_searchable && self.option_list.length > self.searchable_min) {
                        self.EnableSearchSelection();
                    }
                },
                300
            );
        })(this);
    };

    this.handle_arrow_input = function (self, event) {
        if (!self.html.is(":visible")) {
            $(window).off("keydown." + self.random_id);  // Kill this when leaving the page

            return;
        }

        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        if (self.is_searchable) {
            if (self.search_result_ids.length < 1) {
                return;  // No search results
            }
        }

        else {
            if (!self.expanded) {
                return;  // No combo option rows
            }
        }

        var i;
        var draw = false;
        var buttons = self.row_buttons;

        if (self.is_searchable) {
            buttons = self.search_result_rows;
        }

        self.enter_key_event_fired = false;

        if (event.key === "Down" || event.key === "ArrowDown") {
            var new_index = self.combo_option_index + 1;

            if (new_index > buttons.length - 1) {
                return;
            }

            self.combo_option_index = new_index;

            draw = true;
        }

        else if (event.key === "Up" || event.key === "ArrowUp") {
            if (self.combo_option_index === 0) {
                return;
            }

            self.combo_option_index -= 1;

            draw = true;
        }

        else if (event.key === "Escape") {
            self.hide();

            return;
        }

        else if (event.key === "Enter" && self.highlighted_button) {
            self.enter_key_event_fired = true;

            if (self.multi_select && self.highlighted_button.checkbox) {
                self.highlighted_button.checkbox.Toggle();

                self.update_label_for_multi_select();
            }

            else if (!this.is_searchable) {
                for (i in self.option_list) {
                    var option = self.option_list[i];

                    if (parseInt(i) === self.combo_option_index) {
                        self.on_selection(option);

                        break;
                    }
                }
            }
        }

        else {
            return;
        }

        if (draw) {
            for (i in buttons) {
                var button = buttons[i];

                if (parseInt(i) === parseInt(self.combo_option_index.toString())) {
                    self.highlighted_button = button;

                    button.SetSearchResultActive(true);
                }

                else {
                    button.SetSearchResultActive(false);
                }
            }
        }

        event.preventDefault();
    };

    this.initialize_style();
    this.setup_connections();
}
