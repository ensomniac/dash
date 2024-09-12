function DashDocsIcons () {
    this.html      = $("<div></div>");
    this.color     = Dash.Color.Light;
    this.tile_size = Dash.Size.ColumnWidth;
    this.icon_size = this.tile_size * 0.5;

    this.setup_styles = function () {
        this.html.css({
            "padding":         Dash.Size.Padding,
            "display":         "flex",
            "flex-wrap":       "wrap",
            "align-content":   "flex-start",
            "align-items":     "center",
            "justify-content": "center"
        });

        for (var icon_name in DashGuiIconMap) {
            this.add_icon(icon_name);
        }
    };

    this.add_icon = function (icon_name) {
        var container        = $("<div></div>");
        var highlight        = $("<div></div>");
        var copied_highlight = $("<div>Copied!</div>");
        var label_1          = $("<div>" + DashGuiIconMap[icon_name][0] + "</div>");
        var label_2          = $("<div>" + icon_name + "</div>");

        var icon = new Dash.Gui.Icon(
            this.color,
            icon_name,
            this.icon_size,
            0.5,
            this.color.Background
        );

        container.append(highlight);
        container.append(icon.html);
        container.append(label_1);
        container.append(label_2);
        container.append(copied_highlight);

        container.css({
            "background":    "rgba(0, 0, 0, 0.1)",
            "cursor":        "pointer",
            "width":         this.tile_size,
            "height":        this.tile_size,
            "margin-right":  Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "border-radius": Dash.Size.BorderRadius
        });

        highlight.css({
            "position":       "absolute",
            "left":           0,
            "right":          0,
            "top":            0,
            "bottom":         0,
            "background":     "rgba(255, 255, 255, 0.8)",
            "opacity":        0.0,
            "pointer-events": "none",
            "border-radius":  Dash.Size.BorderRadius
        });

        label_1.css({
            "color":          this.color.Text,
            "position":       "absolute",
            "overflow":       "hidden",
            "text-overflow":  "ellipsis",
            "white-space":    "nowrap",
            "left":           Dash.Size.Padding,
            "text-align":     "center",
            "bottom":         (Dash.Size.Padding * 1.2) + Dash.Size.RowHeight,
            "width":          this.tile_size - (Dash.Size.Padding * 2),
            "height":         Dash.Size.RowHeight,
            "line-height":    Dash.Size.RowHeight + "px",
            "font-size":      (Dash.Size.RowHeight * 0.8) + "px",
            "pointer-events": "none"
        });

        label_2.css({
            "color":          this.color.Text,
            "position":       "absolute",
            "left":           0,
            "bottom":         Dash.Size.Padding,
            "width":          this.tile_size,
            "height":         Dash.Size.RowHeight,
            "line-height":    Dash.Size.RowHeight + "px",
            "text-align":     "center",
            "font-size":      (Dash.Size.RowHeight * 0.6) + "px",
            "font-family":    "sans_serif_bold",
            "pointer-events": "none"
        });

        copied_highlight.css({
            "color":          "orange",
            "position":       "absolute",
            "left":           0,
            "top":            Dash.Size.Padding * 1.1,
            "width":          this.tile_size,
            "height":         Dash.Size.RowHeight,
            "line-height":    Dash.Size.RowHeight + "px",
            "text-align":     "center",
            "font-size":      (Dash.Size.RowHeight * 0.5) + "px",
            "font-family":    "sans_serif_bold",
            "pointer-events": "none",
            "opacity":        0
        });

        icon.html.css({
            "background":     "rgba(0, 0, 0, 0.7)",
            "position":       "absolute",
            "left":           (this.tile_size * 0.5) - (this.icon_size * 0.5),
            "top":            Dash.Size.Padding,
            "border-radius":  Dash.Size.BorderRadius,
            "pointer-events": "none",
            "user-select":    "none"
        });

        container.on("click", () => {
            this.copy_icon_name(icon_name, container, highlight, copied_highlight);
        });

        this.html.append(container);
    };

    this.copy_icon_name = function (icon_name, container, highlight, copied_highlight) {
        navigator.clipboard.writeText(icon_name).then(() => {
            // Ignore returned promise
        });

        highlight.stop().animate(
            {"opacity": 1},
            150,
            function () {
                $(this).animate({"opacity": 0}, 3000);
            }
        );

        copied_highlight.stop().animate(
            {"opacity": 1},
            150,
            function () {
                $(this).animate({"opacity": 0}, 4000);
            }
        );

    };

    this.setup_styles();
}
