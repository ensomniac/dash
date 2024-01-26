class DashGuiFlowOptions {
    constructor (view, bound_cb=null) {
        this.view = view;
        this.bound_cb = bound_cb;

        this.options = [];
        this.resize_timer = null;
        this.multi_select = false;
        this.last_cell_size = null;
        this.cell_size_dif_mult = 1;
        this.color = this.view.color;
        this.multi_select_order = [];
        this.html = $("<div></div>");
        this.cell_gap = Dash.Size.Padding;
        this.ordered_multi_select = false;
        this.option_size = Dash.Size.ColumnWidth;
        this.option_border_size = Dash.Size.Padding * 0.2;
        this.default_cell_size = this.option_size + (this.option_border_size * 2);

        this.setup_styles();
    }

    setup_styles () {
        var minmax = "minmax(" + (this.default_cell_size * 0.5) + "px, " + this.default_cell_size + "px)";

        this.html.css({
            "display": "grid",
            "gap": this.cell_gap,
            "align-self": "stretch",
            "min-height": this.default_cell_size,
            "grid-template-columns": "repeat(auto-fit, " + minmax + ")",
            "grid-auto-rows": minmax,
            "place-items": "center",
            "place-content": "center"
        });
    }

    OnResize () {
        var width = this.options[0].html.outerWidth();

        if (width >= this.default_cell_size) {
            return;
        }

        this.last_cell_size = this.last_cell_size ? null : width;

        var cell_size = (this.last_cell_size || this.default_cell_size);
        var minmax = "minmax(" + (cell_size * 0.5) + "px, " + cell_size + "px)";

        this.cell_size_dif_mult = cell_size / this.default_cell_size;

        this.html.css({
            "grid-template-columns": "repeat(auto-fit, " + minmax + ")",
            "grid-auto-rows": minmax
        });

        for (var option of this.options) {
            option.Resize();
        }

        if (!this.last_cell_size) {
            this.resize();
        }
    }

    AddOption (
        id, label_text="", image_url="", tip_text="", sub_label_text="", sub_text_locked=false, icon_name=""
    ) {
        var option = new DashGuiFlowOption(this, id);

        if (image_url) {
            option.SetImageURL(image_url);
        }

        if (icon_name) {
            option.SetIconName(icon_name);
        }

        if (label_text) {
            option.SetLabelText(label_text);
        }

        if (sub_label_text) {
            option.SetSubLabelText(sub_label_text, sub_text_locked);
        }

        if (tip_text) {
            option.SetTipText(tip_text);
        }

        this.html.append(option.html);

        this.options.push(option);

        this.resize();

        return option;
    }

    EnableMultiSelect () {
        this.multi_select = true;
    }

    EnableOrderedMultiSelect () {
        this.ordered_multi_select = true;
    }

    MultiEnabled () {
        return this.multi_select || this.ordered_multi_select;
    }

    GetSelected (return_option=false) {
        for (var option of this.options) {
            if (option.IsActive()) {
                return return_option ? option : option.ID();
            }
        }

        return null;
    }

    GetMultiSelections (return_option=false) {
        var option;
        var options = [];

        for (option of this.options) {
            if (option.IsActive()) {
                options.push(return_option ? option : option.ID());
            }
        }

        if (this.ordered_multi_select) {
            var ordered = [];

            for (option of this.multi_select_order) {
                if (return_option && options.includes(option)) {
                    ordered.push(options.Remove(option));
                }

                else if (!return_option && options.includes(option.ID())) {
                    ordered.push(options.Remove(option.ID()));
                }
            }

            for (option of options) {
                ordered.push(option);
            }

            return ordered;
        }

        return options;
    }

    on_option_selected (selected_option) {
        var option;

        if (!this.MultiEnabled()) {
            for (option of this.options) {
                if (option.ID() === selected_option.ID()) {
                    continue;
                }

                option.SetActive(false);
            }
        }

        else if (this.ordered_multi_select) {
            if (selected_option.IsActive()) {
                this.multi_select_order.push(selected_option);
            }

            else {
                this.multi_select_order.Remove(selected_option);
            }

            for (var i in this.multi_select_order) {
                this.multi_select_order[i].update_multi_icon_num(parseInt(i) + 1);
            }
        }

        if (this.bound_cb) {
            this.bound_cb(selected_option.ID());
        }
    }

    resize () {
        if (this.resize_timer) {
            clearTimeout(this.resize_timer);
        }

        this.resize_timer = setTimeout(
            () => {
                this.OnResize();
            },
            250
        );
    }
}
