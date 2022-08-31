function DashGuiLoadingLabel (binder, label_text, height=null, color=null) {
    this.binder = binder;
    this.label_text = label_text;
    this.height = height || Dash.Size.ButtonHeight;

    this.html = null;
    this.loading_dots = null;
    this.color = color || this.binder.color || Dash.Color.Light;
    this.label = $("<div>" + this.label_text + "</div>");


    this.setup_styles = function () {
        this.loading_dots = new Dash.Gui.LoadDots(this.height, this.color);
        this.html = this.loading_dots.html;

        this.html.append(this.label);

        this.html.css({
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-bottom": this.height
        });

        this.label.css({
            "position": "absolute",
            "left": -100,
            "right": -100,
            "top": this.height - Dash.Size.Padding,
            "bottom": -(this.height - Dash.Size.Padding),
            "height": this.height,
            "line-height": this.height + "px",
            "text-align": "center",
            "color": this.color.Text,
            "opacity": 0
        });

        this.Start();

        this.label.animate({"opacity": 1}, 250);
    };

    this.Clear = function () {
        // This function will fade out the loading label while converting
        // it to an absolutely positioned element. Since this element is
        // really meant to be used to show while something is loading, once
        // loading is complete, this flow makes it easy to build the loaded
        // content without having to wait to fade out the label first and fire a callback.

        if (this.html) {
            this.html.css({
                "position": "absolute",
                "top": this.html[0].offsetTop,
                "left": this.html[0].offsetLeft
            });
        }

        this.Stop();

        if (this.label) {
            this.label.stop().animate({"opacity": 0}, 250, this.destroy.bind(this));
        }
    };

    this.Stop = function () {
        if (this.loading_dots) {
            this.loading_dots.Stop();
        }
    };

    this.Start = function () {
        if (this.loading_dots) {
            this.loading_dots.Start();
        }
    };

    this.SetText = function (text) {
        if (this.label) {
            this.label.text(text);
        }
    };

    // Called after fade out is complete
    this.destroy = function () {
        if (this.label) {
            this.label.remove();
        }

        if (this.loading_dots) {
            this.loading_dots.html.remove();
        }

        if (this.html) {
            this.html.remove();
        }

        this.label = null;
        this.loading_dots = null;
        this.html = null;
    };

    this.setup_styles();
}
