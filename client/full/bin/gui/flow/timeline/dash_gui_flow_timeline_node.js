class DashGuiFlowTimelineNode {
    constructor (timeline, id) {
        this.timeline = timeline;
        this.id = id;

        this.tip = null;
        this.active = false;
        this.locked = false;
        this.disabled = false;
        this.html = $("<div></div>");
        this.view = this.timeline.view;
        this.color = this.timeline.color;
        this.stroke_size = this.timeline.stroke_size;
        this.stroke_color = this.timeline.stroke_color;
        this.size = this.timeline.height - (this.stroke_size * 2);
        this.stroke_color_highlighted = this.color.Button.Background.Base;

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "border-radius": this.size,
            "height": this.size,
            "width": this.size,
            "border": this.stroke_size + "px solid " + this.stroke_color,
            "cursor": this.get_cursor_css(),
            "background": this.get_bg_css(),
            "opacity": this.get_opacity_css()
        });

        this.setup_connections();
    }

    ID () {
        return this.id;
    }

    IsActive () {
        return this.active;
    }

    IsLocked () {
        return this.locked;
    }

    SetLocked () {  // Locked/skipped
        // TODO: when skipped or not able to nav to this step - also, differentiate the style
    }

    SetActive (active) {
        this.active = active;

        if (this.active && this.disabled) {
            this.SetDisabled(false);
        }

        this.html.css({
            "cursor": this.get_cursor_css(),
            "background": this.get_bg_css(),
            "border": this.stroke_size + "px solid " + this.stroke_color
        });
    }

    SetDisabled (disabled) {
        this.disabled = disabled;

        if (this.disabled && this.active) {
            this.SetActive(false);
        }

        this.html.css({
            "cursor": this.get_cursor_css(),
            "opacity": this.get_opacity_css()
        });
    }

    get_bg_css () {
        return this.active ? this.stroke_color_highlighted : this.color.BackgroundRaised;
    }

    get_cursor_css () {
        return (this.disabled ? "not-allowed" : this.active ? "help" : "pointer");
    }

    get_opacity_css () {
        return this.disabled ? 0.4 : 1;
    }

    show_tip () {
        if (this.tip) {
            this.tip.html.show();

            return;
        }

        this.tip = new DashGuiFlowTipText(this.view, this.id);

        this.tip.Emphasize();

        this.tip.html.css({
            "position": "absolute",
            "top": -Dash.Size.Padding,
            "left": -(this.stroke_size * 0.5),
            "transform": "rotate(-90deg)",
            "transform-origin": "top left",
            "pointer-events": "none",
            "user-select": "none"
        });

        this.html.append(this.tip.html);
    }

    hide_tip () {
        if (!this.tip) {
            return;
        }

        this.tip.html.hide();
    }

    setup_connections () {
        this.html.on("mouseenter", () => {
            if (!this.active && !this.disabled) {
                this.html.css({
                    "border": this.stroke_size + "px solid " + this.stroke_color_highlighted
                });
            }

            this.show_tip();
        });

        this.html.on("mouseleave", () => {
            if (!this.active && !this.disabled) {
                this.html.css({
                    "border": this.stroke_size + "px solid " + this.stroke_color
                });
            }

            this.hide_tip();
        });

        this.html.on("click", () => {
            if (this.active || this.disabled) {
                return;
            }

            this.view.LoadStep(this.id, true);  // Don't need confirmation from the user if they've already clicked the button
        });
    }
}
