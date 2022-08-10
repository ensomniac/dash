function DashLayoutDashboard (binder, color=null) {
    this.binder = binder;
    this.color  = color || this.binder.color || Dash.Color.Dark;

    this.modules = [];
    this.canvas_containers = [];
    this.margin = 1;
    this.padding = 0.4;
    this.rect_aspect_ratio = "2 / 1";
    this.square_aspect_ratio = "1 / 1";
    this.html = Dash.Gui.GetHTMLAbsContext();

    this.VerticalSpaceTakenPercent = null;
    this.VerticalSpaceAvailablePercent = null;

    this.AddSquareTagModule = function () {
        return this.add_module("square", "tag");
    };

    this.AddSquareRadialModule = function () {
        return this.add_module("square", "radial");
    };

    this.AddRectListModule = function () {
        return this.add_module("rect", "list");
    };

    this.AddFlexBarModule = function () {
        return this.add_module("flex", "bar");
    };

    this.SetVerticalSpacePercent = function (num) {
        num = parseInt(num);

        if (isNaN(num)) {
            console.error("Error: Invalid number passed to SetVerticalSpacePercent()");

            return;
        }

        this.VerticalSpaceTakenPercent = num.toString() + "%";
        this.VerticalSpaceAvailablePercent = this.get_available_vertical_space_percent();
    };

    this.setup_styles = function () {
        this.SetVerticalSpacePercent(15);

        this.html.css({
            "background": this.color.Background,
            "display": "flex",
            "overflow": "hidden"
        });
    };

    this.add_module = function (style, sub_style) {
        var index = this.modules.length;
        var module = new DashLayoutDashboardModule(this, style, sub_style);

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

        container.style.padding = this.padding.toString() + "vh";  // TEMP
        container.style.margin = this.margin.toString() + "vh";  // TEMP

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
