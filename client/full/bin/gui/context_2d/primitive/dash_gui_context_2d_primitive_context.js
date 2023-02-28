/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveContext () {
    this._setup_styles = function () {
        var y = 0;
        var x = 0;
        var w = 0;
        var overrides = this.data["imported_context"]["overrides"];
        var len = this.data["imported_context"]["layers"]["order"].length || 1;

        for (var layer_id of this.data["imported_context"]["layers"]["order"]) {
            var layer_data = this.data["imported_context"]["layers"]["data"][layer_id];

            y += layer_data["anchor_norm_y"] + (overrides[layer_id]["anchor_norm_y"] || 0);
            x += layer_data["anchor_norm_x"] + (overrides[layer_id]["anchor_norm_x"] || 0);

            if (layer_data["type"] !== "text") {
                w = Math.max(w, layer_data["width_norm"] + (overrides[layer_id]["width_norm"] || 0));
            }
        }

        y /= len;
        x /= len;

        console.debug("TEST prim", y, x, w);

        // TODO: is this problematic?
        this.data["anchor_norm_y"] = y;
        this.data["anchor_norm_x"] = x;
        this.data["width_norm"] = w || 0.5;
        this.data["aspect"] = 1.0;
    };

    this._setup_styles();
}
