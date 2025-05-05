function DashGuiTextArea (
    color=null, placeholder_text="", binder=null, on_change_cb=null, delay_change_cb=false
) {
    // For now, this file is no more than a wrapper when desiring a textarea element outside of mobile.
    // We can add to or modify this is as needed, or eventually just write this out as its own class.

    // This actually isn't exclusive to mobile for any reason. It's just the only textarea
    // element that exists in Dash and was created with the 'Mobile' name because I thought
    // it was going to be specific to mobile, but that ended up not being the case.
    DashMobileTextBox.call(this, color, placeholder_text, binder, on_change_cb, delay_change_cb);

    this.counter = null;
    this.counter_valid_bg_color = "";
    this.counter_invalid_bg_color = "";

    this.textarea.css({
        "line-height": Dash.Size.RowHeight + "px"
    });

    // Similar to SetLocked(true)
    this.Disable = function (opacity=0.5) {
        if (this.locked) {
            return;
        }

        this.Lock(false);

        this.html.css({
            "opacity": opacity
        });
    };

    // Similar to SetLocked(false)
    this.Enable = function () {
        if (!this.locked) {
            return;
        }

        this.Unlock(false);

        this.html.css({
            "opacity": 1
        });
    };

    // Override
    this.SetMaxCharacters = function (num, include_counter=true, enforce=true) {
        if (!enforce && !include_counter) {
            Dash.Log.Warn(
                "SetMaxCharacters will have no effect with 'enforce' and 'include_counter' both set to false"
            );
        }
        if (enforce) {
            this.textarea.attr("maxlength", num);
        }

        if (!include_counter) {
            return;
        }

        if (!this.counter_valid_bg_color) {
            this.counter_valid_bg_color = this.textarea.css("background-color");
        }

        this.counter = $(
              "<div>"
            + (this.GetText().length + " / " + num)
            + "</div>"
        );

        this.counter._maxlength = num;

        this.counter.css({
            "position": "absolute",
            "right": 0,
            "top": -Dash.Size.RowHeight * 0.75,
            "height": Dash.Size.RowHeight * 0.75,
            "line-height": (Dash.Size.RowHeight * 0.75) + "px",
            "text-align": "right",
            "color": this.color.Text,
            "font-family": "sans_serif_normal",
            "font-size": "90%",
            "background": this.counter_valid_bg_color,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "border": this.border_size + "px solid " + (this.locked ? this.color.StrokeLight : this.color.Stroke),
            "border-bottom": "",
            "border-top-left-radius": Dash.Size.BorderRadius,
            "border-top-right-radius": Dash.Size.BorderRadius
        });

        this.html.append(this.counter);

        if (!this.counter_invalid_bg_color) {
            this.counter_invalid_bg_color = Dash.Color.GetTransparent(this.color.AccentBad, 0.2);
        }

        return this.counter;
    };

    // Override
    this._on_fire_change_cb = function () {
        this.update_counter();
    };

    this.update_counter = function () {
        if (!this.counter) {
            return "";
        }

        var counter_text = this.GetText().length + " / " + this.counter._maxlength;
        var valid = eval(counter_text) <= 1;

        var border = (
            this.border_size
            + "px solid "
            + (valid ? (this.locked ? this.color.StrokeLight : this.color.Stroke) : this.color.AccentBad)
        );

        this.counter.text(counter_text);

        this.counter.css({
            "font-family": "sans_serif_" + (valid ? "normal" : "bold"),
            "color": valid ? this.color.Text : this.color.AccentBad,
            "border": border,
            "border-bottom": ""
        });

        this.textarea.css({
            "border": border,
            "background": valid ? this.counter_valid_bg_color : this.counter_invalid_bg_color
        });
    };
}
