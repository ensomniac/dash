function DashGuiLoadingOverlay (color=null, progress=0, label_prefix="Loading", html_to_append_to=null, simple=false) {
    this.color = color || Dash.Color.Light;
    this.progress = progress;
    this.label_prefix = label_prefix;
    this.html_to_append_to = html_to_append_to;

    // Simple shows a static "..." instead of the animated loading dots.
    // This is intended for overlays that will often be quick and not left on screen long. With
    // certain operations, like loading heavy data, drawing a ton of rows, etc, the loading dots
    // stay frozen and don't actually animate, so if it's heavy and/or quick, simple may be preferred.
    this.simple = simple;

    // Not using 'this.html' is unconventional, but in order for this to be a single GUI element
    // with a transparent background and an opaque bubble, we can't use the typical 'this.html',
    // because then all the elements are either transparent or opaque, not able to be individually
    // set. You also shouldn't need to append this to any html manually, but in the case that is needed,
    // use this.AppendTo(), instead of the standard method of appending 'this.html' to the desired element.

    this.modal = null;
    this.removed = false;
    this.is_showing = false;
    this.bubble_dots = null;
    this.bubble_label = null;

    // Deprecated, just wrappers now - but keeping around to avoid breaking things
    this.bubble = null;
    this.background = null;

    this.setup_styles = function () {
        this.modal = new Dash.Gui.Modal(
            this.color,
            null,  // This part is handled in this.AppendTo
            Dash.Size.ColumnWidth,  // Placeholder value for init
            Dash.Size.RowHeight,
            true,
            0.6,
            false
        );

        // Deprecated, just wrappers now - but keeping around to avoid breaking things
        this.bubble = this.modal.modal;
        this.background = this.modal.background;

        this.modal.modal.css({
            "position": "absolute",
            "inset": 0,
            "top": "50%",
            "left": "50%",
            "display": "flex",
            "margin": Dash.Size.Padding,
            "padding": Dash.Size.Padding,
            "width": "fit-content",
            "transform": "translate(-50%, -50%)"
        });

        this.setup_label();

        if (!this.simple) {
            this.setup_dots();
        }

        if (this.html_to_append_to) {
            this.AppendTo(this.html_to_append_to);
        }
    };

    this.SetCSS = function (css) {
        if (!Dash.Validate.Object(css)) {
            return;
        }

        this.modal.background.css(css);
        this.modal.modal.css(css);
    };

    // See note at the top
    this.AppendTo = function (html) {
        if (!html) {
            console.warn("DashGuiLoadingOverlay AppendTo() requires an HTML element:", html);

            return;
        }

        this.modal.SetParentHTML(html);

        this.is_showing = true;
        this.html_to_append_to = html;
    };

    this.Show = function () {
        if (this.is_showing) {
            return;
        }

        if (this.simple) {
            this.modal.Show();

            this.is_showing = true;

            return;
        }

        if (this.modal.background.is(":visible")) {
            return;
        }

        if (!this.html_to_append_to) {
            console.warn("DashGuiLoadingOverlay Show() requires the 'html_to_append_to' param to be provided on init:", this.html_to_append_to);

            return;
        }

        if (this.removed) {
            this.AppendTo(this.html_to_append_to);
        }

        else {
            this.modal.Show();

            this.is_showing = true;
        }
    };

    this.Hide = function () {
        if (!this.is_showing) {
            return;
        }

        this.modal.Hide();

        this.is_showing = false;
    };

    this.Remove = function () {
        if (this.simple) {
            this.Hide();

            return;
        }

        this.bubble_dots.Stop();

        this.modal.Remove();

        this.progress = 0;
        this.removed = true;
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

    this.SetLabelPrefix = function (label_prefix="Loading") {
        this.label_prefix = label_prefix;
    };

    this.Stop = function (label_prefix="") {
        this.bubble_dots.Stop();

        if (label_prefix) {
            this.label_prefix = label_prefix;

            this.bubble_label.SetText(this.get_loading_label_text(this.progress));
        }

        this.bubble_dots.html.hide();
    };

    this.setup_dots = function () {
        this.bubble_dots = new Dash.Gui.LoadDots(Dash.Size.RowHeight * 0.75);

        this.bubble_dots.html.css({
            "margin-top": Dash.Size.Padding * 0.5
        });

        this.bubble_dots.Start();

        this.modal.AddHTML(this.bubble_dots.html);
    };

    this.setup_label = function () {
        this.bubble_label = new Dash.Gui.Header(this.get_loading_label_text(this.progress), null, false);

        this.bubble_label.label.css({
            "padding-left": 0,
            "padding-right": Dash.Size.Padding * 0.5
        });

        this.modal.AddHTML(this.bubble_label.html);
    };

    this.get_loading_label_text = function (progress) {
        if (progress === "none") {  // Special case
            return this.label_prefix;
        }

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
