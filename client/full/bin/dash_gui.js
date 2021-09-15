function DashGui() {
    this.Button =          DashGuiButton;
    this.ChatBox =         DashGuiChatBox;
    this.ChatBox.Message = DashGuiChatBoxMessage;
    this.ChatBox.Input =   DashGuiChatBoxInput;
    this.Checkbox =        DashGuiCheckbox;
    this.Combo =           DashGuiCombo;
    this.Header =          DashGuiHeader;
    this.Icon =            DashIcon;
    this.IconButton =      DashGuiIconButton;
    this.Input =           DashGuiInput;
    this.InputRow =        DashGuiInputRow;
    this.ToolRow =         DashGuiToolRow;
    this.Layout =          new DashGuiLayout();
    this.LoadDots =        DashGuiLoadDots;
    this.Login =           DashGuiLogin;
    this.PaneSlider =      DashGuiPaneSlider;
    this.PropertyBox =     DashGuiPropertyBox;
    this.Slider =          DashGuiSlider;

    this.GetHTMLContext = function (optional_label_text="", optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div>" + optional_label_text + "</div>");

        var css = {
            "color": color.Text,
            "font-family": "sans_serif_normal",
            "background": color.Background,
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        }

        html.css(css);

        return html;
    };

    this.GetHTMLAbsContext = function (optional_label_text="") {
        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "color": "black",
            "background": Dash.Color.Light.Background,
        });

        return html;
    };

    this.GetHTMLBoxContext = function (optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div></div>");

        var css = {
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": color.BackgroundRaised,
            "color": color.Background,
            "border-radius": Dash.Size.Padding * 0.5,
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

    this.GetColorPicker = function (binder, callback, label_text="Color Picker", dash_color=null, default_picker_hex_color="#ff0000") {
        if (!dash_color) {
            dash_color = Dash.Color.Light;
        }

        callback = callback.bind(binder);

        var color_picker = {};
        color_picker["html"] = $("<div></div>");
        color_picker["label"] = $("<label for='colorpicker'>" + label_text + "</label>");
        color_picker["input"] = $("<input type='color' id='colorpicker' value='" + default_picker_hex_color + "'>");

        color_picker.label.css({
            "font-family": "sans_serif_normal",
            "color": dash_color.Text || "black"
        });

        color_picker.input.css({
            "margin-left": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
            "font-family": "sans_serif_normal",
            "color": dash_color.Text || "black"
        });

        color_picker.html.append(color_picker.label);
        color_picker.html.append(color_picker.input);

        (function (input, callback) {
            input.on("change", function () {
                callback(color_picker.input.val());
            });
        })(color_picker.input, callback);

        return color_picker;
    };

    this.GetTopRightIconButton = function (binder, callback, icon_id="trash", data_key=null, additional_data=null, existing_top_right_label=null) {
        callback = callback.bind(binder);

        if (existing_top_right_label) {
            existing_top_right_label.css({
                "right": Dash.Size.Padding * 5
            });
        }

        (function (self, icon_id, callback, data_key, additional_data, binder) {
            var button = new Dash.Gui.IconButton(
                icon_id,
                function () {
                    callback(data_key, additional_data);
                },
                binder,
                binder.color || Dash.Color.Dark
            );

            button.html.css({
                "position": "absolute",
                "left": "auto",
                "bottom": "auto",
                "top": Dash.Size.Padding * 0.8,
                "right": Dash.Size.Padding,
                "height": Dash.Size.RowHeight,
                "z-index": 1
            });

            self._tmp_button = button;
        })(this, icon_id, callback, data_key, additional_data, binder);

        return this._tmp_button;
    };
}
