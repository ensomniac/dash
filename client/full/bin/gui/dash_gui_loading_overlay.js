function DashGuiLoadingOverlay (color, progress=0, label_prefix="Loading", html_to_append_to=null, simple=false) {
    this.color = color || Dash.Color.Light;
    this.progress = progress;
    this.label_prefix = label_prefix;
    this.html_to_append_to = html_to_append_to;
    this.simple = simple;

    // Not using 'this.html' is unconventional, but in order for this to be a single GUI element
    // with a transparent background and an opaque bubble, we can't use the typical 'this.html',
    // because then all the elements are either transparent or opaque, not able to be individually
    // set. So instead of appending 'this.html' to the desired element, use this.AppendTo().

    this.bubble = null;
    this.background = null;
    this.bubble_dots = null;
    this.bubble_label = null;

    this.setup_styles = function () {
        this.background = new Dash.Gui.GetHTMLAbsContext();

        this.background.css({
            "z-index": 100000,
            "background": this.color.BackgroundRaised,
            "opacity": 0.5
        });

        // Block any elements from being clicked until app is done loading/processing/etc
        this.background.on("click", function (event) {
            event.stopPropagation();
        });

        this.setup_bubble();

        if (this.html_to_append_to) {
            this.AppendTo(this.html_to_append_to);
        }
    };

    // See note at the top
    this.AppendTo = function (html) {
        if (!html) {
            console.warn("DashGuiLoadingOverlay AppendTo() requires an HTML element:", html);

            return;
        }

        html.append(this.background);
        html.append(this.bubble);

        this.html_to_append_to = html;
    };

    this.Show = function () {
        if (this.simple) {
            this.background.css({
                "opacity": 0.5
            });

            this.bubble.css({
                "opacity": 1
            });

            return;
        }

        if (this.background.is(":visible")) {
            return;
        }

        if (!this.html_to_append_to) {
            console.warn("DashGuiLoadingOverlay Show() requires the 'html_to_append_to' param to be provided on init:", this.html_to_append_to);

            return;
        }

        this.AppendTo(this.html_to_append_to);
    };

    this.Hide = function () {
        this.background.css({
            "opacity": 0
        });

        this.bubble.css({
            "opacity": 0
        });
    };

    this.Remove = function () {
        if (this.simple) {
            this.Hide();

            return;
        }

        this.bubble_dots.Stop();

        this.background.remove();
        this.bubble.remove();

        this.progress = 0;
    };

    this.SetProgress = function (progress) {
        if (progress > 0 && progress < 1) {
            progress = progress * 100;
        }

        progress = parseInt(progress);

        if (isNaN(progress)) {
            return;
        }

        if (progress < 0 || progress >= 100) {
            this.Remove();

            return;
        }

        this.progress = progress;

        this.Show();

        this.bubble_dots.Start();

        this.bubble_label.SetText(this.get_loading_label_text(progress));
    };

    this.setup_bubble = function () {
        this.bubble = new Dash.Gui.GetHTMLBoxContext();

        this.bubble.css({
            "position": "absolute",
            "inset": 0,
            "z-index": 100001,
            "display": "flex",
            "margin": Dash.Size.Padding,
            "padding": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "width": "fit-content",
            "left": "50%",
            "top": "50%",
            "transform": "translate(-50%, -50%)",
            "opacity": 1
        });

        this.setup_label();

        if (!this.simple) {
            this.setup_dots();
        }
    };

    this.setup_dots = function () {
        this.bubble_dots = new Dash.Gui.LoadDots(Dash.Size.RowHeight * 0.75);

        this.bubble_dots.html.css({
            "margin-top": Dash.Size.Padding * 0.5
        });

        this.bubble_dots.Start();

        this.bubble.append(this.bubble_dots.html);
    };

    this.setup_label = function () {
        this.bubble_label = new Dash.Gui.Header(this.get_loading_label_text(this.progress), null, false);

        this.bubble_label.label.css({
            "padding-left": 0,
            "padding-right": Dash.Size.Padding * 0.5
        });

        this.bubble.append(this.bubble_label.html);
    };

    this.get_loading_label_text = function (progress) {
        if (isNaN(progress)) {
            return;
        }

        if (this.simple) {
            return (this.label_prefix + "...");
        }

        else {
            return (this.label_prefix + " (" + progress.toString() + "%)");
        }
    };
    
    this.setup_styles();
}