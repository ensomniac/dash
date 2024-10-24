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

    this.textarea.css({
        "line-height": Dash.Size.RowHeight + "px"
    });

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

        this.counter = $(
              "<div>"
            + (this.GetText().length + " / " + num)
            + "</div>"
        );

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
            "background": this.textarea.css("background-color"),
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "border": "1px solid " + this.color.StrokeLight,
            "border-bottom": "",
            "border-top-left-radius": Dash.Size.BorderRadius,
            "border-top-right-radius": Dash.Size.BorderRadius
        });

        this.html.append(this.counter);

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

        var counter_text = this.GetText().length + " / " + this.textarea.attr("maxlength");
        var valid = eval(counter_text) <= 1;

        this.counter.text(counter_text);

        this.counter.css({
            "font-family": "sans_serif_" + (valid ? "normal" : "bold"),
            "color": valid ? this.color.Text : this.color.AccentBad
        });
    };
}
