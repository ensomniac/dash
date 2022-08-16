function DashDocsHelp () {
    this.html = $("<div></div>");
    this.color = Dash.Color.Light;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "padding": Dash.Size.Padding
        });

        this.add_py();
        this.add_js();
    };

    this.add_py = function () {
        this.html.append(this.get_header("Python (Back End)", "python_logo"));

        var container = this.get_type_container();

        container.append(this.get_url_label(
            "Docstring parsing expects reStructuredText syntax",
            "https://docutils.sourceforge.io/docs/user/rst/cheatsheet.txt",
            "reStructuredText"
        ));

        this.html.append(container);
    };

    this.add_js = function () {
        this.html.append(this.get_header("JavaScript (Front End)", "javascript_logo"));

        var container = this.get_type_container();

        container.append(this.get_url_label(
            "Docstring parsing expects JSDoc syntax",
            "https://jsdoc.app",
            "JSDoc"
        ));

        this.html.append(container);
    };

    this.get_type_container = function () {
        var container = $("<div></div>");

        container.css({
            "border-left": "2px solid " + this.color.Pinstripe,
            "margin-left": Dash.Size.Padding * 1.5,
            "padding-left": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding * 4
        });

        return container;
    };

    this.get_url_label = function (full_text, url, text_segment_to_link) {
        var container = $("<div></div>");

        container.css({
            "display": "flex"
        });

        // var url_label = (
        //     "<a style='text-decoration: underline; font-family: sans_serif_bold, sans-serif; color: " +
        //     this.color.Button.Background.Base + "' href='" + url + "'>" + text_segment_to_link + "</a>"
        // );

        var font_size = "125%";
        var url_label = $("<a href='" + url + "'>" + text_segment_to_link + "</a>");

        url_label.css({
            "text-decoration": "underline",
            "color": this.color.Button.Background.Base,
            "font-family": "sans_serif_bold",
            "font-size": font_size,
            "padding-left": Dash.Size.Padding * 0.4,
            "padding-right": Dash.Size.Padding * 0.4
        });

        var split = full_text.split(text_segment_to_link);
        var start = this.get_label(split[0], font_size, "italic", this.color.Stroke);
        var end = this.get_label(split.Last(), font_size, "italic", this.color.Stroke);

        container.append(start);
        container.append(url_label);
        container.append(end);

        return container;
    };

    this.get_label = function (text, font_size="100%", font_family="normal", color="") {
        var label = $("<div>" + text + "</div>");

        label.css({
            "font-size": font_size,
            "color": color || this.color.Text,
            "font-family": "sans_serif_" + font_family
        });

        return label;
    };

    this.get_header = function (label_text, icon_name) {
        var container = $("<div></div>");

        container.css({
            "display": "flex",
            "margin-bottom": Dash.Size.Padding
        });

        container.append(this.get_label(label_text, "200%", "bold"));

        (function (self) {
            requestAnimationFrame(function () {
                var icon = new Dash.Gui.Icon(
                    self.color,
                    icon_name,
                    container.height(),
                    0.9,
                    self.color.AccentGood
                );

                icon.html.css({
                    "margin-right": Dash.Size.Padding * 0.5
                });

                container.prepend(icon.html);
            });
        })(this);

        return container;
    };

    this.setup_styles();
}
