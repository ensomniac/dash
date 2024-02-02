class DashGuiFlowListDual {
    constructor (view, on_add_bound_cb=null, on_remove_bound_cb=null) {
        this.view = view;
        this.on_add_bound_cb = on_add_bound_cb;
        this.on_remove_bound_cb = on_remove_bound_cb;

        this.left_list = null;
        this.full_data = null;
        this.right_list = null;
        this.color = this.view.color;
        this.html = $("<div></div>");
        this.label_height = Dash.Size.ButtonHeight;
        this.left_label = this.view.GetLabel("All (click to add)");
        this.right_label = this.view.GetLabel("Selected (click to remove)");

        this.setup_styles();
    }

    setup_styles () {
        this.add_labels();
        this.add_lists();

        this.html.css({
            "flex": 2,
            "gap": Dash.Size.Padding * 2,
            "display": "flex",
            "justify-content": "center",
            "padding-top": this.label_height,
            "border-radius": Dash.Size.BorderRadius,
            "min-height": this.left_list.list.full_row_height * 5,
            "max-height": this.left_list.list.full_row_height * 10
        });
    }

    SetData (data={"data": {}, "order": []}) {
        this.ShowLoadingOverlay();

        this.full_data = data;

        this.left_list.Update(data);

        this.HideLoadingOverlay();
    }

    GetSelected () {
        return this.right_list.data ? Dash.GetDeepCopy(this.right_list.data["order"]) : [];
    }

    GetNotSelected () {
        return this.left_list.data ? Dash.GetDeepCopy(this.left_list.data["order"]) : [];
    }

    ShowLoadingOverlay () {
        this.left_list.ShowLoadingOverlay();

        this.right_list.ShowLoadingOverlay();
    }

    HideLoadingOverlay () {
        this.left_list.HideLoadingOverlay();

        this.right_list.HideLoadingOverlay();
    }

    AddItems (ids) {
        this.ShowLoadingOverlay();

        var right_order = this.GetSelected();
        var left_order = this.GetNotSelected();

        for (var id of ids) {
            left_order.Remove(id);

            right_order.push(id);
        }

        this.left_list.Update({
            "data": this.full_data["data"],
            "order": left_order
        });

        this.right_list.Update({
            "data": this.full_data["data"],
            "order": right_order
        });

        this.HideLoadingOverlay();
    }

    RemoveItems (ids) {
        this.ShowLoadingOverlay();

        var right_order = this.GetSelected();
        var left_order = this.GetNotSelected();

        for (var id of ids) {
            right_order.Remove(id);

            var new_index = null;
            var orig_index = this.full_data["order"].indexOf(id);

            // Try to re-insert it in respect to the original order
            for (var i in left_order) {
                if (this.full_data["order"].indexOf(left_order[i]) > orig_index) {
                    new_index = i;

                    break;
                }
            }

            if (new_index) {
                left_order.Insert(new_index, id);
            }

            else {
                left_order.push(id);
            }
        }

        this.right_list.Update({
            "data": this.full_data["data"],
            "order": right_order
        });

        this.left_list.Update({
            "data": this.full_data["data"],
            "order": left_order
        });

        this.HideLoadingOverlay();
    }

    add_labels () {
        var label_border = "1px solid " + this.color.PinstripeLight;

        var label_css = {
            "font-family": "sans_serif_bold",
            "color": this.color.StrokeDark,
            "font-size": "110%",
            "margin": 0,
            "position": "absolute",
            "top": 0,
            "background": this.color.Pinstripe,
            "padding-left": Dash.Size.Padding,
            "padding-right": Dash.Size.Padding,
            "height": this.label_height,
            "line-height": this.label_height + "px",
            "border-top": label_border,
            "border-left": label_border,
            "border-right": label_border,
            "border-top-left-radius": Dash.Size.BorderRadius,
            "border-top-right-radius": Dash.Size.BorderRadius
        };

        this.left_label.css({
            ...label_css,
            "left": 0
        });

        this.html.append(this.left_label);

        this.right_label.css({
            ...label_css,
            "right": 0
        });

        this.html.append(this.right_label);
    }

    add_lists () {
        this.left_list = new DashGuiFlowList(
            this.view,
            (row) => {
                var id = row.ID();

                this.AddItems([id]);

                if (this.on_add_bound_cb) {
                    this.on_add_bound_cb(id);
                }
            }
        );

        this.left_list.input.input.html.css({
            "border-top-left-radius": 0
        });

        this.html.append(this.left_list.html);

        this.right_list = new DashGuiFlowList(
            this.view,
            (row) => {
                var id = row.ID();

                this.RemoveItems([id]);

                if (this.on_remove_bound_cb) {
                    this.on_remove_bound_cb(id);
                }
            }
        );

        this.right_list.input.input.html.css({
            "border-top-right-radius": 0
        });

        this.html.append(this.right_list.html);
    }
}
