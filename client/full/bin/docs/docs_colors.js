function DashDocsColors (color=null) {
    this.color = color || Dash.Color.Light;

    this.html = $("<div></div>");
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.light_dark_box   = $("<div></div>");
    this.colors_light_box = $("<div></div>");
    this.colors_dark_box  = $("<div></div>");
    this.chip_height = (Dash.Size.RowHeight * 2);

    this.setup_styles = function () {

        this.html.append(this.light_dark_box);
        this.light_dark_box.append(this.colors_light_box, this.colors_dark_box);

        this.html.css({
        });

        this.light_dark_box.css({
            "background": "green",
            "display": "flex",
        });

        this.colors_light_box.css({
            "flex-grow": 2,
            "padding": Dash.Size.Padding,
        });

        this.colors_dark_box.css({
            "flex-grow": 2,
            "padding": Dash.Size.Padding,

        });

        this.setup_dl_box("Dash.Color.Light", this.colors_light_box, Dash.Color.Light);
        this.setup_dl_box("Dash.Color.Dark", this.colors_dark_box, Dash.Color.Dark);

    };

    this.setup_dl_box = function (color_label, html, color_set) {

        console.log(">", color_set);

        html.css({
            "background": color_set.Background,
        });

        var header = new Dash.Gui.Header(color_label, color_set, true);

        html.append(header.html);
        html.append(this.get_color_chip("Background Color", "this.color.Background", color_set, color_set.Background));

        var accent_good = this.get_color_chip("Accent Good", "this.color.AccentGood", color_set, color_set.AccentGood);
        var accent_bad  = this.get_color_chip("Accent Bad",  "this.color.AccentBad",  color_set, color_set.AccentBad);

        html.append(this.get_side_by_side_chip(accent_good, accent_bad));

        html.append(this.get_color_chip("Background Color", "this.color.Background", color_set, color_set.Background));


    };

    this.get_side_by_side_chip = function (chip_left, chip_right) {

        var container = $("<div></div>");

        container.css({
            "height": this.chip_height + (Dash.Size.Padding * 2),
            "display": "flex",
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 0px 10px 0px rgba(0, 0, 0, 0.2)",
            "margin-bottom": Dash.Size.Padding,
        });

        container.append(chip_left);
        container.append(chip_right);

        chip_left.css({"flex-grow":  2, "margin-right": Dash.Size.Padding * 0.5, "margin-bottom": 0});
        chip_right.css({"flex-grow": 2, "margin-left":  Dash.Size.Padding * 0.5, "margin-bottom": 0});

        return container;

    };

    this.get_color_chip = function (label_text, example_path, color_set, color) {

        var bg_color = Dash.Color.Lighten(color_set.Background, 10);

        // var chip_height = (Dash.Size.RowHeight * 2);
        var label_height = this.chip_height / 2.0;

        var chip        = $("<div></div>");
        var chip_swatch = $("<div></div>");

        var label_1       = $("<div>" + label_text   + "</div>");
        var label_2       = $("<div>" + example_path + "</div>");

        chip.append(label_1);
        chip.append(label_2);
        chip.append(chip_swatch);

        chip.css({
            "height": this.chip_height,
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": bg_color,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 0px 10px 0px rgba(0, 0, 0, 0.2)"
        });

        label_1.css({
            "color": color_set.Text,
            "height": label_height,
            "line-height": (label_height) + "px",
            "font-size": (label_height * 0.8) + "px",
            "font-family": "sans_serif_bold",
            "margin-right": this.chip_height + Dash.Size.Padding,
            "overflow":      "hidden",
            "text-overflow": "ellipsis",
            "white-space":   "nowrap",
        });

        label_2.css({
            "color": color_set.Text,
            "height": label_height,
            "line-height": label_height + "px",
            "margin-right": this.chip_height + Dash.Size.Padding,
            "overflow":      "hidden",
            "text-overflow": "ellipsis",
            "white-space":   "nowrap",
        });

        chip_swatch.css({
            "background": color,
            "position": "absolute",
            "right": Dash.Size.Padding,
            "top": Dash.Size.Padding,
            "bottom": Dash.Size.Padding,
            "width": this.chip_height,
            "border-radius": Dash.Size.BorderRadius,
            "box-shadow": "0px 0px 10px 0px rgba(0, 0, 0, 0.2)"
        });

        return chip;

    };




    this.setup_styles();

}
