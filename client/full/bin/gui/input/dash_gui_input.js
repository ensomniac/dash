/**@member DashGuiInputBase*/

function DashGuiInput (placeholder_text="", color=null) {
    this.placeholder = placeholder_text;

    DashGuiInputBase.call(this, color, true, true);

    this.input = $(
        "<input class='" + this.color.PlaceholderClass + "' " +
        (this.placeholder.toString().toLowerCase().includes("password") ? "type=password " : "") +
        "placeholder='" + this.placeholder + "'>"
    );

    this.setup_styles = function () {
        this.html.css({
            "height": this.height,
            "background": this.color.Input.Background.Base,
            "border-radius": Dash.Size.BorderRadiusInteractive,
            "padding-right": Dash.Size.Padding,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
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
            "text-overflow": "ellipsis"
        });

        this.html.append(this.input);

        this.setup_connections();
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

    // DEPRECATED
    this.OnChange = function (callback, bind_to) {
        this.SetOnChange(callback, bind_to);
    };

    // DEPRECATED
    this.OnAutosave = function (callback, bind_to) {
        this.SetOnAutosave(callback, bind_to);
    };

    // DEPRECATED
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
