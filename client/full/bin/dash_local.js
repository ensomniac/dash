function DashLocal (context) {
    this.context = context;

    this.Set = function (key, value) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        return localStorage.setItem(key, value);
    };

    this.Get = function (key) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        return localStorage.getItem(key);
    };
}
