function DashLayoutDashboard (binder, color=null, vertical_space_percent=15) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;
    this.vertical_space_percent = vertical_space_percent;

    this.margin = 1;
    this.vsizes = {};
    this.modules = [];
    this.vmargins = {};
    this.padding = 0.4;
    this.canvas_containers = [];
    this.rect_aspect_ratio = "2 / 1";
    this.square_aspect_ratio = "1 / 1";
    this.html = Dash.Gui.GetHTMLAbsContext();

    this.VerticalSpaceTakenPercent = null;
    this.VerticalSpaceAvailablePercent = null;

    this.AddSquareTagModule = function (header_text="", label_header_text="", label_text="") {
        var mod = this.add_module("square", "tag", header_text);

        if (label_text.toString()) {
            mod.SetLabelText(label_text);
        }

        if (label_header_text.toString()) {
            mod.SetLabelHeaderText(label_header_text);
        }

        return mod;
    };

    this.AddSquareRadialModule = function (header_text="", label_header_text="", radial_fill_percent=null) {
        var mod = this.add_module("square", "radial", header_text);

        if (parseInt(radial_fill_percent)) {
            mod.SetRadialFillPercent(radial_fill_percent);
        }

        if (label_header_text.toString()) {
            mod.SetLabelHeaderText(label_header_text);
        }

        return mod;
    };

    this.AddRectListModule = function (header_text="") {
        return this.add_module("rect", "list", header_text);
    };

    this.AddFlexBarModule = function (header_text="", bar_data=null) {
        var mod = this.add_module("flex", "bar", header_text);

        if (bar_data) {
            mod.SetBarData(bar_data);
        }

        return mod;
    };

    this.AddDivider = function () {
        if (!this.modules.length) {
            Dash.Log.Warn("No modules in dashboard, can't add divider");

            return;
        }

        var divider = $("<div></div>");
        var module = this.modules.Last()["module"];

        this.html.append(divider);

        (function (self) {
            requestAnimationFrame(function () {
                module.html.css({
                    "margin-right": 0
                });

                divider.css({
                    "width": Dash.Size.Stroke,
                    "height": module.html.height(),
                    "margin-top": parseInt(module.html.css("margin-top")) + (parseInt(module.html.css("padding-top")) * 2),
                    "margin-left": Dash.Size.Padding * 2,
                    "margin-right": Dash.Size.Padding * 2,
                    "background": self.color.AccentGood
                });
            });
        })(this);

        return divider;
    };

    this.SetVerticalSpacePercent = function (num) {
        num = parseInt(num);

        if (isNaN(num)) {
            console.error("Error: Invalid number passed to SetVerticalSpacePercent()");

            return;
        }

        this.vertical_space_percent = num;
        this.VerticalSpaceTakenPercent = num.toString() + "%";
        this.VerticalSpaceAvailablePercent = this.get_available_vertical_space_percent();

        for (var data of this.modules) {
            this.modules["module"].setup_styles(true);  // CSS update only
        }
    };

    this.Empty = function () {
        this.modules = [];
        this.canvas_containers = [];

        this.html.empty();
    };

    this.get_text_vsize = function (percentage_decimal_of_dashboard_size) {
        var key = this.VerticalSpaceTakenPercent + "_" + percentage_decimal_of_dashboard_size;

        if (this.vsizes[key]) {
            return this.vsizes[key];
        }

        this.vsizes[key] = this.get_rounded_single_decimal(this.vertical_space_percent) * percentage_decimal_of_dashboard_size;

        return this.vsizes[key];
    };

    this.get_vmargin = function (margin_mult=1) {
        var key = this.VerticalSpaceTakenPercent + "_" + margin_mult;

        if (this.vmargins[key]) {
            return this.vmargins[key];
        }

        // 15 is the default vertical_space_percent
        this.vmargins[key] = this.get_rounded_single_decimal(
            (this.margin * margin_mult) * (this.vertical_space_percent / 15)
        );

        return this.vmargins[key];
    };

    this.get_rounded_single_decimal = function (value) {
        // Multiplying by 10 and then dividing by 10 yields a single decimal place, if applicable
        return Math.round(value * 10) / 10;
    };

    this.setup_styles = function () {
        this.SetVerticalSpacePercent(this.vertical_space_percent);

        this.html.css({
            "background": this.color.Background,
            "display": "flex",
            "overflow": "hidden"
        });
    };

    this.add_module = function (style, sub_style, header_text="") {
        var index = this.modules.length;
        var module = new DashLayoutDashboardModule(this, style, sub_style);

        if (header_text.toString()) {
            module.SetHeaderText(header_text);
        }

        this.html.append(module.html);

        this.modules.push({
            "module": module,
            "style": style,
            "sub_style": sub_style,
            "index": index
        });

        this.update_canvas_containers();

        return module;
    };

    this.get_available_vertical_space_percent = function () {
        return (100 - parseInt(this.VerticalSpaceTakenPercent)).toString() + "%";
    };

    // Document scope
    this.update_canvas_containers = function () {
        var i;
        var styles = [];

        for (i in this.modules) {
            styles.push(this.modules[i]["style"]);
        }

        for (i in this.canvas_containers) {
            try {
                document.body.removeChild(this.canvas_containers[i]["container"]);
                document.body.removeChild(this.canvas_containers[i]["script"]);
            }

            catch {
                // Not a child, continue/pass
            }

            if (window[this.canvas_containers[i]["id"]]) {
                delete window[this.canvas_containers[i]["id"]];
            }
        }
        
        this.canvas_containers = [];

        for (i in this.modules) {
            var canvas = this.modules[i]["module"].canvas;

            if (!canvas) {
                continue;
            }

            this.add_canvas(canvas, styles, this.modules[i]["index"]);

            if (!this.modules[i]["module"].canvas["gui"]) {
                var gui = window[this.modules[i]["module"].canvas["id"]];

                if (gui) {
                    this.modules[i]["module"].canvas["gui"] = gui;
                }
            }
        }
    };

    // Document scope
    this.add_canvas = function (canvas, styles, index) {
        var canvas_container = canvas["container"];
        var canvas_script = canvas["script"];

        if (!canvas_container || !canvas_script || !styles || styles.length < 1) {
            console.error("Error: Something went wrong when updating canvas containers x0741");

            return;
        }

        var top_container = document.createElement("div");
        top_container.style.display = "flex";
        top_container.style.position = "absolute";
        top_container.style.width = "100%";
        top_container.style.top = parseInt(this.VerticalSpaceAvailablePercent) + "vh";  // TEMP
        top_container.style.height = (parseInt(this.VerticalSpaceTakenPercent) - 0.1) + "vh";  // TEMP

        for (var i in styles) {
            if (parseInt(i) === index) {
                top_container.appendChild(canvas_container);
            }
            
            else {
                top_container.appendChild(this.get_placeholder_container(styles[i], i));
            }
        }

        // IMPORTANT: Must be at document level (added dynamically) for Chart script objects to properly display
        document.body.appendChild(top_container);
        document.body.appendChild(canvas_script);

        var new_container_data = {...canvas};
        new_container_data["container"] = top_container;

        this.canvas_containers.push(new_container_data);
    };

    // Document scope
    this.get_placeholder_container = function (type, index) {
        var container = document.createElement("div");

        container.style.padding = this.padding + "vh";  // TEMP
        container.style.margin = this.get_vmargin() + "vh";  // TEMP

        if (type === "square") {
            container.style.aspectRatio = this.square_aspect_ratio;
        }

        else if (type === "rect") {
            container.style.aspectRatio = this.rect_aspect_ratio;
        }

        else if (type === "flex") {
            container.style.flex = "1";
        }

        if (parseInt(index) > 0) {
            container.style.marginLeft = "0px";
        }

        return container;
    };

    this.setup_styles();
}
