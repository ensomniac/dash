function DashMobileCardPullIcon (card, icon_name) {
    this.card = card;
    this.icon_name = icon_name;

    this.icon = null;
    this.IsTriggered = false;
    this.stack = this.card.stack;
    this.color = this.stack.color;
    this.Size = Dash.Size.ButtonHeight;
    this.html = Dash.Gui.GetHTMLAbsContext();

    this.setup_styles = function () {
        this.html.css({
            "background": "green",  // TODO?
            "width": this.Size,
            "height": this.Size,
            "left": 0,
            "top": 0,
            "right": "auto",
            "bottom": "auto",
            "opacity": 0,
            "pointer-events": "none",
            "border-radius": this.Size * 0.5
        });

        this.add_icon();
    };

    this.UpdateIcon = function (icon_name="") {
        if (icon_name) {
            this.icon_name = icon_name;

            if (this.icon) {
                this.icon.SetIcon(this.icon_name);
            }

            else {
                this.add_icon();
            }
        }

        else {
            this.icon.html.remove();

            this.icon = null;
        }
    };

    this.OnDrag = function (norm_t) {
        var color = "rgb(130, 130, 130)";

        if (this.IsTriggered && norm_t < 0.4) {
            this.IsTriggered = false;
        }

        if (!this.icon) {
            return;
        }

        var px_pulled = Dash.Math.Lerp(0, $(window).width(), norm_t);
        var px_max = this.Size + (Dash.Size.Padding * 0.5);

        if (px_pulled > px_max) {
            norm_t = 1.0;

            color = Dash.Color.Mobile.AccentPrimary;

            this.IsTriggered = true;
        }

        else {
            norm_t = Dash.Math.InverseLerp(0.0, px_max, px_pulled);
        }

        this.html.css({
            "opacity": norm_t,
            "background": color
        });
    };

    this.add_icon = function () {
        if (!this.icon_name || this.icon) {
            return;
        }

        this.icon = new Dash.Gui.Icon(this.color, this.icon_name, this.Size, 0.5, "white");

        this.html.append(this.icon.html);
    };

    this.setup_styles();
}
