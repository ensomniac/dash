class DashColorSet {

    constructor(background, background_raised, tab_background, text, text_header, accent_good, accent_bad, button, tab) {
        this._background  = background;       // HTML Color
        this._background_raised  = background_raised;       // HTML Color
        this._tab_background = tab_background // HTML Color
        this._text        = text;             // HTML Color
        this._text_header = text_header;      // HTML Color
        this._accent_good = accent_good;      // HTML Color
        this._accent_bad  = accent_bad;       // HTML Color
        this._button      = button;           // DashColorButtonSet()
        this._tab         = tab;              // DashColorButtonSet()
    };

    get Background() {
        return this._background;
    };

    get BackgroundRaised() {
        return this._background_raised;
    };

    get TabBackground() {
        return this._tab_background;
    };

    get Text() {
        return this._text;
    };

    get TextHeader() {
        return this._text_header;
    };

    get AccentGood() {
        return this._accent_good;
    };

    get AccentBad() {
        return this._accent_bad;
    };

    get Button() {
        return this._button;
    };

    get Tab() {
        return this._tab;
    };

    /////////////////////////
    ///// INTERMEDIATES /////
    /////////////////////////

    // get BackgroundRaised() {
    //     return Dash.Color.Lighten(this._background, 20);
    // };

    /////////////////////////

    set Background(color) {
        this._background = color;
    };

    set TabBackground(color) {
        this._tab_background = color;
    };

    set Text(color) {
        this._text = color;
    };

    set TextHeader(color) {
        this._text_header = color;
    };

    set Button(color_button_set) {
        this._button = color_button_set;
    };

    set Tab(color_button_set) {
        this._tab = color_button_set;
    };

};
