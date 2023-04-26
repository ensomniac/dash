function DashLocal (context) {
    this.context = context;

    this.Set = function (key, value) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        return localStorage.setItem(key, value);
    };

    // If bool_default is provided, the value will be
    // parsed as a bool and default to the value provided
    this.Get = function (key, bool_default=null) {
        if (key.indexOf(this.context["asset_path"] + "_") !== 0) {
            key = this.context["asset_path"] + "_" + key;
        }

        var value = localStorage.getItem(key);

        if (bool_default === true) {
            return ["true", true, null, ""].includes(value);
        }

        if (bool_default === false) {
            return ["true", true].includes(value);
        }

        return value;
    };
}
