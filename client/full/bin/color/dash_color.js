function DashColor (dark_mode_active=false) {
    this.dark_mode_active = dark_mode_active;

    this.Dark = null;
    this.Light = null;
    this.Primary = "#95ae6c";
    this.Warning = "#fab964";
    this.parsed_color_data = {};
    this.SaveHighlight = "rgb(255, 255, 255, 0.5)";
    
    // This is a temporary way to centralize the orange palette
    // that was originally defined and used throughout the mobile code
    this.Mobile = {
        AccentPrimary: "#ff684c",    // Orange
        AccentSecondary: "#ffae4c",  // Yellow
        BannerButton: "white"
    };

    this.setup_color_sets = function () {
        this.Mobile.BackgroundGradient = this.GetVerticalGradient(this.Mobile.AccentSecondary, this.Mobile.AccentPrimary);
        this.Mobile.ButtonGradient = this.GetHorizontalGradient(this.Mobile.AccentSecondary, this.Mobile.AccentPrimary);

        var dark_bg_text = "rgb(245, 245, 245)";
        var light_bg_text = "rgb(30, 30, 30)";
        var button_color = "#4d505f";
        var button_hover_color = this.Lighten(button_color);
        var button_text_color = "rgb(230, 230, 230)";
        var button_selected = "#95ae6c";
        var button_selected_hover = this.Lighten(button_selected);
        var dark_input_background = "rgba(255, 255, 255, 0.8)";
        var light_input_background = "rgba(0, 0, 0, 0)";
        var dark_input_text = "rgba(255, 255, 255, 0.8)";
        var light_input_text = "rgba(0, 0, 0, 0.8)";

        var light = new DashSiteColors(
            {
                // TODO: "background" and "background_raised" need to be different
                //  - "background" should be something like "#d7dcde", or "background_raised" should be "white"
                //  - changing one breaks a lot of stuff because BackgroundRaised is used in many places where Background should've been used instead
                "background": "#e3e8ea",
                "background_raised": "#e3e8ea",
                "button": "#659cba",
                "button_text": "rgb(234, 239, 255)",
                "accent_good": "#f2c96c",
                "accent_bad": "#f9663c",
                "text_header": "#2b323c",
                "tab_area_background": "#333",
            },
            this
        );

        var dark = new DashSiteColors(
            {
                "background": "#23262b",
                "background_raised": "#444b54",
                "button": "#5c9fb7",
                "button_text": "rgb(234, 239, 255)",
                "accent_good": "#ffc74d",
                "accent_bad": "#ff624c",
                "text_header": "#c4d4dd",
                "tab_area_background": "#333",
            },
            this
        );

        this.Light = new DashColorSet(
            light.Background,       // Background color
            light.BackgroundRaised, // Background color for raised boxes
            light_bg_text,          // Text color
            light.TextHeader,       // Text header color
            light.AccentGood,
            light.AccentBad,
            new DashColorButtonSet( // Button
                "none",                    // The color of the area behind a set of buttons, if applicable
                new DashColorStateSet(
                    light.Button,          // Button.Background.Base
                    button_selected,       // Button.Background.Selected
                    button_hover_color,    // Button.Background.BaseHover
                    button_selected_hover, // Button.Background.SelectedHover
                ),
                new DashColorStateSet(
                    light.ButtonText,   // Button.Text.Base
                    button_text_color,  // Button.Text.Selected
                    button_text_color,  // Button.Text.BaseHover
                    button_text_color,  // Button.Text.SelectedHover
                ),
            ),
            new DashColorButtonSet(     // Tab
                // light.TabAreaBackground,
                "none",
                new DashColorStateSet(  // Tab Background
                    "rgba(0, 0, 0, 0)", // Tab.Background.Base
                    "rgba(0, 0, 0, 0)", // Tab.Background.Selected
                    "rgba(0, 0, 0, 0)",  // Tab.Background.BaseHover
                    light.AccentGood,      // Tab.Background.SelectedHover
                ),
                new DashColorStateSet(    // Tab Text
                    "rgba(255, 255, 255, 0.6)", // Tab.Text.Base
                    "rgba(255, 255, 255, 0.9)", // Tab.Text.Selected
                    "rgba(255, 255, 255, 0.7)",     // Tab.Text.BaseHover
                    "rgba(255, 255, 255, 1.0)",     // Tab.Text.SelectedHover
                ),
            ),
            new DashColorButtonSet(     // Input
                light.TabAreaBackground, // area background
                new DashColorStateSet(  // Input Background
                    light_input_background, // Input.Background.Base
                    light_input_background, // Input.Background.Selected
                    light_input_background,  // Input.Background.BaseHover
                    light_input_background,      // Input.Background.SelectedHover
                ),
                new DashColorStateSet(    // Input Text
                    light_input_text, // Input.Text.Base
                    light_input_text, // Input.Text.Selected
                    light_input_text,     // Input.Text.BaseHover
                    light_input_text,     // Input.Text.SelectedHover
                ),
            ),
        );

        this.Dark = new DashColorSet(
            dark.Background, // Background color
            dark.BackgroundRaised, // Background color for raised boxes
            dark_bg_text, // Text color
            dark.TextHeader, // Text header color
            dark.AccentGood,
            dark.AccentBad,
            new DashColorButtonSet( // Button
                "none", // The color of the area behind a set of buttons, if applicable
                new DashColorStateSet(
                    dark.Button, // Button.Background.Base
                    button_selected, // Button.Background.Selected
                    button_hover_color, // Button.Background.BaseHover
                    button_selected_hover, // Button.Background.SelectedHover
                ),
                new DashColorStateSet( // Button Text
                    dark.ButtonText, // Button.Text.Base
                    dark.ButtonText, // Button.Text.Selected
                    dark.ButtonText, // Button.Text.BaseHover
                    dark.ButtonText, // Button.Text.SelectedHover
                ),
            ),
            new DashColorButtonSet(    // Tab
                dark.TabAreaBackground, // The color of the area behind a set of tabs, if applicable
                new DashColorStateSet( // Tab Background
                    dark.Button,    // Tab.Background.Base
                    button_selected,    // Tab.Background.Selected
                    button_hover_color, // Tab.Background.BaseHover
                    button_selected_hover, // Tab.Background.SelectedHover
                ),
                new DashColorStateSet( // Tab Text
                    dark.ButtonText,   // Tab.Text.Base
                    dark.ButtonText,  // Tab.Text.Selected
                    dark.ButtonText,  // Tab.Text.BaseHover
                    dark.ButtonText, // Tab.Text.SelectedHover
                ),
            ),
            new DashColorButtonSet(     // Input
                light.TabAreaBackground, // area background
                new DashColorStateSet(  // Input Background
                    dark_input_background, // Input.Background.Base
                    dark_input_background, // Input.Background.Selected
                    dark_input_background,  // Input.Background.BaseHover
                    dark_input_background,      // Input.Background.SelectedHover
                ),
                new DashColorStateSet(    // Input Text
                    dark_input_text, // Input.Text.Base
                    dark_input_text, // Input.Text.Selected
                    dark_input_text,     // Input.Text.BaseHover
                    dark_input_text,     // Input.Text.SelectedHover
                ),
            ),
        );

        this.Light.SetPlaceholderClass("placeholder_light");
        this.Dark.SetPlaceholderClass("placeholder_dark");
    };

    this.SwapIfDarkModeActive = function () {
        if (!this.dark_mode_active) {
            return;
        }

        var light = this.Light;

        this.Light = this.Dark;
        this.Dark = light;
    };

    this.IsDark = function (color) {
        if (this.dark_mode_active) {
            return color === this.Light;
        }

        return color === this.Dark;
    };

    this.GetOpposite = function (dash_color_instance) {
        if (!dash_color_instance instanceof DashColorSet) {
            return dash_color_instance;
        }

        return dash_color_instance === this.Light ? this.Dark : this.Light;
    };

    this.GetTransparent = function (cstr, opacity) {
        if (!this.parsed_color_data[cstr]) {
            this.parsed_color_data[cstr] = this.Parse(cstr);
        }

        return this.ToRGBA([
            this.parsed_color_data[cstr][0], // Red
            this.parsed_color_data[cstr][1], // Green
            this.parsed_color_data[cstr][2], // Blue
            opacity
        ]);
    };

    // What is this?
    this.Raise = function (cstr, raise_steps) {
        raise_steps = raise_steps || 1;

        return cstr;
    };

    this.Random = function (include_grayscales=false) {
        var keys;

        if (include_grayscales) {
            keys = Object.keys(this.Names);
        }

        else {
            var grayscale_kws = ["white", "gray", "grey", "black"];

            keys = [];

            for (var key of Object.keys(this.Names)) {
                var include = true;

                for (var kw of grayscale_kws) {
                    if (key.includes(kw)) {
                        include = false;

                        break;
                    }
                }

                if (!include) {
                    continue;
                }

                keys.push(key);
            }
        }

        return keys[Math.floor(keys.length * Math.random())];
    };

    this.GetHorizontalGradient = function (color_1, color_2, color_3=null, color_4=null, hard_lines=false) {
        return this.GetGradient(90, color_1, color_2, color_3, color_4, hard_lines);
    };

    this.GetVerticalGradient = function (color_1, color_2, color_3=null, color_4=null, hard_lines=false) {
        return this.GetGradient(0, color_1, color_2, color_3, color_4, hard_lines);
    };

    this.GetGradient = function (degrees, color_1, color_2, color_3=null, color_4=null, hard_lines=false) {
        var colors = [color_1, color_2, color_3, color_4].filter(function (color) {
            return Boolean(color);
        }).reverse();

        if (colors.length < 2) {
            console.error("Error: At least 2 colors are required for a gradient");

            return "red";
        }

        var value = "";
        var last_index = colors.length - 1;
        var per = 100 / last_index;
        var hard_line_per = 100 / colors.length;

        for (var i in colors) {
            if (value) {
                value += ", ";
            }

            var int = parseInt(i);
            var rgb = this.ParseToRGB(colors[i]);

            if (hard_lines && int === last_index) {
                value += rgb + " " + Math.ceil(hard_line_per * int) + "%, ";
            }

            value += rgb + " " + Math.ceil(per * i) + "%";

            if (hard_lines && int !== last_index) {
                value += ", " + rgb + " " + Math.ceil(hard_line_per * (int + 1)) + "%";
            }
        }

        return "linear-gradient(" + degrees + "deg, " + value + ")";
    };

    this.ToRGBA = function (color_data) {
        return this.to_rgba(color_data);
    };

    this.ParseToRGB = function (cstr) {
        return this.to_rgb(this.Parse(cstr));
    };

    this.IsLightColor = function (color) {
        var r;
        var g;
        var b;

        if (color.match(/^rgb/)) {
            color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

            r = color[1];
            g = color[2];
            b = color[3];
        }

        else {
            color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

            r = color >> 16;
            g = color >> 8 & 255;
            b = color & 255;
        }

        return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) > 127.5;
    };

    this.ParseToRGBA = function (cstr) {
        return this.to_rgba(this.Parse(cstr));
    };

    this.Lighten = function (cstr, lighten_rgb=15) {  // How many units to add to r/g/b
        var pcolor = this.Parse(cstr);

        pcolor[0] += lighten_rgb;
        pcolor[1] += lighten_rgb;
        pcolor[2] += lighten_rgb;

        return this.to_rgb(pcolor);
    };

    this.Darken = function (cstr, darken_rgb=15) {  // How many units to subtract to r/g/b
        var pcolor = this.Parse(cstr);

        pcolor[0] -= darken_rgb;
        pcolor[1] -= darken_rgb;
        pcolor[2] -= darken_rgb;

        return this.to_rgb(pcolor);
    };

    // TODO: break this up
    this.Parse = function (cstr) {
        if (this.parsed_color_data[cstr]) {
            return JSON.parse(JSON.stringify(this.parsed_color_data[cstr]));
        }

        var base;
        var size;
        var m = null;
        var alpha = 1;
        var parts = [];
        var space = null;

        if (typeof cstr === "string") {  // keyword
            if (this.Names[cstr]) {
                parts = this.Names[cstr].slice();
                space = "rgb";
            }

            else if (cstr === "transparent") {  // reserved words
                alpha = 0;
                space = "rgb";
                parts = [0,0,0];
            }

            else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {  // hex
                alpha = 1;
                base = cstr.slice(1);
                size = base.length;

                var is_short = size <= 4;

                if (is_short) {
                    parts = [
                        parseInt(base[0] + base[0], 16),
                        parseInt(base[1] + base[1], 16),
                        parseInt(base[2] + base[2], 16)
                    ];

                    if (size === 4) {
                        alpha = parseInt(base[3] + base[3], 16) / 255;
                    }
                }

                else {
                    parts = [
                        parseInt(base[0] + base[1], 16),
                        parseInt(base[2] + base[3], 16),
                        parseInt(base[4] + base[5], 16)
                    ];

                    if (size === 8) {
                        alpha = parseInt(base[6] + base[7], 16) / 255;
                    }
                }

                if (!parts[0]) {
                    parts[0] = 0;
                }

                if (!parts[1]) {
                    parts[1] = 0;
                }

                if (!parts[2]) {
                    parts[2] = 0;
                }

                space = "rgb";
            }

            // TODO: What is happening in this conditional? m = regex? Mistaken single equal sign?
            else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {  // color space
                var name = m[1];
                var isRGB = name === "rgb";

                base = name.replace(/a$/, "");
                space = base;
                size = base === "cmyk" ? 4 : base === "gray" ? 1 : 3;

                parts = m[2].trim()
                    .split(/\s*[,\/]\s*|\s+/)
                    .map(function (x, i) {
                        if (/%$/.test(x)) {  // <percentage>
                            if (i === size) {  // alpha
                                return parseFloat(x) / 100;
                            }

                            if (base === "rgb") {  // rgb
                                return parseFloat(x) * 255 / 100;
                            }

                            return parseFloat(x);
                        }

                        else if (base[i] === "h") {  // hue
                            if (/deg$/.test(x)) {  // <deg>
                                return parseFloat(x);
                            }

                            // TODO: What is baseHues supposed to be? It's not defined anywhere
                            else if (baseHues[x] !== undefined) {  // <base-hue>
                                return baseHues[x];
                            }
                        }

                        return parseFloat(x);
                    });

                if (name === base) {
                    parts.push(1);
                }

                alpha = (isRGB) ? 1 : (parts[size] === undefined) ? 1 : parts[size];
                parts = parts.slice(0, size);
            }

            else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {  // named channels case
                parts = cstr.match(/([0-9]+)/g).map(function (value) {
                    return parseFloat(value);
                });

                space = cstr.match(/([a-z])/ig).join('').toLowerCase();
            }
        }

        else if (!isNaN(cstr)) {  // numeric case
            space = "rgb";
            parts = [cstr >>> 16, (cstr & 0x00ff00) >>> 8, cstr & 0x0000ff];
        }

        else if (Array.isArray(cstr) || cstr.length) {  // array-like
            parts = [cstr[0], cstr[1], cstr[2]];
            space = "rgb";
            alpha = cstr.length === 4 ? cstr[3] : 1;
        }

        else if (cstr instanceof Object) {  // object case - detects css cases of rgb and hsl
            if (cstr.r != null || cstr.red != null || cstr.R != null) {
                space = "rgb";

                parts = [
                    cstr.r || cstr.red || cstr.R || 0,
                    cstr.g || cstr.green || cstr.G || 0,
                    cstr.b || cstr.blue || cstr.B || 0
                ];
            }

            else {
                space = "hsl";

                parts = [
                    cstr.h || cstr.hue || cstr.H || 0,
                    cstr.s || cstr.saturation || cstr.S || 0,
                    cstr.l || cstr.lightness || cstr.L || cstr.b || cstr.brightness
                ];
            }

            alpha = cstr.a || cstr.alpha || cstr.opacity || 1;

            if (cstr.opacity != null) {
                alpha /= 100;
            }
        }

        else {
            Dash.Log.Warn("Warning: Dash.Color.Parse failed to parse color!", cstr);
        }

        this.parsed_color_data[cstr] = [parts[0], parts[1], parts[2], alpha, space];

        return JSON.parse(JSON.stringify(this.parsed_color_data[cstr]));
    };

    // This function will set the placeholder text for an input element
    this.SetPlaceholderColor = function (input_html, placeholder_color) {
        var class_name = "placeholder_inline_style_" + (Math.random() * 1000000).toString();
        var style_str = "." + class_name + "::placeholder {color: " + placeholder_color + "}";
        var node = document.createElement("style");

        node.innerHTML = style_str;
        document.body.appendChild(node);

        input_html.addClass(class_name);

        return input_html;
    };

    // If a portal follows the standard color setup, this can be used after globally defining the required colors
    this.InitColors = function () {
        for (var color of [
            "ColorAccentPrimary",
            "ColorAccentSecondary",
            "ColorDarkBG",
            "ColorLightBG",
            "ColorDarkText",
            "ColorLightText",
            "ColorButton",
            "ColorButtonSelected"
        ]) {
            if (!window[color]) {
                console.error(
                    "'InitColors' can only be called once all required " +
                    "colors have been globally defined.\nMissing: window." + color
                );

                console.trace();

                debugger;
            }
        }

        this.init_color_light();
        this.init_color_dark();
        this.init_color_mobile();
        this.SwapIfDarkModeActive();
    };

    this.init_color_light = function () {
        this.Light.Background = window["ColorLightBG"];
        this.Light.Text = window["ColorDarkText"];
        this.Light.TextHeader = window["ColorDarkText"];
        this.Light.AccentGood = window["ColorAccentPrimary"];
        this.Light.AccentBad = window["ColorAccentSecondary"];

        this.Light.Button = new DashColorButtonSet(
            "none",  // Light.Button.AreaBackground (If applicable)
            new DashColorStateSet(
                window["ColorButton"],  // Light.Button.Background.Base
                window["ColorButtonSelected"],  // Light.Button.Background.Selected
                this.Darken(window["ColorButton"], 20),  // Light.Button.Background.BaseHover
                this.Darken(window["ColorButtonSelected"], 20)  // Light.Button.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorLightText"],  // Light.Button.Text.Base
                window["ColorLightText"],  // Light.Button.Text.Selected
                this.Lighten(window["ColorLightText"], 20),  // Light.Button.Text.BaseHover
                this.Lighten(window["ColorLightText"], 20)  // Light.Button.Text.SelectedHover
            )
        );

        this.Light.Tab = new DashColorButtonSet(
            this.Darken(window["ColorLightBG"], 50),  // Light.Tab.AreaBackground (If applicable)
            new DashColorStateSet(
                this.Darken(window["ColorLightBG"], 25),  // Light.Tab.Background.Base
                window["ColorLightBG"],  // Light.Tab.Background.Selected
                this.Darken(window["ColorLightBG"], 50),  // Light.Tab.Background.BaseHover
                window["ColorAccentPrimary"]  // Light.Tab.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorDarkText"],  // Light.Tab.Text.Base
                window["ColorDarkText"],  // Light.Tab.Text.Selected
                this.Lighten(window["ColorDarkText"], 50),  // Light.Tab.Text.BaseHover
                this.Lighten(window["ColorDarkText"], 50)  // Light.Tab.Text.SelectedHover
            )
        );

        this.Light.Input = new DashColorButtonSet(
            "none",  // Light.Input.AreaBackground (If applicable)
            new DashColorStateSet(
                this.Lighten(window["ColorLightBG"], 5),  // Light.Input.Background.Base
                "none",  // Light.Input.Background.Selected
                "none",  // Light.Input.Background.BaseHover
                "none"  // Light.Input.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorLightText"],  // Light.Input.Text.Base
                window["ColorLightText"],  // Light.Input.Text.Selected
                window["ColorLightText"],  // Light.Input.Text.BaseHover
                window["ColorLightText"]  // Light.Input.Text.SelectedHover
            )
        );
    };

    this.init_color_dark = function () {
        this.Dark.Background = window["ColorDarkBG"];
        this.Dark.Text = window["ColorLightText"];
        this.Dark.TextHeader = window["ColorLightText"];
        this.Dark.AccentGood = window["ColorAccentPrimary"];
        this.Dark.AccentBad = window["ColorAccentSecondary"];

        this.Dark.Button = new DashColorButtonSet(
            "none",  // Dark.Button.AreaBackground (If applicable)
            new DashColorStateSet(
                window["ColorButton"],  // Dark.Button.Background.Base
                window["ColorButtonSelected"],  // Dark.Button.Background.Selected
                this.Lighten(window["ColorButton"], 20),  // Dark.Button.Background.BaseHover
                this.Lighten(window["ColorButtonSelected"], 20)  // Dark.Button.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorLightText"],  // Dark.Button.Text.Base
                window["ColorLightText"],  // Dark.Button.Text.Selected
                this.Darken(window["ColorLightText"], 20),  // Dark.Button.Text.BaseHover
                this.Darken(window["ColorLightText"], 20)  // Dark.Button.Text.SelectedHover
            )
        );

        this.Dark.Tab = new DashColorButtonSet(
            window["ColorDarkBG"],  // Dark.Tab.AreaBackground (If applicable)
            new DashColorStateSet(
                window["ColorButton"],  // Dark.Tab.Background.Base
                window["ColorButtonSelected"],  // Dark.Tab.Background.Selected
                this.Lighten(window["ColorButton"], 20),  // Dark.Tab.Background.BaseHover
                this.Lighten(window["ColorButtonSelected"], 20)  // Dark.Tab.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorLightText"],  // Dark.Tab.Text.Base
                window["ColorLightText"],  // Dark.Tab.Text.Selected
                this.Darken(window["ColorLightText"], 20),  // Dark.Tab.Text.BaseHover
                this.Darken(window["ColorLightText"], 20)  // Dark.Tab.Text.SelectedHover
            )
        );

        this.Dark.Input = new DashColorButtonSet(
            "none",  // Dark.Input.AreaBackground (If applicable)
            new DashColorStateSet(
                this.Lighten(window["ColorLightBG"], 5),  // Dark.Input.Background.Base
                "none",  // Dark.Input.Background.Selected
                "none",  // Dark.Input.Background.BaseHover
                "none"  // Dark.Input.Background.SelectedHover
            ),
            new DashColorStateSet(
                window["ColorLightText"],  // Dark.Input.Text.Base
                window["ColorLightText"],  // Dark.Input.Text.Selected
                window["ColorLightText"],  // Dark.Input.Text.BaseHover
                window["ColorLightText"]  // Dark.Input.Text.SelectedHover
            )
        );
    };

    this.init_color_mobile = function () {
        var gradient_dark = this.Lighten(window["ColorDarkBG"], 15);
        var gradient_light = this.Lighten(window["ColorDarkBG"], 45);

        this.Mobile.AccentSecondary = this.Lighten(window["ColorButton"], 45);
        this.Mobile.AccentPrimary = this.Lighten(window["ColorButtonSelected"], 45);
        this.Mobile.BackgroundGradient = this.GetVerticalGradient(gradient_light, gradient_dark);
        this.Mobile.ButtonGradient = this.GetHorizontalGradient(gradient_light, gradient_dark);
    };

    this.to_rgba = function (color_data) {
        return "rgba(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ", " + color_data[3] + ")";
    };

    this.to_rgb = function (color_data) {
        return "rgb(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ")";
    };

    this._get_background_raised = function (color) {
        return this.Lighten(color, this.IsLightColor(color) ? 10: 40);
    };

    this.Names = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
    };

    this.setup_color_sets();
}
