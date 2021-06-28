class DashColorButtonSet {

    constructor(area_background, background, text) {
        this._area_background = area_background; // HTML Color
        this._background = background; // DashColorStateSet()
        this._text       = text;       // DashColorStateSet()
    };

    get AreaBackground() {
        return this._area_background;
    };

    get Background() {
        return this._background;
    };

    get Text() {
        return this._text;
    };

    //////////////////////////

    set AreaBackground(state_set) {
        this._area_background = state_set;
    };

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

}
