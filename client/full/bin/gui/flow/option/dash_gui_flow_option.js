class DashGuiFlowOption {
    constructor (options, id) {
        this.options = options;
        this.id = id;

        this.icon = null;
        this.image = null;
        this.label = null;
        this.active = false;
        this.font_size=null;
        this.text_tip = null;
        this.sub_label = null;
        this.multi_icon = null;
        this.multi_icon_num = null;
        this.view = this.options.view;
        this.color = this.view.color;
        this.html = $("<div></div>");
        this.view = this.options.view;
        this.bg_color = this.color.Pinstripe;
        this.border_color = this.color.PinstripeLight;
        this.active_bg_color = this.color.StrokeLight;
        this.hover_bg_color = this.color.PinstripeDark;
        this.active_border_color = this.color.AccentGood;
        this.border_size = this.options.option_border_size;
        this.sub_label_text_color = this.color.StrokeLight;
        this.multi_icon_color =this.color.BackgroundRaised;
        this.sub_label_active_text_color = this.color.Stroke;
        this.label_text_shadow = "1px 1px 1px rgba(0, 0, 0, 0.25)";
        this.hover_border_color = Dash.Color.GetTransparent(this.active_border_color, 0.5);

        this.label_css = {
            "overflow": "hidden",
            "overflow-wrap": "break-word",
            "text-overflow": "ellipsis",
            "user-select": "none",
            "text-align": "center",
            "white-space": "pre-wrap",
            "width": "calc(100% - " + (Dash.Size.Padding * 2) + "px)"
        };

        this.setup_styles();
    }

    setup_styles () {
        this.html.css({
            "background": this.bg_color,
            "border-radius": Dash.Size.BorderRadius,
            "border": this.border_size + "px solid " + this.border_color,
            "height": "calc(100% - " + (this.border_size * 2) + "px)",
            "aspect-ratio": "1",
            "display": "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center",
            "overflow": "hidden",
            "cursor": "pointer"
        });

        this.setup_connections();
    }

    ID () {
        return this.id;
    }

    IsActive () {
        return this.active;
    }

    SetActive (active) {
        if (active === this.active) {
            return;
        }

        this.active = active;

        if (this.active) {
            this.highlight();
            this.show_multi_icon();
        }

        else {
            this.unhighlight();
            this.hide_multi_icon();
        }
    }

    OverrideFontSize (font_size) {
        this.font_size = font_size;

        this.label.css({
            "font-size": this.get_font_size()
        });
    }

    SetLabelText (text) {
        if (this.label) {
            this.label.text(text);

            this.label.css({
                "font-size": this.get_font_size()
            });
        }

        else {
            this.add_label(text);

            if (this.text_tip) {
                this.text_tip.html.css({
                    "top": "",
                    "bottom": 0
                });
            }
        }

        if (this.image) {
            this.image.css({
                "width": this.get_image_width()
            });
        }

        if (this.sub_label) {
            this.sub_label.css({
                "font-size": this.get_font_size(true)
            });
        }
    }

    SetSubLabelText (text, locked=false) {
        if (!this.label && locked) {
            Dash.Log.Warn("Warning: If locking the SubLabel, you need to set up the Label first");

            return;
        }

        if (this.label && (this.image || this.text_tip)) {
            Dash.Log.Warn("Warning: SubLabel is not intended to be used with an image or tip text");

            return;
        }

        if (this.sub_label) {
            this.sub_label.text(text);

            this.sub_label.css({
                "font-size": this.get_font_size(true)
            });
        }

        else {
            this.add_sub_label(text, locked);
        }

        if (this.label) {
            this.label.css({
                "font-size": this.get_font_size()
            });
        }
    }

    SetImageURL (url) {
        if (this.label && this.sub_label) {
            Dash.Log.Warn("Warning: SubLabel is not intended to be used with an image");

            return;
        }

        if (this.image) {
            this.image.css({
                "background-image": "url(" + url + ")",
                "width": this.get_image_width()
            });
        }

        else {
            this.add_image(url);
        }

        if (this.label) {
            this.label.css({
                "font-size": this.get_font_size()
            });
        }

        if (this.icon) {
            this.style_icon();
        }
    }

    SetIconName (icon_name) {
        if (this.icon) {
            this.icon.SetIcon(icon_name);

            this.style_icon();
        }

        else {
            this.add_icon(icon_name);
        }
    }

    SetTipText (text) {
        if (this.label && this.sub_label) {
            Dash.Log.Warn("Warning: SubLabel is not intended to be used with tip text");

            return;
        }

        if (this.text_tip) {
            this.text_tip.SetText(text);

            if (this.label) {
                this.text_tip.html.css({
                    "top": "",
                    "bottom": 0
                });
            }
        }

        else {
            this.add_text_tip(text);
        }
    }
    
    Resize () {
        if (this.label) {
            this.label.css({
                "font-size": this.get_font_size()
            });
        }

        if (this.sub_label) {
            this.sub_label.css({
                "font-size": this.get_font_size(true)
            });
        }

        if (this.icon) {
            this.style_icon();
        }
    }

    add_icon (icon_name) {
        this.icon = new Dash.Gui.Icon(this.color, icon_name, null, 1, this.color.Stroke);

        this.style_icon();

        this.html.prepend(this.icon.html);
    }

    style_icon () {
        if (!this.icon) {
            return;
        }

        this.icon.html.css({
            "width": this.image ? "20%" : "40%",
            "height": this.image ? "20%" : "40%"
        });

        this.icon.icon_html.css({
            "line-height": "",
            "font-size": ((this.image ? 200 : 250) * this.options.cell_size_dif_mult) + "%",
            "width": "100%",
            "height": "",
            "inset": "",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        });

        this.icon.AddShadow("1px 1px 1px " + this.multi_icon_color);
    }

    add_text_tip (text) {
        if (this.text_tip) {
            return;
        }

        this.text_tip = new DashGuiFlowTipText(this.view, text);

        this.text_tip.Emphasize();

        var css = {
            "position": "absolute",
            "left": 0,
            "opacity": 0.9
        };

        css[this.label ? "bottom" : "top"] = 0;

        this.text_tip.html.css(css);

        this.text_tip.html.hide();

        this.html.append(this.text_tip.html);
    }

    add_label (text) {
        if (this.label) {
            return;
        }

        this.label = $("<div>" + text + "</div>");

        var css = {
            ...this.label_css,
            "color": this.color.Text,
            "font-family": "sans_serif_bold",
            "font-size": this.get_font_size()
        };

        if (this.active) {
            css["text-shadow"] = this.label_text_shadow;
        }

        this.label.css(css);

        this.html.append(this.label);
    }

    add_sub_label (text, locked=false) {
        if (this.sub_label) {
            return;
        }

        this.sub_label = $("<div>" + text + "</div>");

        var css = {
            ...this.label_css,
            "color": this.active ? this.sub_label_active_text_color : this.sub_label_text_color,
            "font-family": "sans_serif_normal",
            "font-size": this.get_font_size(true)
        };

        if (locked && this.label) {
            var spacer = new Dash.Gui.GetFlexSpacer(3);

            spacer.css({
                "background": "pink",
                "flex-basis": 0
            });

            this.html.prepend(spacer);

            css["flex-grow"] = 3;
            css["flex-shrink"] = 3;
            css["flex-basis"] = 0;
        }

        this.sub_label.css(css);

        this.html.append(this.sub_label);
    }

    add_image (url) {
        if (this.image) {
            return;
        }

        this.image = Dash.File.GetImagePreview(url,"auto", this.get_image_width());

        this.image.css({
            "margin": Dash.Size.Padding,
            "aspect-ratio": "1"
        });

        this.html.append(this.image);
    }

    get_font_size (sub=false) {
        return Math.max(
            (
                (
                    sub ? (
                        this.label ? 105 : 150
                    ) : (
                        this.font_size || (this.image ? 100 : this.sub_label ? 125 : 150)  // this.view.core_gui_font_size)
                    )
                ) * this.options.cell_size_dif_mult
            ),
            sub ? 70 : 75
        ) + "%";
    }

    get_image_width () {
        return (this.label ? 50 : 70) + "%";
    }

    show_multi_icon () {
        if (!this.options.MultiEnabled()) {
            return;
        }

        if (this.multi_icon) {
            this.multi_icon.html.show();

            this.update_multi_icon_num();
        }

        else {
            this.add_multi_icon();
        }
    }

    hide_multi_icon () {
        if (!this.options.MultiEnabled() || !this.multi_icon) {
            return;
        }

        this.multi_icon.html.hide();
    }

    add_multi_icon () {
        this.multi_icon = new Dash.Gui.Icon(
            this.color,
            this.options.ordered_multi_select ? "circle" : "circle_dot",
            null,
            1,
            this.multi_icon_color
        );

        this.multi_icon.html.css({
            "position": "absolute",
            "top": Dash.Size.Padding * 0.5,
            "right": Dash.Size.Padding * 0.5
        });

        this.update_multi_icon_num();

        this.html.append(this.multi_icon.html);
    }

    update_multi_icon_num (num=null) {
        if (!this.options.ordered_multi_select) {
            if (this.multi_icon_num) {
                this.multi_icon_num.hide();
            }

            return;
        }

        if (!this.multi_icon) {
            this.add_multi_icon();

            return;
        }

        if (num === null) {
            num = parseInt(this.options.multi_select_order.indexOf(this)) + 1;
        }

        if (!this.multi_icon_num) {
            this.multi_icon_num = $("<div>" + num + "</div>");

            this.multi_icon_num.css({
                "color": this.color.AccentGood,
                "font-family": "sans_serif_bold",
                "position": "absolute",
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%, -50%)",
                "text-shadow": (
                    "-1px 1px 0 " + this.multi_icon_color + ", " +
                    "1px 1px 0 " + this.multi_icon_color + ", " +
                    "1px -1px 0 " + this.multi_icon_color + ", " +
                    "-1px -1px 0 " + this.multi_icon_color
                )
            });

            this.multi_icon.html.append(this.multi_icon_num);
        }

        else {
            this.multi_icon_num.text(num.toString());
        }
    }

    highlight () {
        this.html.css({
            "border": this.border_size + "px solid " + (this.active ? this.active_border_color : this.hover_border_color),
            "background": this.active ? this.active_bg_color : this.hover_bg_color
        });

        if (this.active) {
            if (this.label) {
                this.label.css({
                    "text-shadow": this.label_text_shadow
                });
            }

            if (this.sub_label) {
                this.sub_label.css({
                    "color": this.sub_label_active_text_color
                });
            }
        }
    }

    unhighlight () {
        if (this.active) {
            return;
        }

        this.html.css({
            "border": this.border_size + "px solid " + this.border_color,
            "background": this.bg_color
        });

        if (this.label) {
            this.label.css({
                "text-shadow": ""
            });
        }

        if (this.sub_label) {
            this.sub_label.css({
                "color": this.sub_label_text_color
            });
        }
    }

    show_tip () {
        if (!this.text_tip) {
            return;
        }

        this.text_tip.html.show();
    }

    hide_tip () {
        if (!this.text_tip) {
            return;
        }

        this.text_tip.html.hide();
    }

    setup_connections () {
        this.html.on("mouseenter", () => {
            this.highlight();
            this.show_tip();
        });

        this.html.on("mouseleave", () => {
            this.unhighlight();
            this.hide_tip();
        });

        this.html.on("click", () => {
            this.SetActive(this.options.MultiEnabled() ? !this.active : true);

            this.options.on_option_selected(this);
        });
    }
}
