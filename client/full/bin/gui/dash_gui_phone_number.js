class DashGuiPhoneNumber {
    constructor (color=null, international=false) {
        this.color = color || Dash.Color.Light;
        this.international = international;

        this.segments = {};
        this.segment_order = [];
        this.html = $("<div></div>");

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "display": "flex"
        });

        if (this.international) {
            // TODO: Need a country-code dropdown, that once selected, draws the appropriate segments, and then
            //  those inputs will each need their own validation, presumably slightly differently than US validation
            console.error("Error: International address support has not yet been implemented.");

            return;
        }

        else {
            this.init_segments("us");
        }

        // TODO:
        //    - set rules on each input, like numeric type, and max chars
        //    - validate active segment on each change
        //    - auto-tab to the next box when current box is successfully validated (or just full)
        //    - smart delete, meaning, on backspace, if current box is empty, jump to the previous box and delete
        //    - in the class, have an international param (bool), set to false, but leave a to-do note that if true,
        //      there should be a country-code dropdown, that once selected, draws the appropriate segments (inputs)
    }

    get_segments (country_code) {
        if (country_code === "us") {
            return [
                ["area_code", 3],
                ["exchange", 3],
                ["subscriber_number", 4]
            ];
        }

        // TODO: Handle all other country codes here
        console.error("Error: International segments have not yet been handled.");

        return [];
    }

    init_segments (country_code) {
        for (var seg of this.get_segments(country_code)) {
            if (this.segment_order.length) {
                this.add_separator(country_code);
            }

            this.segment_order.push(seg[0]);

            this.segments[seg[0]] = this.add_input(seg[0], seg[1]);
        }
    }

    add_separator (country_code) {
        var char = "";

        if (country_code === "us") {
            char = "-";
        }

        else {
            // TODO: Handle all other country codes here
            console.error("Error: International separators have not yet been handled.");
        }

        var sep = $("<div>" + char + "</div>");

        sep.css({
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "background": "red"
        });

        this.html.append(sep);

        return sep;
    }

    add_input (type, length) {
        var input;  // Declare early for use in callbacks below

        input = new DashGuiInputType(
            null,
            "",
            this,
            (value) => {
                console.warn("TEST on submit", value);

                for (var seg_type of this.segment_order) {
                    var seg_input = this.segments[seg_type];

                    if (seg_input.Text().length !== parseInt(seg_input.input.attr("maxlength"))) {
                        return;
                    }
                }

                // TODO
                console.warn("TEST submit", value);
            },
            null,
            null,
            this.color,
            false
        );

        var pad = Dash.Size.Padding * 0.2;

        input.html.css({
            "background": "pink",
            "width": (Dash.Size.Padding * length) + (pad * 2)
        });

        input.input.css({
            // "flex": "",
            // "width": "auto",
            // "margin-left": "auto",
            // "margin-right": "auto",
            // "padding-left": pad,
            // "padding-right": pad
        });

        input.input.attr({
            "type": "tel",
            "pattern": "[0-9]{" + length + "}",
            "maxlength": length,
            "size": length
        });

        input.input.on("input", (e) => {
            if (input.Text().length === 0 && e?.originalEvent?.inputType === "deleteContentBackward") {
                this.focus_neighboring_input(type, false);
            }

            else if (input.Text().length === length) {
                this.focus_neighboring_input(type);
            }
        });

        this.html.append(input.html);

        return input;
    }

    focus_neighboring_input (type, next=true) {
        var index = this.segment_order.indexOf(type);

        if (index === -1) {
            return;
        }

        try {
            var input = this.segments[this.segment_order[index + (next ? 1 : -1)]];
        }

        catch {
            return;
        }

        if (input) {
            input.Focus();
        }
    }
}
