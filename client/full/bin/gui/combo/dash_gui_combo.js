function DashGuiCombo (label, callback, binder, option_list, selected_option_id, color, options, bool) {
    this.label              = label;
    this.binder             = binder;
    this.callback           = callback.bind(this.binder);
    this.option_list        = option_list;
    this.selected_option_id = selected_option_id;
    this.color              = color || Dash.Color.Light;
    this.color_set          = null;
    this.initialized        = false;
    this.options            = options || {};
    this.style              = this.options["style"] || "default";
    this.additional_data    = this.options["additional_data"] || {};
    this.bool               = bool || false;

    this.html = $("<div></div>");

    // ---------------------------------------------------

    this.html = $("<div class='Combo'></div>");
    this.highlight = $("<div class='Combo'></div>");
    this.click = $("<div class='Combo'></div>");
    this.label_container = $("<div class='ComboLabel Combo'></div>");
    this.label = $("<div class='ComboLabel Combo'></div>");
    this.rows = $("<div class='Combo'></div>");
    this.click_skirt = null;

    this.hide_skirt = function () {
        if (!this.click_skirt) {
            return;
        }

        for (var i in this.click_skirt) {
            var panel = this.click_skirt[i];

            panel.remove();
        }

        this.click_skirt = null;

    };

    this.draw_click_skirt = function (height, width) {
        this.hide_skirt();

        this.click_skirt = [];

        this.click_skirt = [
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>"),
            $("<div class='ComboClickSkirt Combo'></div>")
        ];

        var skirt_thickness = Dash.Size.ColumnWidth*1.2;
        var set_left = [0, width, 0, -skirt_thickness]; // top, right, bottom, left
        var set_top = [-skirt_thickness, -skirt_thickness, height, -skirt_thickness]; // top, right, bottom, left
        var set_width = [width, skirt_thickness, width, skirt_thickness]; // top, right, bottom, left
        var set_height = [skirt_thickness, height+(skirt_thickness*2), skirt_thickness, height+(skirt_thickness*2)]; // top, right, bottom, left

        for (var i in this.click_skirt) {
            var panel = this.click_skirt[i];

            panel.css({
                "position": "absolute",
                "left": set_left[i],
                "top": set_top[i],
                "width": set_width[i],
                "height": set_height[i],
                "z-index": 100,
            });

            this.html.append(panel);
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

    this.GetActiveID = function () {
        return this.selected_option_id;
    };

    this.SetModeOff = function () {
        var cmd_options = {"command": "TurnModeOff", "mindtwin_id": "markiplier", "mode": ""};
        this.link.tab_view.send_trigger("json_command", cmd_options);
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
        this.flash();

        if (this.expanded) {
            this.hide();
        }

        else {
            this.show();
        }
    };

    this.SetLabel = function (content) {
        this.label.text(content["label"]);
    };

    this.SetID = function (combo_id) {
        this.selected_option_id = ComboUtils.GetDataFromID(this.option_list, combo_id);
        this.on_selection(this.selected_option_id, true);
        this.flash();
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
            console.log("label_text == null");
            console.log("this.initialized: " + this.initialized);
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

        var width = this.rows.width() + Dash.Size.Padding;
        var label_width = 0;
        var i;

        this.rows.css({
            "width": width,
        });

        for (i in this.row_buttons) {
            var scroll_width = this.row_buttons[i].html[0]["scrollWidth"];

            if (scroll_width <= label_width) {
                continue;
            }

            label_width = scroll_width;
        }

        for (i in this.row_buttons) {
            // this.row_buttons[i].SetWidth(width);
            this.row_buttons[i].SetWidthToFit(label_width); // This is important so it can auto-size
        }
    };

    this.show = function () {
        this.pre_show_size_set();

        this.rows.detach();
        this.html.append(this.rows);

        this.expanded = true;
        this.rows.stop();
        var start_height = this.rows.height();

        this.rows.css({
            "height": "auto",
        });

        var end_height = this.rows.height();

        this.draw_click_skirt(end_height, this.rows.width());

        this.rows.css({
            "height": start_height,
            "z-index": 2000,
        });

        this.rows.animate({"height": end_height}, 150);
    };

    this.SetWidth = function (width) {
        this.html.css({"width": width});
        this.rows.css({"width": width});
    };

    this.hide = function () {
        this.expanded = false;
        this.hide_skirt();
        this.rows.stop();
        this.rows.animate({"height": 0, "opacity": 0}, 250, function () {$(this).css({"z-index": 10});});
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
        })(this);
    };

    this.initialize_style();
    this.setup_connections();
}
