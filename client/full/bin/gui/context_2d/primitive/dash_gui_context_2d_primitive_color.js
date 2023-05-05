/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveColor () {
    this.color = null;

    this._setup_styles = function () {
        // TODO
    };

    // Override
    this.on_update = function (key) {
        if (key.startsWith("aspect")) {
            this.set_init();
        }
    };

    // Override
    this.on_opacity_change = function (value) {
        // TODO?
    };

    // Override
    this.on_locked_change = function (locked) {
        // TODO?
    };

    // Override
    this.on_hidden_change = function (hidden) {
        // TODO?
    };

    this._setup_styles();
}
