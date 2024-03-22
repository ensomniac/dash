class DashColorSet {
    constructor (background, background_raised, text, text_header, accent_good, accent_bad, button, tab, input) {
        this._background  = background;               // HTML Color
        this._background_raised  = background_raised; // HTML Color
        this._text        = text;                     // HTML Color
        this._text_header = text_header;              // HTML Color
        this._accent_good = accent_good;              // HTML Color
        this._accent_bad  = accent_bad;               // HTML Color
        this._button      = button;                   // DashColorButtonSet()
        this._tab         = tab;                      // DashColorButtonSet()
        this._input       = input;                    // DashColorButtonSet()
        this._placeholder_class = "";                 // String
    };

    get Background () {
        return this._background;
    };

    get BackgroundRaised () {
        return this._background_raised;
    };

    get Text () {
        return this._text;
    };

    get TextHeader () {
        return this._text_header;
    };

    get AccentGood () {
        return this._accent_good;
    };

    get AccentBad () {
        return this._accent_bad;
    };

    get Button () {
        return this._button;
    };

    get Tab () {
        return this._tab;
    };

    get Input () {
        return this._input;
    };

    get PlaceholderClass() {
        return this._placeholder_class;
    };

    ///////////// PROGRAMMATIC START ////////////

    get TextColorData () {
        if (this._text_color_data == null) {
            // Cache this once since parsing can be expensive
            this._text_color_data = Dash.Color.Parse(this._text);
        }

        return this._text_color_data;
    };

    get StrokeDark () {
        if (this._stroke_dark == null) {
            this._stroke_dark = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.85
            ]);
        }

        return this._stroke_dark;
    };

    // Use to draw lines and boxes that compliment the interface
    // Think of this color as a lighter version of Text
    get Stroke () {
        if (this._stroke == null) {
            this._stroke = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.65
            ]);
        }

        return this._stroke;
    };

    get StrokeLight () {
        if (this._stroke_light == null) {
            this._stroke_light = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.4
            ]);
        }

        return this._stroke_light;
    };

    get PinstripeDark () {
        if (this._pinstripe_dark == null) {
            this._pinstripe_dark = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.25                    // Opacity
            ]);
        }

        return this._pinstripe_dark;
    };

    // Use to draw very fine lines to suggest depth / shadow
    get Pinstripe () {
        if (this._pinstripe == null) {
            this._pinstripe = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.1                    // Opacity
            ]);
        }

        return this._pinstripe;
    };

    // Pinstripe was supposed to be the lightest, but sometimes
    // a background is just a bit too dark and this becomes useful
    get PinstripeLight () {
        if (this._pinstripe_light == null) {
            this._pinstripe_light = Dash.Color.ToRGBA([
                this.TextColorData[0], // Red
                this.TextColorData[1], // Green
                this.TextColorData[2], // Blue
                0.05                   // Opacity
            ]);
        }

        return this._pinstripe_light;
    };

    ///////////// PROGRAMMATIC END ////////////

    /////////////////////////

    set Background (color) {
        this._background = color;

        // Since we don't allow BackgroundRaised to be set anymore, but it
        // is still referenced in the code, auto-update BackgroundRaised when
        // Background is updated - otherwise, the new Background will not work
        // well with the default, hard-coded BackgroundRaised.
        this._background_raised = Dash.Color._get_background_raised(color);
    };

    set Text (color) {
        this._text = color;
    };

    set TextHeader (color) {
        this._text_header = color;
    };

    set AccentGood (color) {
        this._accent_good = color;
    };

    set AccentBad (color) {
        this._accent_bad = color;
    };

    set Button (color_button_set) {
        this._button = color_button_set;
    };

    set Tab (color_button_set) {
        this._tab = color_button_set;
    };

    set Input (color_button_set) {
        this._input = color_button_set;
    };

    SetPlaceholderClass (placeholder_class_name) {
        this._placeholder_class = placeholder_class_name;
    };
}
