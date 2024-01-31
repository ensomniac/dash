function DashDocsBox (docs_view, name, data) {
    this.name = name;
    this.data = data;

    this.ext = docs_view.ext;
    this.is_py = this.ext === "py";
    this.is_js = this.ext === "js";

    if (!this.is_py && !this.is_js) {
        console.error("Invalid extension for docs:", this.ext);

        this.html = $("<div>ERROR: See console</div>");

        return;
    }

    this.html = $("<div></div>");
    this.color = Dash.Color.Light;
    this.type_label_color = docs_view.type_label_color || this.color.AccentGood;
    this.default_label_color = docs_view.default_label_color || this.color.Button.Background.Base;

    this.description_css = {
        "color": this.color.Stroke,
        "white-space": "pre-wrap",
        "font-family": "sans_serif_italic"
    };

    this.setup_styles = function () {
        Dash.Log.Log("Data:", this.data);

        this.html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "padding": Dash.Size.Padding
        });

        this.add_comment_and_docstring();
        this.add_classes();
        this.add_functions();
    };

    this.add_comment_and_docstring = function () {
        var container = this.get_header_container(this.name, "275%");

        container.append(this.get_comment_docstring_box(this.data));

        this.html.append(container);
    };

    // Format certain bits of text in place so we don't need to create new divs for each little thing while keeping the arrangement intact
    this.format_text = function (text) {
        var replace = {
            "TODO": (
                "<i style='font-family: sans_serif_italic, sans-serif; white-space: " +
                "pre-wrap; color: " + this.color.AccentBad + "'>TODO</i>"
            )
        };

        for (var value in replace) {
            text = text.replaceAll(value, replace[value]);
        }

        for (var type of ["str", "float", "int", "bool", "list", "dict", "tuple"]) {
            text = text.replaceAll(
                "(" + type + ")",
                (
                    "(<i style='font-family: sans_serif_bold, sans-serif; white-space: " +
                    "pre-wrap; color: " + this.type_label_color + "'>" + type + "</i>)"
                )
            );
        }

        if (text.includes("default=")) {
            var split = text.split("default=");
            var start = split[0] + "default=";

            split = split.Last().split(")");

            var default_value = (
                "<i style='font-family: sans_serif_bold, sans-serif; white-space: pre-wrap; " +
                "color: " + this.default_label_color + "'>" + split.shift() + "</i>"
            );

            for (var def of ['"', "true", "false", "[", "]", "(", ")", "{", "}"]) {
                default_value = default_value.replaceAll(
                    def,
                    (
                        "<i style='font-family: sans_serif_bold, sans-serif; white-space: " +
                        "pre-wrap; color: " + this.default_label_color + "'>" + def + "</i>"
                    )
                );
            }

            default_value += ")";

            var end = split.join(")");

            text = start + default_value + end;
        }

        return text;
    };

    this.get_class_box = function (name, data) {
        var [container, header] = this.get_header_container(name, "140%", true, true);

        if (this.is_js) {
            this.setup_js_class(data, container);
        }

        this.add_attributes(data, container);

        if (this.is_py) {
            this.add_properties(data, container);
        }

        var boxes = this.add_functions(container, data, "160%", data["inherits_from"]);
        var init_box = boxes["private"]["boxes"]["__init__"];

        if (!init_box) {
            return container;
        }

        init_box.detach();

        init_box.css({
            "margin-left": 0
        });

        header.detach();

        container.prepend(init_box);
        container.prepend(header);

        return container;
    };

    this.setup_js_class = function (data, container) {
        var comment_box = this.get_comment_docstring_box(data);  // TODO: JS isn't tracking class docstrings, but probably should... another time.

        comment_box.css({
            "margin-bottom": Dash.Size.Padding
        });

        if (data["inherits_from"]) {
            var inherits = $("<div><b>Inherits from:</b> " + data["inherits_from"].join(", ") + "</div>");

            inherits.css({
                ...this.description_css,
                "margin-bottom": Dash.Size.Padding
            });

            comment_box.prepend(inherits);
        }

        container.append(comment_box);

        this.add_params(data, container);
    };

    this.add_attributes = function (data, container) {
        for (var key of ["public", "private"]) {
            if (!Dash.Validate.Object(data["attributes"][key])) {
                continue;
            }

            var box = this.get_header_container("Attributes (" + key.Title() + ")", "160%", true);

            this.add_params(data["attributes"], box, key);

            container.append(box);
        }
    };

    this.add_properties = function (data, container) {
        for (var key of ["public", "private"]) {
            if (!Dash.Validate.Object(data["properties"][key])) {
                continue;
            }

            var box = this.get_header_container("Properties (" + key.Title() + ")", "160%", true);

            for (var name of Object.keys(data["properties"][key]).sort()) {
                var prop_data = data["properties"][key][name];
                var prop_container = this.get_header_container(name + " (" + (prop_data["type"] || "Missing type") + ")", "120%");

                prop_container.css({
                    "margin-bottom": Dash.Size.Padding * 1.5,
                    "margin-left": Dash.Size.Padding * 2
                });

                prop_container.append(this.get_comment_docstring_box(prop_data));

                box.append(prop_container);
            }

            container.append(box);
        }
    };

    this.get_function_box = function (name, data, add_auth_label=false, class_inherits=null) {
        var container = this.get_header_container(name, "140%", true);

        if (name !== "__init__") {
            container.css({
                "border-left": "1px solid " + this.color.Pinstripe,
                "padding-left": Dash.Size.Padding
            });
        }

        var comment_box = this.get_comment_docstring_box(data);

        comment_box.css({
            "margin-bottom": Dash.Size.Padding
        });

        container.append(comment_box);

        if (add_auth_label) {
            var label = $("<div>Requires Authorization</div>");

            label.css({
                ...this.description_css,
                "color": this.color.Button.Background.Base,
                "font-family": "sans_serif_bold",
                "margin-bottom": Dash.Size.Padding
            });

            comment_box.prepend(label);
        }

        else if (name === "__init__" && class_inherits) {
            var inherits = $("<div><b>Inherits from:</b> " + class_inherits.join(", ") + "</div>");

            inherits.css({
                ...this.description_css,
                "margin-bottom": Dash.Size.Padding
            });

            comment_box.prepend(inherits);
        }

        this.add_params(data, container, "params", 1.5);

        return container;
    };

    this.add_params = function (data, container, key="params", pad_mult=2) {
        var box = null;
        var order = (key === "params" ? Object.keys(data[key]) : Object.keys(data[key]).sort());

        for (var param_name of order) {
            box = this.get_param_box(param_name, data[key][param_name]);

            box.css({
                "margin-left": Dash.Size.Padding * pad_mult
            });

            container.append(box);
        }

        if (box) {
            box.css({
                "margin-bottom": 0  // Last box
            });
        }
    };

    this.get_param_box = function (name, data) {
        var container = this.get_header_container(name + " (" + (data["type"] || "Missing type") + ")", "110%");

        container.css({
            "margin-bottom": Dash.Size.Padding * 1.5
        });

        var text = "";

        if (data["default"] !== "") {
            if (typeof data["default"] === "object") {
                data["default"] = JSON.stringify(data["default"]);
            }

            var default_value = ("(default=" + data["default"] + ") ").replaceAll("<", "&lt;");

            text += "<i style='font-family: sans_serif_bold, sans-serif; white-space: pre-wrap; color: " + this.color.StrokeLight + "'>" + default_value + "</i>";
        }

        text += (data["description"] || "Missing description");

        var box = $("<div>" + this.format_text(text) + "</div>");

        box.css({
            ...this.description_css,
            "margin-top": Dash.Size.Padding * 0.25,
            "margin-left": Dash.Size.Padding * 2
        });

        container.append(box);

        return container;
    };

    this.add_classes = function () {
        var container = this.get_header_container("Classes", "200%", true);

        for (var name of Object.keys(this.data["classes"]).sort()) {
            var box = this.get_class_box(name, this.data["classes"][name]);

            box.css({
                "margin-left": Dash.Size.Padding * 2,
                "border-left": "1px solid " + this.color.Pinstripe,
                "padding-left": Dash.Size.Padding
            });

            container.append(box);
        }

        this.html.append(container);
    };

    this.add_functions = function (append_to_html=null, data=null, font_size="200%", class_inherits=null) {
        if (append_to_html === null) {
            append_to_html = this.html;
        }

        if (data === null) {
            data = this.data;
        }

        var boxes = this.get_function_boxes(data, font_size, class_inherits);

        for (var key of ["endpoints", "public", "private"]) {
            if (!Dash.Validate.Object(boxes[key]) || !Dash.Validate.Object(boxes[key]["boxes"])) {
                continue;
            }

            append_to_html.append(boxes[key]["container"]);
        }

        return boxes;
    };

    this.get_function_boxes = function (data, font_size="200%", class_inherits=null) {
        var boxes = {};

        for (var key in data["functions"]) {
            if (!(key in boxes)) {
                boxes[key] = {};
            }

            var name;
            var container = this.get_header_container("Functions (" + key.Title() + ")", font_size, true);

            boxes[key]["container"] = container;
            boxes[key]["boxes"] = {};

            for (name of Object.keys(data["functions"][key]).sort()) {
                var box = this.get_function_box(name, data["functions"][key][name], key === "endpoints", class_inherits);

                box.css({
                    "margin-left": Dash.Size.Padding * 2
                });

                container.append(box);

                boxes[key]["boxes"][name] = box;
            }
        }

        return boxes;
    };

    this.get_comment_docstring_box = function (data) {
        var box = $("<div></div>");

        box.css({
            "margin-left": Dash.Size.Padding * 0.25,
            "padding-left": Dash.Size.Padding,
            "padding-top": Dash.Size.Padding * 0.5,
            "padding-bottom": Dash.Size.Padding * 0.5,
            "border-left": "2px solid " + this.color.StrokeLight
        });

        var ds_css = {
            ...this.description_css,
            "margin-bottom": Dash.Size.Padding
        };

        var ds_is_obj = typeof data["docstring"] === "object";
        var ds_description = (ds_is_obj ? data["docstring"]["description"] : data["docstring"]) || "Missing docstring";
        var docstring = $("<div>" + this.format_text("<b>Docstring:</b> " + ds_description) + "</div>");

        docstring.css(ds_is_obj || data["comment"] ? ds_css : this.description_css);

        box.append(docstring);

        if (ds_is_obj) {
            var return_data = data["docstring"]["return"] || {};
            var rt_type = return_data["type"] || "Missing type";
            var rt_description = return_data["description"] || "Missing description";
            var return_details = $("<div>" + this.format_text("<b>Return (" + rt_type + "):</b> " + rt_description) + "</div>");

            return_details.css(data["comment"] ? ds_css : this.description_css);

            box.append(return_details);
        }

        if (data["comment"]) {
            var comment = $("<div>" + this.format_text("<b>Comment:</b> " + data["comment"]) + "</div>");

            comment.css(this.description_css);

            box.append(comment);
        }

        return box;
    };

    this.get_header_container = function (text, font_size="100%", include_dropdown=false, return_header=false) {
        var container = $("<div></div>");

        container.css({
            "margin-bottom": Dash.Size.Padding * (font_size === "275%" ? 3 : (font_size === "200%" || text === "__init__") ? 2 : 1),
            "overflow": "hidden",
            "height": "auto"
        });

        if (text === "__init__") {
            return container;
        }

        var header = $("<div>" + this.format_text(text) + "</div>");

        var header_css = {
            "color": font_size === "160%" ? this.color.Stroke : this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": font_size,
            "display": "flex"
        };

        // Function
        if (font_size === "140%") {
            header_css = {
                ...header_css,
                "border-radius": Dash.Size.Padding * 2,
                "padding-left": Dash.Size.Padding,
                "padding-right": Dash.Size.Padding,
                "margin-top": Dash.Size.Padding * 0.5,
                "margin-bottom": Dash.Size.Padding * 0.5,
                "background": this.color.Pinstripe,
                "border": "1px solid " + this.color.AccentGood,
                "width": "fit-content"
            };
        }

        // Param
        else if (font_size === "110%") {
            header_css = {
                ...header_css,
                "border-radius": Dash.Size.BorderRadius,
                "padding-left": Dash.Size.Padding * 0.1,
                "padding-right": Dash.Size.Padding * 0.1,
                "height": "fit-content",
                "background": this.color.Pinstripe,
                "width": "fit-content"
            };
        }

        header.css(header_css);

        container.append(header);

        if (include_dropdown) {
            this.add_dropdown_icon(container, header);
        }

        if (return_header) {
            return [container, header];
        }

        return container;
    };

    this.add_dropdown_icon = function (container, header) {
        (function (self) {
            requestAnimationFrame(function () {
                var icon = new Dash.Gui.IconButton(
                    "caret_up",
                    function (event, button) {
                        if (!button._og_container_height) {
                            button._og_container_height = container.outerHeight();
                        }

                        try {
                            container.parent().css({
                                "height": "auto"
                            });
                        }

                        catch {
                            // Pass
                        }

                        container.stop().animate(
                            {"height": button.icon_name === "caret_up" ? header.outerHeight(Boolean(header.css("border"))) : button._og_container_height},
                            200,
                            function () {
                                button.SetIcon(button.icon_name === "caret_up" ? "caret_down" : "caret_up");
                            }
                        );
                    },
                    self,
                    self.color,
                    {
                        "container_size": header.outerHeight(),
                        "size_mult": 0.75
                    }
                );

                header.append(icon.html);
            });
        })(this);
    };

    this.setup_styles();
}
