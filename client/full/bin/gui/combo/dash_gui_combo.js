function DashGuiCombo (label, callback, binder, option_list, selected_option_id, color=Dash.Color.Light, options={}, bool=false) {
    this.label              = label;
    this.binder             = binder;
    this.callback           = callback.bind(this.binder);
    this.option_list        = option_list;
    this.selected_option_id = selected_option_id;
    this.color              = color;
    this.color_set          = null;
    this.initialized        = false;
    this.options            = options;
    this.style              = this.options["style"] || "default";
    this.additional_data    = this.options["additional_data"] || {};
    this.bool               = bool;

    this.list_width = -1;
    this.gravity_vertical = 0;
    this.gravity_horizontal = 0;
    this.click_skirt = null;
    this.dropdown_icon = null;
    this.flash_enabled = true;
    this.list_offset_vertical = 0;
    this.html = $("<div class='Combo'></div>");
    this.rows = $("<div class='Combo'></div>");
    this.click = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.label = $("<div class='ComboLabel Combo'></div>");
    this.label_container = $("<div class='ComboLabel Combo'></div>");

    DashGuiComboInterface.call(this);

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
        this.dropdown_icon = new DashIcon(
            this.color,
            icon_name,
            Dash.Size.RowHeight,
            icon_size_mult
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

    this.initialize_style = function () {
        // Toss a warning if this isn't a known style so we don't fail silently
        this.styles = ["default", "row", "standalone"];

        if (!this.styles.includes(this.style)) {
            console.log("Error: Unknown Dash Combo Style: " + this.style);

            this.style = "default";
        }

        if (this.style == "row") {
            this.color_set  = this.color.Button;

            DashGuiComboStyleRow.call(this);
        }

        else if (this.style == "default") {
            this.color_set  = this.color.Button;

            DashGuiComboStyleDefault.call(this);
        }

        else {
            this.color_set  = this.color.Button;

            DashGuiComboStyleDefault.call(this);
        }

        this.setup_styles();
        this.initialize_rows();
    };

    this.initialize_rows = function () {
        var selected_obj = null;

        if (this.option_list.length > 0) {
            selected_obj = this.option_list[0];
        }

        for (var x in this.option_list) {
            if (this.option_list[x]["id"] == this.selected_option_id) {
                selected_obj = this.option_list[x];

                break;
            }
        }

        if (selected_obj) {
            this.on_selection(selected_obj);
        }

        else {
            this.label.text("No Options");
        }
    };

    this.setup_load_dots = function () {
        this.load_dots = new LoadDots(Dash.Size.ButtonHeight-Dash.Size.Padding);

        this.load_dots.SetOrientation("vertical");
        this.load_dots.SetColor("rgba(0, 0, 0, 0.7)");

        this.html.append(this.load_dots.html);

        if (this.text_alignment == "right") {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding*0.5,
                "right": -(Dash.Size.ButtonHeight-Dash.Size.Padding*1.5),
            });
        }

        else {
            this.load_dots.html.css({
                "position": "absolute",
                "top": Dash.Size.Padding*0.5,
                "left": -(Dash.Size.ButtonHeight-Dash.Size.Padding*1.5),
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
            "width": "auto", // This is important so it can auto-size
        });

        // TODO: Make this.rows grab focus while active

        this.rows.empty();
        this.row_buttons = [];

        for (var i in this.option_list) {
            // var content = this.option_list[i];
            var button = new DashGuiComboRow(this, this.option_list[i]);

            this.rows.append(button.html);
            this.row_buttons.push(button);
        }
    };

    this.on_click = function () {
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

    this.on_selection = function (selected_option, ignore_callback) {
        // Called when a selection in the combo is made

        var previous_selected_option = this.selected_option_id;
        var label_text = selected_option["label_text"] || selected_option["display_name"];

        if (!label_text) {
            this.label.text("ERROR");

            return;
        }

        this.hide();
        this.label.text(label_text);

        this.selected_option_id = selected_option;

        if (this.initialized && !ignore_callback && this.callback) {
            if (this.additional_data) {
                this.callback(selected_option, previous_selected_option, this.additional_data);
            }

            else {
                this.callback(selected_option, previous_selected_option);
            }
        }

        this.initialized = true;
    };

    this.pre_show_size_set = function () {
        // Prior to showing, set the width of rows
        this.setup_label_list();

        this.list_width = this.rows.width() + Dash.Size.Padding;
        var label_width = 0;
        var i;

        this.rows.css({
            "width": this.html.width() > this.rows.width() ? this.html.width() : this.list_width,
        });

        for (i in this.row_buttons) {
            var scroll_width = this.row_buttons[i].html[0]["scrollWidth"];

            if (scroll_width <= label_width) {
                continue;
            }

            label_width = scroll_width;
        }

        for (i in this.row_buttons) {
            this.row_buttons[i].SetWidthToFit(label_width); // This is important so it can auto-size
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
    };

    this.hide = function () {
        this.expanded = false;

        this.hide_skirt();

        this.rows.stop();
        this.rows.animate({"height": 0, "opacity": 0}, 250, function () {$(this).css({"z-index": 10});});

        if (this.is_searchable && this.search_active) {
            this.hide_searchable();
        }
    };

    this.setup_connections = function () {
        (function (self) {
            $(window).on("click", function (event) {
                if (!self.expanded) {
                    return;
                }

                if (!self.html.is(":visible")) {
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
                    self.on_click();
                    e.preventDefault();

                    return false;
                }
            });

            if (self.option_list.length > 20) {
                setTimeout(function(){

                    // This secondary check is important because the option_list
                    // size may have changed after the first frame
                    if (!self.is_searchable && self.option_list.length > 20) {
                        self.EnableSearchSelection();
                    }

                }, 200);
            }
        })(this);
    };

    this.initialize_style();
    this.setup_connections();
}
