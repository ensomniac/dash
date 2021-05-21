function DashGui() {
    this.Layout = new DashGuiLayout();
    this.Login = DashGuiLogin;
    this.Button = DashGuiButton;
    this.IconButton = DashGuiIconButton;
    this.Icon = DashIcon;
    this.Input = DashGuiInput;
    this.PropertyBox = DashGuiPropertyBox;
    this.LoadDots = DashGuiLoadDots;
    this.InputRow = DashGuiInputRow;
    this.Header = DashGuiHeader;
    this.Combo = DashGuiCombo;
    this.PaneSlider = DashGuiPaneSlider;

    this.GetHTMLContext = function (optional_label_text, optional_style_css) {
        optional_label_text = optional_label_text || "";
        optional_style_css = optional_style_css || {};

        var html = $("<div>" + optional_label_text + "</div>");

        var css = {
            "color": Dash.Color.Light.Text,
            "font-family": "sans_serif_normal",
            "background": Dash.Color.Light.Background,
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        }

        html.css(css);

        return html;
    };

    this.GetHTMLAbsContext = function (optional_label_text) {
        optional_label_text = optional_label_text || "";

        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "overflow-y": "auto",
            "color": "black",
            "background": Dash.Color.Light.Background,
        });

        return html;
    };

    this.GetHTMLBoxContext = function (optional_style_css, color) {
        color = color || Dash.Color.Light;

        // optional_label_text = optional_label_text || "";
        optional_style_css = optional_style_css || {};

        var html = $("<div></div>");

        var css = {
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": color.BackgroundRaised,
            "color": color.Background,
            "border-radius": Dash.Size.Padding*0.5,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)"
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        }

        html.css(css);

        return html;
    };

    this.GetTipBox = function (code, msg, optional_style_css) {
        // A full width box that is meant to display information

        var tip = Dash.Gui.GetHTMLBoxContext(optional_style_css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);

        code_html.css({
            "font-family": "sans_serif_bold",
        });

        tip.append(code_html);
        tip.append(msg_html);

        return tip;
    };

    this.GetErrorBox = function (code, msg) {
        // A full width box that is meant to display an error

        var css = {};
        css["background"] = "orange";

        var tip = Dash.Gui.GetHTMLBoxContext(css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);

        code_html.css({
            "font-family": "sans_serif_bold",
        });

        tip.append(code_html);
        tip.append(msg_html);

        return tip;
    };

    this.GetFlexSpacer = function (flex_grow_value=2) {
        var html = $("<div></div>");
        
        html.css({
            "flex-grow": flex_grow_value,
        });

        return html;
    };

    this.AddTopRightDeleteButton = function (binder, callback, alt_icon_id=null, data_key=null, additional_data=null, existing_top_right_label=null) {
        var icon_id = "trash";

        if (alt_icon_id && typeof alt_icon_id === "string") {
            icon_id = alt_icon_id;
        }

        if (existing_top_right_label) {
            existing_top_right_label.css({
                "right": Dash.Size.Padding * 5
            });
        }

        var top_right_delete_button = Dash.Gui.GetHTMLAbsContext();

        top_right_delete_button.css({
            "left": "auto",
            "bottom": "auto",
            "top": Dash.Size.Padding * 0.8,
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "color": binder.color || Dash.Color.Dark,
            "z-index": 1,
            "overflow-y": ""
        });

        callback = callback.bind(binder);

        (function (binder, callback, top_right_delete_button, icon_id, data_key, additional_data) {
            var button = new Dash.Gui.IconButton(
                icon_id,
                function () {
                    callback(data_key, additional_data);
                },
                binder,
                binder.color || Dash.Color.Dark
            );

            button.html.css({
            });

            top_right_delete_button.append(button.html);

        })(binder, callback, top_right_delete_button, icon_id, data_key, additional_data);


        if (top_right_delete_button.button) {
            top_right_delete_button.button.html.css({
                "margin-right": Dash.Size.RowHeight
            });
        }

        return top_right_delete_button;
    };
}
