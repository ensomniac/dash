class DashGuiFlowDatePicker extends DashGuiDatePicker {
    constructor (view, bound_cb=null, min="", max="", label_text="") {
        super(
            label_text,
            null,
            bound_cb,
            bound_cb,
            bound_cb,
            view.color,
            min && max ? min : view.tomorrow.toLocaleDateString(
                "en-CA",  // Canadian English locale, which uses the "yyyy-mm-dd" format by default
                {
                    "year": "numeric",
                    "month": "2-digit",
                    "day": "2-digit"
                }
            ),
            min && max ? max : view.one_year_out.toLocaleDateString(
                "en-CA",  // Canadian English locale, which uses the "yyyy-mm-dd" format by default
                {
                    "year": "numeric",
                    "month": "2-digit",
                    "day": "2-digit"
                }
            )
        );

        this.view = view;
        this.right_pad = Dash.Size.Padding;
        this.top_pad = Dash.Size.Padding * 0.5;

        // The native calendar icon button component of the date
        // input can't be styled, so getting creative instead
        this.cal_icon_backing = $("<div></div>");

        this.cal_icon_backing_icon = new Dash.Gui.Icon(this.color, "click", null, 1, this.color.Background);

        this.extend_styles();
    }

    extend_styles () {
        this.html.css({
            "height": "",
            "line-height": "",
            "padding-left": this.right_pad,
            "padding-right": this.right_pad,
            "padding-top": this.top_pad,
            "padding-bottom": this.top_pad,
            "background": this.color.PinstripeDark,
            "border": "1px solid " + this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius
        });

        this.input.css({
            "flex": "",
            "font-size": "300%",
            "width": "fit-content",
            "z-index": 10
        });

        this.cal_icon_backing.css({
            "z-index": 5,
            "background": this.color.StrokeLight,
            "border-radius": Dash.Size.BorderRadius,
            "position": "absolute",
            "right": "calc(3% + " + this.right_pad + "px)",
            "top": "25%",
            "height": "calc(65% - " + (this.top_pad * 2) + "px)",
            "aspect-ratio": "1",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center"
        });

        this.cal_icon_backing.append(this.cal_icon_backing_icon.html);

        this.cal_icon_backing_icon.html.css({
            "margin-top": "23%",
            "margin-left": "20%"
        });

        this.cal_icon_backing_icon.SetSize(120, "70%", false);

        this.SetAutosaveDelayMs(100);

        this.html.append(this.cal_icon_backing);
    }
}
