function DashMobileLayoutCardPullIcon (card, icon_name) {

    this.card = card;
    this.stack = this.card.stack;
    this.color = this.stack.color;
    this.icon = null;
    this.icon_name = icon_name;

    this.html = Dash.Gui.GetHTMLAbsContext();
    this.size = Dash.Size.ButtonHeight;
    this.Size = this.size;
    this.IsTriggered = false;

    this.setup_styles = function () {

        this.html.css({
            "background": "none",
            "background": "green",
            "width": this.size,
            "height": this.size,
            "left": 0,
            "top": 0,
            "right": "auto",
            "bottom": "auto",
            "opacity": 0,
            "pointer-events": "none",
            "border-radius": this.size*0.5,
        });

        if (this.icon_name) {
            this.icon = new Dash.Gui.Icon(this.color, this.icon_name, this.Size, 0.5, "white");
            this.html.append(this.icon.html);
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
        var px_max = this.size + (Dash.Size.Padding*0.5);

        if (px_pulled > px_max) {
            norm_t = 1.0;
            color = "#ff6a4c";
            this.IsTriggered = true;
        }
        else {
            norm_t = Dash.Math.InverseLerp(0.0, px_max, px_pulled);
        }

        this.html.css({
            "opacity": norm_t,
            "background": color,
        });

    };

    this.setup_styles();

}
