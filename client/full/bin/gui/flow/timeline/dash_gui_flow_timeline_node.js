class DashGuiFlowTimelineNode {
    constructor (timeline, step) {
        this.timeline = timeline;
        this.step = step;

        this.tip = null;
        this.slash = null;
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

    Step () {
        return this.step;
    }

    ID () {
        return this.step["id"];
    }

    IsActive () {
        return this.active;
    }

    IsDisabled () {
        return this.disabled;
    }

    IsLocked () {
        return this.locked;
    }

    SetLocked (locked) {  // Locked/skipped
        this.locked = locked;

        if (this.locked) {
            if (this.disabled) {
                this.SetDisabled(false);
            }

            if (this.active) {
                this.SetActive(false);
            }

            this.show_slash();
        }

        else {
            this.hide_slash();
        }

        this.html.css({
            "cursor": this.get_cursor_css(),
            "opacity": this.get_opacity_css()
        });
    }

    SetActive (active) {
        this.active = active;

        if (this.active) {
            if (this.locked) {
                this.SetLocked(false);
            }

            if (this.disabled) {
                this.SetDisabled(false);
            }
        }

        this.html.css({
            "cursor": this.get_cursor_css(),
            "background": this.get_bg_css(),
            "border": this.stroke_size + "px solid " + this.stroke_color
        });
    }

    SetDisabled (disabled) {
        this.disabled = disabled;

        if (this.disabled) {
            if (this.locked) {
                this.SetLocked(false);
            }

            if (this.active) {
                this.SetActive(false);
            }
        }

        this.html.css({
            "cursor": this.get_cursor_css(),
            "opacity": this.get_opacity_css()
        });
    }

    show_slash () {
        if (this.slash) {
            this.slash.html.show();

            return;
        }

        this.slash = new Dash.Gui.Icon(this.color, "slash_heavy", this.size, 0.7, this.stroke_color);

        this.slash.html.css({
            "position": " absolute",
            "inset": 0,
            "border-radius": this.size,
            "cursor": "not-allowed"
        });

        this.html.append(this.slash.html);
    }

    hide_slash () {
        if (!this.slash) {
            return;
        }

        this.slash.html.hide();
    }

    get_bg_css () {
        return this.active ? this.stroke_color_highlighted : this.color.BackgroundRaised;
    }

    get_cursor_css () {
        return ((this.disabled || this.locked) ? "not-allowed" : this.active ? "help" : "pointer");
    }

    get_opacity_css () {
        return this.disabled ? 0.4 : this.locked ? 0.2 : 1;
    }

    show_tip () {
        if (this.tip) {
            this.tip.html.show();

            return;
        }

        this.tip = new DashGuiFlowTipText(this.view, this.view.get_step_display_name(this.step));

        this.tip.Emphasize();

        this.tip.html.css({
            "position": "absolute",
            "top": -Dash.Size.Padding,
            "left": -(this.stroke_size * 0.5),
            "transform": "rotate(-90deg)",
            "transform-origin": "top left",
            "pointer-events": "none",
            "user-select": "none",
            "background": this.color.BackgroundRaised,
            "filter": "sepia(20%) hue-rotate(5deg)"
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
            if (!this.active && !this.disabled && !this.locked) {
                this.html.css({
                    "border": this.stroke_size + "px solid " + this.stroke_color_highlighted
                });
            }

            if (!this.locked) {
                this.show_tip();
            }
        });

        this.html.on("mouseleave", () => {
            if (!this.active && !this.disabled && !this.locked) {
                this.html.css({
                    "border": this.stroke_size + "px solid " + this.stroke_color
                });
            }

            if (!this.locked) {
                this.hide_tip();
            }
        });

        this.html.on("click", () => {
            if (this.active || this.disabled || this.locked) {
                return;
            }

            this.view.LoadStep(this.Step(), true, false, true);
        });
    }
}
