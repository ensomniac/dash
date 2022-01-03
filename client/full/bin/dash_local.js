function DashLocal () {
    this.Set = function (key, value) {
        if (key.indexOf(Dash.Context["asset_path"] + "_") !== 0) {
            key = Dash.Context["asset_path"] + "_" + key;
        }

        return localStorage.setItem(key, value);
    };

    this.Get = function (key) {
        if (key.indexOf(Dash.Context["asset_path"] + "_") !== 0) {
            key = Dash.Context["asset_path"] + "_" + key;
        }

        return localStorage.getItem(key);
    };
}
