function DashGui () {
    this.Address                   = DashGuiAddress;
    this.Alert                     = DashGuiAlert;
    this.Button                    = DashGuiButton;
    this.ButtonBar                 = DashGuiButtonBar;
    this.ChatBox                   = DashGuiChatBox;
    this.Checkbox                  = DashGuiCheckbox;
    this.Combo                     = DashGuiCombo;
    this.Confirm                   = DashGuiConfirm;
    this.Context2D                 = DashGuiContext2D;
    this.CopyButton                = DashGuiCopyButton;
    this.DatePicker                = DashGuiDatePicker;
    this.File                      = DashGuiFile;
    this.FileExplorer              = DashGuiFileExplorer;
    this.FileExplorerDesktopLoader = DashGuiFileExplorerDesktopLoader;
    this.Flow                      = DashGuiFlow;
    this.Graph                     = DashGuiGraph;
    this.Header                    = DashGuiHeader;
    this.Icon                      = DashGuiIcon;
    this.IconButton                = DashGuiIconButton;
    this.Input                     = DashGuiInput;
    this.InputRow                  = DashGuiInputRow;
    this.LoadDots                  = DashGuiLoadDots;
    this.LoadingLabel              = DashGuiLoadingLabel;
    this.LoadingOverlay            = DashGuiLoadingOverlay;
    this.Login                     = DashGuiLogin;
    this.Modal                     = DashGuiModal;
    this.PhoneNumber               = DashGuiPhoneNumber;
    this.Prompt                    = DashGuiPrompt;
    this.PropertyBox               = DashGuiPropertyBox;
    this.SelectorMenu              = DashGuiSelectorMenu;
    this.Signature                 = DashGuiSignature;
    this.Slider                    = DashGuiSlider;
    this.TextArea                  = DashGuiTextArea;
    this.TimePicker                = DashGuiTimePicker;
    this.ToolRow                   = DashGuiToolRow;
    this.VDB                       = DashGuiVDB;
    this.VDBEntry                  = DashGuiVDBEntry;
    this.VDBList                   = DashGuiVDBList;
    this.VDBListRow                = DashGuiVDBListRow;
    this.VDB3D                     = DashGuiVDB3D;

    this.GetHTMLContext = function (optional_label_text="", optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "color": color.Text,
            "font-family": "sans_serif_normal",
            "background": color.Background,
            ...optional_style_css
        });

        return html;
    };

    this.GetHTMLAbsContext = function (optional_label_text="", color=null, optional_style_css={}) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "color": color.Text,
            "background": color.Background,
            ...optional_style_css
        });

        return html;
    };

    this.GetHTMLBoxContext = function (optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div></div>");

        html.css({
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "color": color.Text,
            // "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.18)",
            "border": "1px solid " + color.Pinstripe,
            "border-radius": Dash.Size.Padding * 0.5,
            "background": color.BackgroundRaised,
            ...optional_style_css
        });

        return html;
    };

    this.HasOverflow = function (html) {
        try {
            return (
                   (html[0].offsetHeight < html[0].scrollHeight)
                || (html[0].offsetWidth < html[0].scrollWidth)
            );
        }

        catch {
            return false;
        }
    };

    this.ScrollToBottom = function (html) {
        html[0].scrollTop = html[0].scrollHeight;
    };

    this.ScrollToElement = function (container_html, element_html) {
        if (this.InScrollView(container_html, element_html)) {
            return;
        }

        element_html[0].scrollIntoView();
    };

    this.InScrollView = function (container_html, element_html) {
        if (!this.HasOverflow(container_html)) {
            return true;  // No overflow means there's no scroll, but it is therefore in view
        }

        var container_top = container_html.offset().top;
        var container_bottom = container_top + container_html.height();
        var element_top = element_html.offset().top;
        var element_bottom = element_top + element_html.height();

        return (  // Element is partially or fully visible within the container
               (element_top >= container_top && element_top <= container_bottom)
            || (element_bottom >= container_top && element_bottom <= container_bottom)
        );
    };

    this.GetBottomDivider = function (color=null, width_percent="") {
        var bottom_divider = $("<div></div>");

        if (width_percent) {
            width_percent = parseInt(width_percent);
        }

        bottom_divider.css({
            "height": Dash.Size.Padding * 0.1,
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-top": Dash.Size.Padding * 2,
            "width": width_percent ? width_percent.toString + "%" : "98%",
            "background": color ? color.AccentGood : Dash.Color.Light.AccentGood
        });

        return bottom_divider;
    };

    // A full width box that is meant to display information
    this.GetTipBox = function (code, msg, optional_style_css) {
        var tip = Dash.Gui.GetHTMLBoxContext(optional_style_css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);

        code_html.css({
            "font-family": "sans_serif_bold",
        });

        tip.append(code_html);
        tip.append(msg_html);

        return tip;
    };

    // A full width box that is meant to display an error
    this.GetErrorBox = function (code, msg) {
        var css = {};
        css["background"] = "orange";

        var tip = Dash.Gui.GetHTMLBoxContext(css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);

        code_html.css({
            "font-family": "sans_serif_bold",
        });

        tip.append(code_html);
        tip.append(msg_html);

        return tip;
    };

    this.GetFormContainer = function () {
        var container = $("<div></div>");

        container.css({
            "background": ContainerColor,  // TODO: What is this meant to be?
            "margin": Dash.Size.Padding,
            "padding": Dash.Size.Padding,
            // "box-shadow": "0px 0px 15px 1px rgba(0, 0, 0, 0.2)",
            "border": "1px solid " + Dash.Color.Light.Pinstripe,
            "color": "rgba(0, 0, 0, 0.8)",
            "border-radius": 6,
        });

        return container;
    };

    this.GetFlexSpacer = function (flex_grow_value=2) {
        var html = $("<div></div>");
        
        html.css({
            "flex-grow": flex_grow_value,
        });

        return html;
    };

    // TODO: This needs to be its own class/element
    this.GetColorPicker = function (
        binder=null, callback=null, label_text="Color Picker", dash_color=null,
        default_picker_hex_color="", include_clear_button=false, clear_button_cb=null, height=null
    ) {
        if (!default_picker_hex_color) {
            default_picker_hex_color = Dash.Color.PickerDefault;  // Using it as a default above doesn't cut it
        }

        if (!dash_color) {
            dash_color = binder?.color || Dash.Color.Light;
        }

        height = height || Dash.Size.ButtonHeight;

        var include_label = label_text && label_text.replace(":", "") !== "none";

        var id = "colorpicker_" + Dash.Math.Random();

        var color_picker = {
            "height": height,
            "html": $("<div></div>"),
            "input": $("<input type='color' id='" + id + "' value='" + default_picker_hex_color + "'>"),
            "default_hex_color": default_picker_hex_color
        };

        if (include_label) {
            color_picker["label"] = $("<label for='" + id + "'>" + label_text + "</label>");

            var line_break = label_text.includes("\n");

            var label_css = {
                "font-family": "sans_serif_bold",
                "font-size": "80%",
                "color": dash_color.Text || "black",
                "top": line_break ? 0 : (Dash.Size.Padding * (include_clear_button ? 0.5 : -0.5))
            };

            if (line_break) {
                label_css = {
                    ...label_css,
                    "white-space": "pre",
                    "height": height,
                    "display": "block",
                    "float": "left",
                    "text-align": "right",
                    "line-height": (height * 0.5) + "px"
                };
            }

            color_picker.label.css(label_css);
        }

        color_picker.input.css({
            "height": height,
            "margin-left": Dash.Size.Padding * 0.5,
            "background": "none",
            "cursor": "pointer",
            "border": "1px solid " + dash_color.StrokeLight,
            "border-radius": Dash.Size.Padding * 0.3
        });

        if (include_label) {
            color_picker.html.append(color_picker.label);
        }

        color_picker.html.append(color_picker.input);

        if (include_clear_button) {
            var small = height < Dash.Size.RowHeight;

            color_picker.html.css({
                "display": "flex"
            });

            if (clear_button_cb && binder) {
                clear_button_cb = clear_button_cb.bind(binder);
            }

            color_picker["clear_button"] = new Dash.Gui.IconButton(
                "close_square",
                function () {
                    color_picker.input.val(default_picker_hex_color);

                    if (clear_button_cb) {
                        clear_button_cb();
                    }
                },
                this,
                dash_color,
                {
                    "container_size": height,
                    "size_mult": small ? 0.75 : 0.5
                }
            );

            color_picker["clear_button"].SetIconColor(dash_color.AccentBad);

            if (small) {
                color_picker["clear_button"].html.css({
                    "margin-left": Dash.Size.Padding * 0.1
                });
            }

            else {
                color_picker["clear_button"].html.css({
                    "padding-top": Dash.Size.Padding * 0.1
                });
            }

            color_picker.html.append(color_picker.clear_button.html);
        }

        if (callback) {
            if (binder) {
                callback = callback.bind(binder);
            }

            color_picker.input.on("change", function () {
                callback(color_picker.input.val());
            });
        }

        return color_picker;
    };

    // This function is old and not written well
    this.GetTopRightIconButton = function (
        binder, callback, icon_id="trash", data_key=null, additional_data=null, existing_top_right_label=null
    ) {
        callback = callback.bind(binder);

        // This is so janky omg
        if (existing_top_right_label) {
            existing_top_right_label.css({
                "right": Dash.Size.Padding * 5
            });
        }

        var button = new Dash.Gui.IconButton(
            icon_id,
            function (response) {
                callback(data_key, additional_data, response);
            },
            binder,
            binder.color || Dash.Color.Dark
        );

        button.html.css({
            "position": "absolute",
            "left": "auto",
            "bottom": "auto",
            "top": Dash.Size.Padding * 0.8,
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "z-index": 1
        });

        return button;
    };

    this.GetTopRightLabel = function (text="", color=null) {
        var label = this.GetHTMLAbsContext(text, color);

        label.css({
            "background": "none",
            "left": "auto",
            "bottom": "auto",
            "right": Dash.Size.Padding,
            "height": Dash.Size.RowHeight,
            "text-align": "right",
            "color": color ? color.Text : Dash.Color.Light.Text,
            "opacity": 0.6,
            "z-index": 1,
            "cursor": "auto"
        });

        return label;
    };

    this.OpenFileURLDownloadDialog = function (url, filename="", callback=null) {
        var dialog_id = "__dash_file_url_download_dialog";

        if (!filename) {
            filename = url.split("/").Last();

            if (filename.includes("?")) {
                filename = filename.split("?")[0];
            }
        }

        Dash.File.URLToBlob(
            url,
            function (blob) {
                var url_pointer = window.URL.createObjectURL(blob);

                // This will only already exist if we don't removeChild at the end of this
                // function - however, using removeChild at the end seems most efficient
                var dialog = document.getElementById(dialog_id);

                if (!dialog) {
                    dialog = document.createElement("a");

                    dialog.setAttribute("id", dialog_id);

                    dialog.style.display = "none";
                }

                dialog.href = url_pointer;
                dialog.download = filename;

                document.body.appendChild(dialog);

                dialog.click();

                window.URL.revokeObjectURL(url_pointer);

                document.body.removeChild(dialog);

                if (callback) {
                    callback();
                }
            },
            callback
        );
    };

    // This is rather quick/dirty and should probably become its own style at some point (will require it to first be visually improved)
    // This can also be taken even further by appending html to the tooltip div after it's returned, rather than supplying text
    this.AddTooltip = function (html, static_text=null, monospaced=true, additional_css={}, delay_ms=1000, override_element=null, text_getter=null) {
        var tooltip = $("<div></div>");

        html.append(tooltip);

        this.set_tooltip_css(tooltip, additional_css, monospaced);

        if (static_text) {
            tooltip.text(static_text);
        }

        tooltip.hide();

        (function (self, html, additional_css, override_element, delay_ms, tooltip, text_getter) {
            var timer;

            html.hover(
                function () {
                    timer = self.tooltip_on_hover_in(html, tooltip, override_element, additional_css, delay_ms, text_getter);
                },
                function () {
                    self.tooltip_on_hover_out(tooltip, override_element, timer);
                }
            );
        })(this, html, additional_css, override_element, delay_ms, tooltip, text_getter);

        return tooltip;
    };

    this.GetImageContainer = function (url, height=100, centered=false, minimizable=false, start_minimized=false) {
        if (start_minimized && !minimizable) {
            minimizable = true;
        }

        var image = $("<div></div>");

        image.css({
            "background-image": "url(" + url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "margin": Dash.Size.Padding,
            "height": start_minimized ? height * 0.25 : height,
            "width": start_minimized ? height * 0.25 : height,
            "border-radius": Dash.Size.BorderRadius
        });

        if (centered) {
            image.css({
                "background-position": "center center"
            });
        }

        if (!minimizable) {
            return image;
        }

        this.add_corner_button_to_image_container(image, height, !start_minimized);

        return image;
    };

    // This styles it in the Candy way - this is meant to stay simple and has been
    // propagated throughout a few places in Dash, so be cautious if altering this
    this.Flatten = function (html) {
        html.css({
            "box-shadow": "none",
            "background": "none",
            // "border-radius": ""
            "border": "none"
        });
    };

    this.GetDarkModeToggle = function (color) {
        var container = $("<div></div>");

        container.css({
            "display": "flex",
            "width": "fit-content",
            "height": "fit-content"
        });

        var toggle = new Dash.Gui.Checkbox(
            "dark_mode_active",
            false,
            color,
            "Toggle",
            this,
            function () {
                location.reload();  // Necessary unless we somehow redraw everything relative to the current context
            }
        );

        toggle.html.css({
            "margin-left": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding * 1.6
        });

        toggle.SetIconSize(190);
        toggle.SetTrueIconName("toggle_on_light");
        toggle.SetFalseIconName("toggle_off_light");

        var sun_icon = new Dash.Gui.Icon(color, "sun");
        var moon_icon = new Dash.Gui.Icon(color, "moon");

        sun_icon.SetColor(color.AccentGood);
        sun_icon.AddShadow();

        moon_icon.SetColor(color.AccentGood);
        moon_icon.AddShadow();

        sun_icon.html.css({
            "pointer-events": "none"
        });

        moon_icon.html.css({
            "pointer-events": "none"
        });

        container.append(sun_icon.html);
        container.append(toggle.html);
        container.append(moon_icon.html);

        return container;
    };

    this.GetMobileNotificationIcon = function (size=null, parent_is_circle=true, color="red") {
        if (!size) {
            size = (Dash.Size.ButtonHeight - Dash.Size.Padding) * 0.25;  // Default for CardStackFooterButton
        }

        var icon = $("<div></div>");
        var pos = parent_is_circle ? 0 : -(Dash.Size.Padding * 0.5);

        icon.css({
            "background": color,
            "width": size,
            "height": size,
            "border-radius": size,
            "box-shadow": "0px 3px 5px 1px rgba(0, 0, 0, 0.2)",
            "border": "2px solid white",
            "position": "absolute",
            "top": pos,
            "right": pos
        });

        return icon;
    };

    this.GetKeyCopyButton = function (size, data_key, dash_color) {
        var right_margin = Dash.Size.Padding * 0.3;

        var button = new Dash.Gui.CopyButton(
            this,
            () => {
                return data_key;
            },
            1,
            size,
            "default",
            "key_solid",
            dash_color,
            "Key copied!"
        );

        button.button.MirrorIcon();

        button.SetIconColor(dash_color.Stroke);

        button.html.css({
            "padding-top": size * 0.5,
            "margin-left": right_margin
        });

        return button;
    };

    this.add_corner_button_to_image_container = function (image_container, container_height, minimize=true) {
        var opacity = 0.75;
        var color = Dash.Color.Light;

        var button = (function (self) {
            return self.GetTopRightIconButton(
                this,
                function () {
                    // Dummy, will be overwritten
                },
                minimize ? "minimize" : "expand"
            );
        })(this);

        button.SetIconColor(color.Button.Text.Base);
        button.SetHoverHint(minimize ? "Minimize" : "Expand");

        button.icon.icon_html.css({
            "font-size": (container_height * 0.04).toString() + "px",
            "transform": "scale(-1, 1)"
        });

        button.icon.html.css({
            "margin-top": Dash.Size.Padding * 0.2,
            "margin-left": Dash.Size.Padding * 0.2
        });

        button.html.css({
            "background": color.Button.Background.Base,
            "width": container_height * 0.05,
            "height": container_height * 0.05,
            "top": Dash.Size.Padding * 0.7,
            "left": Dash.Size.Padding * 0.7,
            "box-shadow": "0px 0px 2px 1px " + Dash.Color.ParseToRGB(color.Button.Text.Base).replace(")", ", 0.75)"),
            "opacity": opacity
        });

        // Separate closure to override button's default click behavior, while retaining access to it
        (function (self) {
            button.html.on("click", function () {
                image_container.stop().animate(
                    {
                        "width": minimize ? container_height * 0.25 : container_height,
                        "height": minimize ? container_height * 0.25 : container_height
                    },
                    50,
                    function () {  // On animate complete
                        button.html.remove();

                        self.add_corner_button_to_image_container(image_container, container_height, !minimize);
                    }
                );
            });

            button.html.on("mouseenter", function () {
                button.html.stop().animate(
                    {"opacity": 1},
                    25,
                );
            });

            button.html.on("mouseleave", function () {
                button.html.stop().animate(
                    {"opacity": opacity},
                    25,
                );
            });
        })(this);

        image_container.append(button.html);
    };

    this.set_tooltip_css = function (tooltip, additional_css, monospaced) {
        var color = Dash.Color.Dark;
        var padding = Dash.Size.Padding * 0.5;

        tooltip.css({
            "padding": padding,
            "color": color.Text,
            "background": color.Background,
            "border": "2px solid " + color.BackgroundRaised,
            "border-radius": padding,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.5)",
            "position": "fixed",
            "z-index": 100000,
            "white-space": "pre-wrap",
            "opacity": 0.95,
            "cursor": "auto",
            "width": Dash.Size.ColumnWidth * 3,
            "pointer-events": "none",
            ...additional_css
        });

        if (monospaced) {
            tooltip.css({
                "font-family": "Andale Mono, Monaco, monospace",
                "font-size": "85%"
            });
        }

        else {
            tooltip.css({
                "font-family": "sans_serif_normal",
                "font-size": "90%"
            });
        }

        return tooltip;
    };

    this.tooltip_on_hover_in = function (html, tooltip, override_element, additional_css, delay_ms, text_getter=null) {
        if (override_element) {
            // Override element is intended to NOT show the tooltip under the below defined
            // circumstances. These will be unique depending on the element - expand as needed.

            if (override_element instanceof DashLayoutListRow) {
                if (override_element.IsExpanded()) {
                    return;
                }
            }
        }

        return setTimeout(
            function () {
                var top = html.offset()["top"];
                var left = html.offset()["left"];

                if (additional_css && additional_css["top"]) {
                    top = parseInt(additional_css["top"]);
                }

                if (additional_css && additional_css["left"]) {
                    left = parseInt(additional_css["left"]);
                }

                tooltip.css({
                    ...additional_css,
                    "top": top,
                    "left": left,
                    "opacity": 0.0,
                });

                tooltip.show().animate({"opacity": 1.0}, 200);

                if (text_getter) {
                    try {
                        tooltip.text(text_getter());
                    }

                    catch (e) {
                        console.error(e);
                    }
                }
            },
            delay_ms
        );
    };

    this.tooltip_on_hover_out = function (tooltip, override_element, timer) {
        if (override_element && !tooltip.is(":visible")) {
            // Override element is intended to NOT show the tooltip under the below defined
            // circumstances. These will be unique depending on the element - expand as needed.

            if (override_element instanceof DashLayoutListRow) {
                if (override_element.IsExpanded()) {
                    return;
                }
            }
        }

        clearTimeout(timer);

        tooltip.stop().animate({"opacity": 0}, 200, function () {$(this).hide()});
    };
}
