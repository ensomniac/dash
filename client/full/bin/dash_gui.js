
function DashGui(){

    this.Layout = new DashGuiLayout();
    this.Login = DashGuiLogin;
    this.Button = DashGuiButton;
    this.Input = DashGuiInput;
    this.PropertyBox = DashGuiPropertyBox;
    this.LoadDots = DashGuiLoadDots;
    this.InputRow = DashGuiInputRow;
    this.Header = DashGuiHeader;

    this.GetHTMLContext = function(optional_label_text, optional_style_css){

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
        };

        html.css(css);

        return html;

    };

    this.GetHTMLAbsContext = function(optional_label_text){

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

    this.GetHTMLBoxContext = function(optional_style_css){

        // optional_label_text = optional_label_text || "";
        optional_style_css = optional_style_css || {};

        var html = $("<div></div>");

        var css = {
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": "rgba(255, 255, 255, 0.3)",
            "color": "black",
            "border-radius": Dash.Size.Padding*0.5,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)"
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        };

        html.css(css);

        return html;

    };

    this.GetTipBox = function(code, msg, optional_style_css){

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

    this.GetErrorBox = function(code, msg){

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

};
