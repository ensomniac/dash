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
            "top": -Dash.Size.RowHeight,
            "right": 0,
            "text-align": "right",
            "height": Dash.Size.RowHeight,
            "line-height": Dash.Size.RowHeight + "px",
            "color": this.color.Text,
            "font-family": "sans_serif_normal"
        });

        this.html.append(this.counter);
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
