class DashColorStateSet {

    constructor(base, selected, base_hover, selected_hover) {
        this._base           = base;
        this._selected       = selected;
        this._base_hover     = base_hover;
        this._selected_hover = selected_hover;
    };

    get Base() {
        return this._base;
    };

    get BaseHover() {
        return this._base_hover;
    };

    get Selected() {
        return this._selected;
    };

    get SelectedHover() {
        return this._selected_hover;
    };

    FillStates() {
        // Doc: Since it's possible to only use one color, this function
        //makes sure to auto-fill missing colors

        if (!this._base) {
            console.log("ERROR: DashColorStateSet() Requires at least one color");
            return;
        }

        if (!this._selected) {
            console.log("Warning: Set a color for the 'Selected' property");
            this._selected = "red";
        }

        this._base_hover = this._base_hover || Dash.Color.Lighten(this._base, 50);
        this._selected_hover = this._selected_hover || Dash.Color.Lighten(this._selected, 50);

    };

}
