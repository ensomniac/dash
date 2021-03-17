class DashSiteColors {

    constructor(color_obj) {
        this._col  = color_obj;
    };

    get Background() {
        return this._col["background"] || "orange";
    };

    get BackgroundRaised() {
        return this._col["background_raised"] || Dash.Color.Lighten(this._col["background"], 50);
    };

    get Button() {
        return this._col["button"] || "orange";
    };

    get ButtonText() {
        return this._col["button_text"] || "orange";
    };

    get AccentGood() {
        return this._col["accent_good"] || "orange";
    };

    get AccentBad() {
        return this._col["accent_bad"] || "orange";
    };

    get TabBackground() {
        return this._col["tab_background"] || this._col["background"] || "orange";
    };

};
