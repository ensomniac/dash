function DashDocsHelp (color=null) {
    this.color = color || Dash.Color.Light;

    this.html = $("<div></div>");
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "padding": Dash.Size.Padding * 2
        });

        this.add_py();
        this.add_js();
    };

    this.add_py = function () {
        this.html.append(this.get_header("Python (Back End)", "python_logo"));

        var container = this.get_type_container();

        container.append(this.get_url_label(
            "Docstring should follow reStructuredText syntax. Example:",
            "https://docutils.sourceforge.io/docs/user/rst/cheatsheet.txt",
            "reStructuredText"
        ));

        container.append(this.get_code_block(
            this.parse_py_code(
                "# A comment placed directly above a function will be associated with that function\n" +
                'def Test(req_param1, req_param2: str, opt_param1="", opt_param2={}, opt_param3=[1, 2], opt_param4=False):\n' +
                '    """\n' +
                "    Description of the function.\n" +
                "    \n" +
                "    | Use a bar at the beginning of a description line to force a new line.\n" +
                "    \n" +
                "    :param str  req_param1: If a param doesn't have a default value, it's important to include its type in the docstring\n" +
                "    :param str  req_param2: And/or, use a type hint when declaring the param\n" +
                "    :param str  opt_param1: If a param does have a default value, include it at the end of the param's description, using the below syntax\n" +
                "    :param dict opt_param2: Description of opt_param2 (default={})\n" +
                "    :param list opt_param3: Description of opt_param3 (default=[1, 2])\n" +
                "    :param bool opt_param4: Description of opt_param3 (default=False)\n" +
                "    \n" +
                "    :return: Description of what is being returned\n" +
                "    :rtype:  str\n" +
                '    """\n' +
                "    \n" +
                '    return "Test"'
            ),
            "#75715E"
        ));

        this.html.append(container);
    };

    this.add_js = function () {
        this.html.append(this.get_header("JavaScript (Front End)", "javascript_logo"));

        var container = this.get_type_container();

        container.append(this.get_url_label(
            "Docstring should follow JSDoc syntax. Example:",
            "https://jsdoc.app",
            "JSDoc"
        ));

        container.append(this.get_code_block(
            this.parse_js_code(
                "// A comment placed directly above a function will be associated with that function\n" +
                'function Test (param1, param2, def_param1="", def_param2={}, def_param3=[1, 2], def_param4=false) {\n' +
                "    /**\n" +
                "     * Underline titles/headers with hyphens\n" +
                "     * -------------------------------------\n" +
                "     *\n" +
                "     * Description of the function.\n" +
                "     *\n" +
                "     * HTML tags, such as &lt;br&gt;, can be used in the description and will affect the way the docstring is rendered in IDEs, etc.\n" +
                "     *\n" +
                "     * - Use a hyphen in the description to render a bullet line.\n" +
                "     *\n" +
                "     * @param {string}  param1     - If a param doesn't have a default value, it's important to include its type in the docstring\n" +
                "     * @param {string}  param2     - Description of param2\n" +
                "     * @param {string}  def_param1 - If a param does have a default value, include it at the end of the param's description, using the below syntax\n" +
                "     * @param {object}  def_param2 - Description of def_param2 (default={})\n" +
                "     * @param {Array}   def_param3 - Description of def_param3 (default=[1, 2])\n" +
                "     * @param {boolean} def_param4 - Description of def_param3 (default=false)\n" +
                "     *\n" +
                "     * @returns {string} Description of what is being returned\n" +
                "     */\n" +
                "\n" +
                '    return "Test";\n' +
                "}"
            ),
            "#727072"
        ));

        var label = this.get_label(
            "If one script inherits from another (via <b>.call()</b>), add the <b>@member</b> tag to the top of the script that gets inherited.",
            "125%",
            "italic",
            this.color.Stroke
        );

        label.css({
            "margin-top": Dash.Size.Padding * 3,
            "margin-bottom": Dash.Size.Padding * 2
        });

        container.append(label);

        container.append(this.get_code_block(
            this.parse_js_code(
                "/**@member OtherClassThatInheritsThis*/"
            ),
            "#727072"
        ));

        this.html.append(container);
    };

    this.get_code_block = function (text, text_color="") {
        var container = $("<div></div>");

        container.css({
            "border-radius": Dash.Size.Padding,
            "background": this.opposite_color.Background,
            "padding": Dash.Size.Padding * 2
        });

        container.append(this.get_label(
            text,
            "100%",
            "Andale Mono, Monaco, monospace",
            text_color
        ));

        return container;
    };

    // Update this text color parsing if the example changes
    this.parse_js_code = function (text) {
        var type_color = "#63ECC8";
        var param_color = "#F59B6A";
        var number_color = "#AE90F5";
        var string_color = "#FFDE7F";
        var keyword_color = "#FF668B";
        var function_color = "#78DCE8";
        var operator_color = "#DD5FAE";
        var doc_syntax_color = "#C8BFF1";
        var style = "font-size: 100%; font-family: Andale Mono, Monaco, monospace; ";
        var equals = "<i style='" + style + "color: " + operator_color + "'>=</i>";

        // This has to come first
        // As of 9/8/22, iOS/Safari don't support regex lookbehind, and keeping this
        // prevents pages from loading at all in those contexts. Since I couldn't
        // figure out an alternative, I'm going to disable this for now.
        // text = text.replaceAll(/W*(?<!style)=/g, equals);

        text = text.replaceAll("[1", "[<i style='" + style + "color: " + number_color + "'>1</i>");
        text = text.replaceAll("2]", "<i style='" + style + "color: " + number_color + "'>2</i>]");
        text = text.replaceAll("false", "<i style='" + style + "color: " + keyword_color + "'>false</i>");
        text = text.replaceAll('"",', '<i style="' + style + 'color: ' + string_color + '">""</i>,');
        text = text.replaceAll("default" + equals, "<i style='" + style + "color: " + doc_syntax_color + "'>default</i>" + equals);
        text = text.replaceAll(/\bstring\b/g, "<i style='" + style + "color: " + type_color + "'>string</i>");

        for (var func of ["OtherClassThatInheritsThis", "call"]) {
            text = text.replaceAll(func, "<i style='" + style + "color: " + function_color + "'>" + func + "</i>");
        }

        text = text.replaceAll(
            'return "Test"',
            '<i style="' + style + 'color: ' + keyword_color + '">return</i> <i style="' + style + 'color: ' + string_color + '">"Test"</i>'
        );

        text = text.replaceAll(
            "function Test",
            "<i style='" + style + "color: " + keyword_color + "'>function</i> <i style='" + style + "color: " + function_color + "'>Test</i>"
        );

        for (var type of ["object", "Array", "boolean"]) {
            text = text.replaceAll(type, "<i style='" + style + "color: " + type_color + "'>" + type + "</i>");
        }

        for (var symbol of ["[", "]", "{", "}", "(", ")"]) {
            text = text.replaceAll(
                symbol,
                "<i style='" + style + "color: " + this.opposite_color.Text + "'>" + symbol + "</i>"
            );
        }

        for (var param of ["param1", "param2", "param3", "param4", "def_"]) {
            text = text.replaceAll(param, "<i style='" + style + "color: " + param_color + "'>" + param + "</i>");
        }

        for (var doc_syntax of ["@param", "@returns", "@member"]) {
            text = text.replaceAll(
                doc_syntax,
                "<i style='" + style + "color: " + doc_syntax_color + "'>" + doc_syntax + "</i>"
            );
        }

        return text;
    };

    // Update this text color parsing if the example changes
    this.parse_py_code = function (text) {
        var type_color = "#63ECC8";
        var param_color = "#F89769";
        var number_color = "#BF9AFF";
        var string_color = "#E6DB74";
        var comment_color = "#706F6A";
        var keyword_color = "#6BDCF1";
        var function_color = "#A0E767";
        var operator_color = "#F56188";
        var doc_syntax_color = "#7B7B54";
        var comment_text = text.split("\n")[0];
        var style = "font-size: 100%; font-family: Andale Mono, Monaco, monospace; ";
        var colon = "<i style='" + style + "color: " + operator_color + "'>:</i>";
        var equals = "<i style='" + style + "color: " + operator_color + "'>=</i>";

        // These two have to come first
        text = text.replaceAll(":", colon);

        // As of 9/8/22, iOS/Safari don't support regex lookbehind, and keeping this
        // prevents pages from loading at all in those contexts. Since I couldn't
        // figure out an alternative, I'm going to disable this for now.
        // text = text.replaceAll(/W*(?<!style)=/g, equals);

        text = text.replaceAll("[1", "[<i style='" + style + "color: " + number_color + "'>1</i>");
        text = text.replaceAll("2]", "<i style='" + style + "color: " + number_color + "'>2</i>]");
        text = text.replaceAll("False", "<i style='" + style + "color: " + keyword_color + "'>False</i>");
        text = text.replaceAll('"""', '<i style="' + style + 'color: ' + string_color + '">"""</i>');
        text = text.replaceAll('"",', '<i style="' + style + 'color: ' + string_color + '">""</i>,');
        text = text.replaceAll("default" + equals, "<i style='" + style + "color: " + doc_syntax_color + "'>default</i>" + equals);

        text = text.replaceAll(
            'return "Test"',
            '<i style="' + style + 'color: ' + keyword_color + '">return</i> <i style="' + style + 'color: ' + string_color + '">"Test"</i>'
        );

        text = text.replaceAll(
            comment_text,
            "<i style='" + style + "color: " + comment_color + "'>" + comment_text + "</i>"
        );

        text = text.replaceAll(
            "def Test",
            "<i style='" + style + "color: " + keyword_color + "'>def</i> <i style='" + style + "color: " + function_color + "'>Test</i>"
        );

        for (var type of ["str", "dict", "list", "bool"]) {
            text = text.replaceAll(" " + type, "<i style='" + style + "color: " + type_color + "'> " + type + "</i>");
        }

        for (var symbol of ["[", "]", "{", "}", "(", ")"]) {
            text = text.replaceAll(
                symbol,
                "<i style='" + style + "color: " + this.opposite_color.Text + "'>" + symbol + "</i>"
            );
        }

        for (var param of ["req_param1", "req_param2", "opt_param1", "opt_param2", "opt_param3", "opt_param4"]) {
            text = text.replaceAll(param, "<i style='" + style + "color: " + param_color + "'>" + param + "</i>");
        }

        for (var doc_syntax of ["param", "return", "rtype"]) {
            text = text.replaceAll(
                colon + doc_syntax,
                colon + "<i style='" + style + "color: " + doc_syntax_color + "'>" + doc_syntax + "</i>"
            );
        }

        return text;
    };

    this.get_type_container = function () {
        var container = $("<div></div>");

        container.css({
            "border-left": "2px solid " + this.color.Pinstripe,
            "margin-left": Dash.Size.Padding * 1.5,
            "padding-left": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding * 4,
            "padding-bottom": Dash.Size.Padding
        });

        return container;
    };

    this.get_url_label = function (full_text, url, text_segment_to_link) {
        var container = $("<div></div>");

        container.css({
            "display": "flex"
        });

        var font_size = "125%";
        var url_label = $("<a href='" + url + "'>" + text_segment_to_link + "</a>");

        url_label.css({
            "text-decoration": "underline",
            "color": this.color.Button.Background.Base,
            "font-family": "sans_serif_bold",
            "font-size": font_size,
            "padding-left": Dash.Size.Padding * 0.4,
            "padding-right": Dash.Size.Padding * 0.4,
            "margin-bottom": Dash.Size.Padding * 2
        });

        var split = full_text.split(text_segment_to_link);
        var start = this.get_label(split[0], font_size, "italic", this.color.Stroke);
        var end = this.get_label(split.Last(), font_size, "italic", this.color.Stroke);

        container.append(start);
        container.append(url_label);
        container.append(end);

        return container;
    };

    this.get_label = function (text, font_size="100%", font_family="normal", color="") {
        var label = $("<div>" + text + "</div>");

        label.css({
            "font-size": font_size,
            "color": color || this.color.Text,
            "font-family": "sans_serif_" + font_family,
            "white-space": "pre-wrap"
        });

        return label;
    };

    this.get_header = function (label_text, icon_name) {
        var container = $("<div></div>");

        container.css({
            "display": "flex",
            "margin-bottom": Dash.Size.Padding
        });

        container.append(this.get_label(label_text, "200%", "bold"));

        (function (self) {
            requestAnimationFrame(function () {
                var icon = new Dash.Gui.Icon(
                    self.color,
                    icon_name,
                    container.height(),
                    0.9,
                    self.color.AccentGood
                );

                icon.html.css({
                    "margin-right": Dash.Size.Padding * 0.5
                });

                container.prepend(icon.html);
            });
        })(this);

        return container;
    };

    this.setup_styles();
}
