class DashGuiFlowButton extends DashGuiButton {
    constructor (text, binder, callback) {
        super(
            text,
            callback,
            binder,
            binder.color
        );

        this.bouncing = false;
        this.highlighted = false;
        this.bounce_timer = null;
        this.view = this.bind.view;
        // this.outline_color = this.color.PinstripeDark;

        this.extend_styles();
    }

    extend_styles () {
        this.FitContent();

        this.StyleAsBorderButton(
            1,
            "solid",
            this.color.Stroke
        );

        this.label.css({
            "font-family": "sans_serif_bold"
        });

        this.extend_connections();
    }

    // If changing size and also adding an icon using AddIcon, add the icon after changing size
    Highlight (size=0) {
        this.highlighted = true;

        this.html.css({
            // "outline": "1px solid " + this.outline_color,
            "background": this.color.Button.Background.Base,
            "border": "none"
        });

        this.highlight.css({
            "background": this.color.Button.Background.BaseHover
        });

        if (size) {
            this.html.css({
                "height": size
            });

            this.label.css({
                "line-height": size + "px"
            });
        }
    }

    Bounce (delay_ms=250) {
        if (this.bouncing) {
            return;
        }

        if (delay_ms) {
            if (this.bounce_timer) {
                clearTimeout(this.bounce_timer);
            }

            this.bounce_timer = setTimeout(
                () => {
                    this.Bounce(0);
                },
                delay_ms
            );

            return;
        }

        this.bouncing = true;

        this.bounce();
    }

    bounce (height=0, times=2, duration=150, _dur_frac=null, _height_frac=null) {
        if (times <= 0) {
            this.bouncing = false;

            return;
        }

        if (!height) {
            height = this.html.height() * 0.5;
        }

        if (_dur_frac === null) {
            _dur_frac = duration / times;
            _height_frac = height / times;
        }

        var dur = _dur_frac * times;

        this.html.stop().animate(
            {"top": -(_height_frac * times)},
            {
                "duration": dur,
                "complete": () => {
                    this.html.stop().animate(
                        {"top": 0},
                        {
                            "duration": dur * 0.9,
                            "complete": () => {
                                this.bounce(
                                    height,
                                    times - 1,
                                    duration,
                                    _dur_frac * 0.9,
                                    _height_frac
                                );
                            }
                        }
                    );
                }
            }
        );
    }

    extend_connections () {
        this.html.on("mouseenter", () => {
            if (this.bounce_timer) {
                clearTimeout(this.bounce_timer);
            }

            if (this.highlighted) {
                this.html.stop().css({
                    "top": 0,
                    "opacity": 1,
                    "outline": "2px solid " + this.color.Stroke
                    // "outline": "1px solid " + this.color.Stroke
                });
            }
        });

        this.html.on("mouseleave", () => {
            if (this.highlighted) {
                this.html.css({
                    // "outline": "1px solid " + this.outline_color
                    "outline": ""
                });
            }
        });
    }
}
