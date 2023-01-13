function DashGuiContext2DCanvas (editor) {
    this.editor = editor;

    this.aspect_ratio = [1, 1];
    this.html = $("<div></div>");
    this.color = this.editor.color;
    this.canvas = $("<div></div>");
    this.padding = Dash.Size.Padding * 2;

    // TODO: flexible, unscaled canvas in the middle of the interface for all elements to be drawn on,
    //  with bounding box that represents working area based on selected aspect ratio, and canvas shouldn't
    //  flex smaller than the bounding box (or bounding box and contained elements should shrink when
    //  the canvas gets too small) - default behavior when an element is clicked should probably be to
    //  auto-select the layer and be able to manipulate it without having to select the desired layer first

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.StrokeDark,
            "box-sizing": "border-box",
            "border-bottom": "1px solid " + this.color.StrokeLight,
            "padding": Dash.Size.Padding * 2
        });

        this.canvas.css({
            "background": this.color.Background,
            "width": this.get_calc_dimension(100),
            "height": this.get_calc_dimension(100),
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        });

        this.canvas.hide();

        this.html.append(this.canvas);
    };

    this.SetCursor = function (type) {
        this.canvas.css({
            "cursor": type
        });
    };

    this.Resize = function () {
        var aspect_ratio = this.editor.GetAspectRatio();
        var width = aspect_ratio[0];
        var height = aspect_ratio[1];

        if (width === this.aspect_ratio[0] && height === this.aspect_ratio[1]) {
            return;
        }

        this.aspect_ratio = aspect_ratio;

        console.log("Canvas resized to new aspect ratio:", width + "/" + height);

        if (width > height) {
            this.canvas.css({
                "width": this.get_calc_dimension(100),
                "height": this.get_calc_dimension((height / width) * 100)
            });
        }

        else if (width < height) {
            this.canvas.css({
                "width": this.get_calc_dimension((width / height) * 100),
                "height": this.get_calc_dimension(100)
            });
        }

        else {
            this.canvas.css({
                "width": this.get_calc_dimension(100),
                "height": this.get_calc_dimension(100)
            });
        }

        this.canvas.show();
    };

    this.get_calc_dimension = function (percent) {
        return ("calc(" + percent + "% - " + (this.padding * 2) + "px)");
    };

    this.setup_styles();
}
