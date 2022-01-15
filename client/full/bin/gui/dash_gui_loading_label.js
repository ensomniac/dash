function DashGuiLoadingLabel (binder, label_text) {
    this.binder       = binder;
    this.label_text   = label_text;

    this.height       = Dash.Size.ButtonHeight;
    this.color        = this.binder.color || Dash.Color.Light;
    this.label        = $("<div>" + this.label_text + "</div>");
    this.loading_dots = new Dash.Gui.LoadDots(this.height, this.color);

    this.html         = this.loading_dots.html;

    this.setup_styles = function () {
        this.html.append(this.label);

        this.html.css({
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-bottom": this.height,
            // "background": "black"
        });

        this.label.css({
            "position": "absolute",
            "left": -100,
            "right": -100,
            "top": this.height-Dash.Size.Padding,
            "bottom": -(this.height-Dash.Size.Padding),
            "height": this.height,
            "line-height": this.height + "px",
            "text-align": "center",
            "color": this.color.Text,
            "opacity": 0
        });

        this.loading_dots.Start();

        this.label.animate({"opacity": 1}, 250);
    };

    // Called after fade out is complete
    this.destroy = function () {
        this.label.remove();

        this.loading_dots.html.remove();

        this.html.remove();

        this.label = null;
        this.loading_dots = null;
        this.html = null;
    };

    this.Clear = function () {
        // This function will fade out the loading label while converting
        // it to an absolutely positioned element. Since this element is
        // really meant to be used to show while something is loading, once
        // loading is complete, this flow makes it easy to build the loaded
        // content without having to wait to fade out the label first and fire a callback

        this.html.css({
            "position": "absolute",
            "top": this.html[0].offsetTop,
            "left": this.html[0].offsetLeft
        });

        this.label.stop().animate({"opacity": 0}, 250, this.destroy.bind(this));

        this.loading_dots.Stop();
    };

    this.Stop = function () {
        this.loading_dots.Stop();
    };

    this.SetText = function (text) {
        this.label.text(text);
    };

    this.setup_styles();
}
