class DashGuiPhoneNumber {
    constructor (
        on_submit_cb=null, color=null, return_with_separators=false, international=false, allow_incomplete=false
    ) {
        this.on_submit_cb = on_submit_cb;
        this.color = color || Dash.Color.Light;
        this.return_with_separators = international;
        this.international = international;
        this.allow_incomplete = allow_incomplete;

        this.height = null;
        this.segments = {};
        this.separators = [];
        this.segment_order = [];
        this.copy_button = null;
        this.html = $("<div></div>");
        this.bottom_border = "1px solid " + this.color.PinstripeDark;

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

        this.add_copy_button();
        this.setup_paste_connection();
    }

    SetValue (value) {
        value = this.sanitize_value(value);

        var index = 0;

        for (var seg_type of this.segment_order) {
            var seg_input = this.segments[seg_type];
            var max_length = parseInt(seg_input.input.attr("maxlength"));

            seg_input.SetText(value.slice(index, index + max_length));

            index += max_length;
        }
    }

    GetValue (_for_copy=false) {
        var value = "";
        var expected_length = 0;
        var value_with_seps = "";

        for (var seg_type of this.segment_order) {
            var seg_input = this.segments[seg_type];

            expected_length += parseInt(seg_input.input.attr("maxlength"));

            value += seg_input.Text();

            if (this.return_with_separators || _for_copy) {
                value_with_seps += seg_input.Text();

                if (seg_type !== this.segment_order.Last()) {
                    if (this.international) {
                        // TODO: Handle all other country codes here
                        console.error("Error: International separators have not yet been handled.");
                    }

                    else {
                        value_with_seps += this.get_sep_char("us");
                    }
                }
            }
        }

        if (!_for_copy && !this.allow_incomplete && value.length && value.length !== expected_length) {
            return null;
        }

        return value_with_seps || value;
    }

    SetLocked (locked) {
        for (var seg_type of this.segment_order) {
            this.segments[seg_type].SetLocked(locked);
        }
    }

    add_copy_button () {
        this.copy_button = new Dash.Gui.CopyButton(
            this,
            () => {
                return this.GetValue(true);
            },
            0.6,
            this.height
        );

        this.html.append(this.copy_button.html);
    }

    get_segments (country_code) {
        if (country_code === "us") {
            return [
                ["sep", "("],
                ["area_code", 3],
                ["sep", ")"],
                ["exchange", 3],
                ["sep"],
                ["subscriber_number", 4]
            ];
        }

        // TODO: Handle all other country codes here
        console.error("Error: International segments have not yet been handled.");

        return [];
    }

    init_segments (country_code) {
        for (var seg of this.get_segments(country_code)) {
            if (seg[0] === "sep") {
                this.add_separator(country_code, seg[1] || "");

                continue;
            }

            this.segment_order.push(seg[0]);

            this.segments[seg[0]] = this.add_input(seg[0], seg[1]);
        }
    }

    get_sep_char (country_code) {
        if (country_code === "us") {
            return "-";
        }

        // TODO: Handle all other country codes here
        console.error("Error: International separators have not yet been handled.");

        return "";
    }

    add_separator (country_code, char="") {
        if (!char) {
            char = this.get_sep_char(country_code);
        }

        var sep = $("<div>" + char + "</div>");

        sep.css({
            "color": this.color.Stroke,
            "border-bottom": this.bottom_border
        });

        this.html.append(sep);

        this.separators.push(sep);

        return sep;
    }

    add_input (type, length) {
        var input;  // Declare early for use in callbacks below

        input = new DashGuiInputType(
            null,
            "",
            this,
            this.allow_incomplete ? this._on_submit.bind(this) : null,
            null,
            null,
            this.color,
            false
        );

        var pad = 0;  // Dash.Size.Padding * 0.1;

        input.html.css({
            "width": (Dash.Size.Padding * length) + (pad * 2)
        });

        input.input.css({
            "text-align": "center",
            "border-bottom": this.bottom_border,
            "padding-left": pad,
            "padding-right": pad
        });

        input.input.attr({
            "type": "tel",
            "pattern": "[0-9]{" + length + "}",
            "maxlength": length,
            "size": length
        });

        input.input.on("input", (e) => {
            input.SetText(this.sanitize_value(input.Text()));

            if (input.Text().length === 0 && e?.originalEvent?.inputType === "deleteContentBackward") {
                this.focus_neighboring_input(type, false);
            }

            else if (input.Text().length === length) {
                this.focus_neighboring_input(type);
            }

            if (!this.allow_incomplete) {
                this._on_submit();
            }
        });

        this.html.append(input.html);

        this.height = input.height;

        return input;
    }

    sanitize_value (value) {
        return value.replace(/\D/g, "");  // Ensure only numbers
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

    setup_paste_connection () {
        if (!Dash.Validate.Object(this.segments)) {
            return;
        }

        this.segments[this.segment_order[0]].input.on("paste", (e) => {
            e.preventDefault();

            var clipboard_data = (e.clipboardData || e.originalEvent.clipboardData || window.clipboardData);

            if (!clipboard_data) {
                return;
            }

            this.SetValue(clipboard_data.getData("text") || "");
            this._on_submit();
        });
    }

    _on_submit () {
        if (!this.on_submit_cb) {
            return;
        }

        var value = this.GetValue();

        if (!this.allow_incomplete && value === null) {
            return;
        }

        this.on_submit_cb(value);
    }
}
