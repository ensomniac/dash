/**@member DashGuiInputBase*/

function DashGuiInput (placeholder_text="", color=null) {
    this.placeholder = placeholder_text;

    DashGuiInputBase.call(this, color, true, true);

    this.input = $(
          "<input class='"
        + this.color.PlaceholderClass
        + "' placeholder='"
        + this.placeholder
        + "'>"
    );

    this.setup_styles = function () {
        this.html.css({
            "height": this.height,
            "background": this.color.Input.Background.Base,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",  // DON'T REPLACE THIS WITH BORDER
            "padding": 0,
            "margin": 0
        });

        this.input.css({
            "background": "rgba(0, 0, 0, 0)",
            "line-height": this.height + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": Dash.Size.Padding,
            "color": this.color.Text,
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "font-size": Dash.Size.DesktopToMobileMode ? "75%" : "100%",

            // These css properties should be the default, but I don't want to break anything
            // "padding-left": Dash.Size.Padding * 0.5,
            // "padding-right": Dash.Size.Padding * 0.5,
            // "width": "calc(100% - " + Dash.Size.Padding + "px)"
        });

        this.html.append(this.input);

        this.parse_input_type();
        this.setup_connections();
    };

    this.parse_input_type = function () {
        var placeholder = this.placeholder.toString().toLowerCase();

        var type = (
              placeholder.includes("password") ? "password"
            : placeholder.includes("email") ? "email"
            : ""
        );

        if (type === "numeric") {
            if (Dash.IsMobile) {
                this.input.attr({
                    "type": "number",
                    "pattern": "[0-9]*",
                    "step": "1",
                    "min": "0"
                });
            }
        }

        else if (type) {
            this.input.attr("type", type);
        }

        if (type === "email") {
            // This is supposed to happen when the mode is set to "email", but isn't happening automatically
            this.input.attr("autocapitalize", "off");
        }
    };

    this.SetDarkMode = function (dark_mode_on) {
        if (dark_mode_on) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });

            this.input.css({
                "color": "rgba(255, 255, 255, 0.9)",
            });
        }
    };

    this.SetTransparent = function (is_transparent) {
        if (is_transparent) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
        }

        return this;
    };

    // DEPRECATED - Use SetOnChange instead
    this.OnChange = function (callback, bind_to) {
        this.SetOnChange(callback, bind_to);
    };

    // DEPRECATED - Use SetOnAutosave instead
    this.OnAutosave = function (callback, bind_to) {
        this.SetOnAutosave(callback, bind_to);
    };

    // DEPRECATED - Use SetOnSubmit instead
    this.OnSubmit = function (callback, bind_to) {
        this.SetOnSubmit(callback, bind_to);
    };

    // Override
    this.parse_value = function (value, data_key="") {
        if (value === null || value === undefined) {
            return "";
        }

        if (value === false) {
            return value.toString();  // Keep this value intact, protect against '!'
        }

        // Initial value is a dict or array
        if (Dash.Validate.Object(value)) {
            return JSON.stringify(value);
        }

        // Initial value is ISO datetime string
        if (Dash.DateTime.IsIsoFormat(value)) {
            return Dash.DateTime.Readable(value, false);
        }

        // Initial value is team member email
        if (data_key && !(data_key.includes("email")) && Dash.Validate.Email(value)) {
            if ("team" in Dash.User.Init && value in Dash.User.Init["team"]) {
                if ("display_name" in Dash.User.Init["team"][value]) {
                    return Dash.User.Init["team"][value]["display_name"];
                }
            }
        }

        return value;
    };

    this.setup_styles();
}
