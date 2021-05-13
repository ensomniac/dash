function DashColor(){

    // this.DarkBackground = "#e6e6e6";
    // this.LightBackground = "#e6e6e6";

    // this.Background = "#e6e6e6";
    // this.Text = "#333";

    // this.DarkText = "#333";
    // this.LightText = "#e3d5ca";

    this.Primary = "#95ae6c";
    this.Dark = "#202229";
    this.Light = "rgb(230, 230, 230)";
    this.SaveHighlight = "rgb(255, 255, 255, 0.5)";
    this.Warning = "#fab964";

    this.Light = null;
    this.Dark = null;

    // this.SetFromJson = function(light_theme_json, dark_theme_json){

    // };

    // this.Set = function(light_theme, dark_theme){
    //     console.log("SET");
    // };

    // this.fill_set = function(color_set){
    //     // color_set = object
    //     console.log(color_set);

    //     // color_set["background"] = color_set["background"] || "";


    // };

    this.setup_color_sets = function(){

        // var dark_bg = "rgb(30, 30, 30)";
        // var dark_bg_text = "rgb(200, 200, 200)";
        // var light_bg = "#e6e6e6";
        // var light_bg_text = "rgb(30, 30, 30)";
        // var button_color = "#3e9bb7";
        // var button_hover_color = "#4dc1e4";
        // var button_text_color = "rgb(230, 230, 230)";
        // var button_selected = "#ac4ac6";
        // var button_selected_hover = "#d468f0";
        // var text_header = "#5e448a";

        var min_light = {};
        min_light["background"]      = "#e6e6e6";
        min_light["text"]            = "rgb(80, 80, 80)";
        min_light["button"]          = "blue";
        min_light["button_selected"] = "red";

        var min_dark = {};
        min_dark["background"]       = "rgb(50, 50, 50)";
        min_dark["text"]             = "rgb(200, 200, 200)";
        min_dark["button"]           = "pink";
        min_dark["button_selected"]  = "orange";

        // var light = this.fill_set(min_light);
        // var dark  = this.fill_set(min_dark);

        var dark_bg = "#23262b";
        var dark_bg_text = "rgb(245, 245, 245)";
        var light_bg = "#e6e6e6";
        var light_bg_text = "rgb(30, 30, 30)";

        var button_color = "#4d505f";
        var button_hover_color = this.Lighten(button_color);
        var button_text_color = "rgb(230, 230, 230)";

        var button_selected = "#95ae6c";
        var button_selected_hover = this.Lighten(button_selected);

        var text_header = "#95ae6c";
        var text_header_dark = "#cfe1e7";

        var light_accent_good = "green";
        var light_accent_bad = "red";

        var dark_accent_good = "#5b9fb7";
        var dark_accent_bad = "#ff6144";

        var dark_button = "#5ba0b8";













        var light = new DashSiteColors({
            "background": "#dcdbd9",
            "background": "#e0dfde",
            "background": "#e3e8ea",
            // "background": "red",
            "background_raised": "#e3e8ea",
            "button": "#659cba",
            "button_text": "rgb(234 239 255)",
            // "accent_good": "#e0ccb4",
            "accent_good": "#f3d057",
            "accent_bad": "#f9663c",
            "text_header": "#2b323c",
            "tab_area_background": "#e4eaee",
            "tab_area_background": "#659cba",
            // "tab_area_background": "#6a7f8a",
            // "tab_area_background": "#e0ccb4",
            // "tab_area_background": "#655f5d",
            "tab_area_background": "#333",
        });

        // 659cba

        var dark = new DashSiteColors({
            "background": "#23262b",
            "background_raised": "#444b54",
            "button": "#5c9fb7",
            "button_text": "rgb(234 239 255)",
            "accent_good": "#ffc74d",
            "accent_bad": "#ff624c",
            "text_header": "#c4d4dd",
            "tab_area_background": "red",
        });

        var dark_input_background = "rgba(255, 255, 255, 0.8)";
        var light_input_background = "rgba(0, 0, 0, 0)";

        var dark_input_text = "rgba(0, 0, 0, 0.8)";
        var light_input_text = "rgba(0, 0, 0, 0.8)";

        // var tabs_top_dark = new DashColorButtonSet( // Top Tabs
        //     // authentic_modern_black, // The color of the area behind a set of buttons, if applicable
        //     "rgba(0, 0, 0, 0.2)", // The color of the area behind a set of buttons, if applicable
        //     new DashColorStateSet(
        //         "none", // Dark.Tabs.Background.Base
        //         background_color_light, // Dark.Tabs.Background.Selected
        //         "rgba(0, 0, 0, 0.0)", // Stroke under inactive tab
        //         authentic_magenta, // Dark.Tabs.Background.SelectedHover
        //     ),
        //     new DashColorStateSet(
        //         "rgba(0, 0, 0, 0.5)",   // Dark.Tabs.Text.Base
        //         "rgba(0, 0, 0, 0.8)",  // Dark.Tabs.Text.Selected
        //         "rgba(0, 0, 0, 0.7)",  // Dark.Tabs.Text.BaseHover
        //         "rgba(0, 0, 0, 0.9)",  // Dark.Tabs.Text.SelectedHover
        //     ),
        // );

        // console.log(light);

        this.Raise = function(cstr, raise_steps){
            raise_steps = raise_steps || 1;

            return cstr;

        };

        this.Random = function(cstr, lighten_rgb){
            var tmp_colors = ["red", "blue", "green", "orange"];
            return tmp_colors[Math.floor(Math.random() * Math.floor(tmp_colors.length))];
            // return "#" + Math.floor(Math.random()*16777215).toString(16);
        };

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
                "red", // The color of the area behind a set of tabs, if applicable
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

    };

    this.GetHorizontalGradient = function(color_1, color_2, color_3, color_4){
        return this.GetGradient(90, color_1, color_2, color_3, color_4);
    };

    this.GetVerticalGradient = function(color_1, color_2, color_3, color_4){
        return this.GetGradient(0, color_1, color_2, color_3, color_4);
    };

    this.GetGradient = function(degrees, color_1, color_2, color_3, color_4){

        var colors = "";

        if (color_1 && color_2 && color_3 && color_4) {
            colors = this.ParseToRGB(color_4) + " 0%, " + this.ParseToRGB(color_3) + " 25%, ";
            colors += this.ParseToRGB(color_2) + " 75%, " + this.ParseToRGB(color_1) + " 100%";
        }
        else if (color_1 && color_2 && color_3) {
            colors = this.ParseToRGB(color_3) + " 0%, " + this.ParseToRGB(color_2) + " 50%, ";
            colors += this.ParseToRGB(color_1) + " 100%"
        }
        else if (color_1 && color_2) {
            colors = this.ParseToRGB(color_2) + " 0%, " + this.ParseToRGB(color_1) + " 100%";
        }
        else {
            console.log("Error: At least 2 colors are required for a gradient");
            return "red";
        };

        return "linear-gradient(" + degrees + "deg, " + colors + ")";

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

    this.to_rgba = function(color_data){
        return "rgba(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ", " + color_data[3] + ")";
    };

    this.to_rgb = function(color_data){
        return "rgb(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ")";
    };

    this.ParseToRGB = function(cstr){
        return this.to_rgb(this.Parse(cstr));
    };

    this.ParseToRGBA = function(cstr){
        return this.to_rgba(this.Parse(cstr));
    };

    this.Lighten = function(cstr, lighten_rgb){

        lighten_rgb = lighten_rgb || 15; // How many units to add to r/g/b

        var pcolor = this.Parse(cstr);
        pcolor[0] += lighten_rgb;
        pcolor[1] += lighten_rgb;
        pcolor[2] += lighten_rgb;

        return this.to_rgb(pcolor);

    };

    this.Darken = function(cstr, darken_rgb){

        darken_rgb = darken_rgb || 15; // How many units to subtract to r/g/b

        var pcolor = this.Parse(cstr);
        pcolor[0] -= darken_rgb;
        pcolor[1] -= darken_rgb;
        pcolor[2] -= darken_rgb;

        return this.to_rgb(pcolor);

    };

    this.Parse = function(cstr) {

        var m = null;
        var parts = [];
        var alpha = 1
        var space = null;

        if (typeof cstr === 'string') {
            //keyword
            if (this.Names[cstr]) {
                parts = this.Names[cstr].slice()
                space = 'rgb'
            }

            //reserved words
            else if (cstr === 'transparent') {
                alpha = 0
                space = 'rgb'
                parts = [0,0,0]
            }

            //hex
            else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
                var base = cstr.slice(1)
                var size = base.length
                var isShort = size <= 4
                alpha = 1

                if (isShort) {
                    parts = [
                        parseInt(base[0] + base[0], 16),
                        parseInt(base[1] + base[1], 16),
                        parseInt(base[2] + base[2], 16)
                    ]
                    if (size === 4) {
                        alpha = parseInt(base[3] + base[3], 16) / 255
                    }
                }
                else {
                    parts = [
                        parseInt(base[0] + base[1], 16),
                        parseInt(base[2] + base[3], 16),
                        parseInt(base[4] + base[5], 16)
                    ]
                    if (size === 8) {
                        alpha = parseInt(base[6] + base[7], 16) / 255
                    }
                }

                if (!parts[0]) parts[0] = 0
                if (!parts[1]) parts[1] = 0
                if (!parts[2]) parts[2] = 0

                space = 'rgb'
            }

            //color space
            else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
                var name = m[1]
                var isRGB = name === 'rgb'
                var base = name.replace(/a$/, '')
                space = base
                var size = base === 'cmyk' ? 4 : base === 'gray' ? 1 : 3
                parts = m[2].trim()
                    .split(/\s*[,\/]\s*|\s+/)
                    .map(function (x, i) {
                        //<percentage>
                        if (/%$/.test(x)) {
                            //alpha
                            if (i === size) return parseFloat(x) / 100
                            //rgb
                            if (base === 'rgb') return parseFloat(x) * 255 / 100
                            return parseFloat(x)
                        }
                        //hue
                        else if (base[i] === 'h') {
                            //<deg>
                            if (/deg$/.test(x)) {
                                return parseFloat(x)
                            }
                            //<base-hue>
                            else if (baseHues[x] !== undefined) {
                                return baseHues[x]
                            }
                        }
                        return parseFloat(x)
                    })

                if (name === base) parts.push(1)
                alpha = (isRGB) ? 1 : (parts[size] === undefined) ? 1 : parts[size]
                parts = parts.slice(0, size)
            }

            //named channels case
            else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {
                parts = cstr.match(/([0-9]+)/g).map(function (value) {
                    return parseFloat(value)
                })

                space = cstr.match(/([a-z])/ig).join('').toLowerCase()
            }
        }

        //numeric case
        else if (!isNaN(cstr)) {
            space = 'rgb'
            parts = [cstr >>> 16, (cstr & 0x00ff00) >>> 8, cstr & 0x0000ff]
        }

        //array-like
        else if (Array.isArray(cstr) || cstr.length) {
            parts = [cstr[0], cstr[1], cstr[2]]
            space = 'rgb'
            alpha = cstr.length === 4 ? cstr[3] : 1
        }

        //object case - detects css cases of rgb and hsl
        else if (cstr instanceof Object) {
            if (cstr.r != null || cstr.red != null || cstr.R != null) {
                space = 'rgb'
                parts = [
                    cstr.r || cstr.red || cstr.R || 0,
                    cstr.g || cstr.green || cstr.G || 0,
                    cstr.b || cstr.blue || cstr.B || 0
                ]
            }
            else {
                space = 'hsl'
                parts = [
                    cstr.h || cstr.hue || cstr.H || 0,
                    cstr.s || cstr.saturation || cstr.S || 0,
                    cstr.l || cstr.lightness || cstr.L || cstr.b || cstr.brightness
                ]
            }

            alpha = cstr.a || cstr.alpha || cstr.opacity || 1

            if (cstr.opacity != null) alpha /= 100
        };

        return [parts[0], parts[1], parts[2], alpha, space]

    };

    this.setup_color_sets();

};
