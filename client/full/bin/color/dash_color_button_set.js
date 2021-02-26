class DashColorButtonSet {

    constructor(background, text) {
        this._background = background; // DashColorStateSet()
        this._text       = text;       // DashColorStateSet()
    };

    get Background() {
        return this._background;
    };

    get Text() {
        return this._text;
    };

    //////////////////////////

    set Background(state_set) {
        this._background = state_set;
        this._background.FillStates();
    };

    set Text(state_set) {
        this._text = state_set;
        this._text.FillStates();
    };

    AssertButtonSet() {
        // DOC: This is a dummy function to force an
        // error if an object does not have this method
        return this._selected_hover;
    };

};
