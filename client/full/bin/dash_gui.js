function DashGui() {
    this.Button                      = DashGuiButton;
    this.ChatBox                     = DashGuiChatBox;
    this.ChatBox.Message             = DashGuiChatBoxMessage;
    this.ChatBox.Input               = DashGuiChatBoxInput;
    this.Checkbox                    = DashGuiCheckbox;
    this.Combo                       = DashGuiCombo;
    this.FileExplorer                = DashGuiFileExplorer;
    this.FileExplorer.PreviewStrip   = DashGuiFileExplorerPreviewStrip;
    this.FileExplorer.ContentPreview = DashGuiFileExplorerContentPreview;
    this.FileExplorerDesktopLoader   = DashGuiFileExplorerDesktopLoader;
    this.SearchableList              = DashGuiSearchableList;
    this.Header                      = DashGuiHeader;
    this.Icon                        = DashIcon;
    this.IconButton                  = DashGuiIconButton;
    this.Input                       = DashGuiInput;
    this.InputRow                    = DashGuiInputRow;
    this.Layout                      = new DashGuiLayout();
    this.LoadDots                    = DashGuiLoadDots;
    this.LoadingOverlay              = DashGuiLoadingOverlay;
    this.Login                       = DashGuiLogin;
    this.PaneSlider                  = this.Layout.PaneSlider; // This is redundant, but unsure if it's referenced in other projects
    this.PropertyBox                 = DashGuiPropertyBox;
    this.Slider                      = DashGuiSlider;
    this.ToolRow                     = DashGuiToolRow;
    this.LoadingLabel                = DashGuiLoadingLabel;

    this.GetHTMLContext = function (optional_label_text="", optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div>" + optional_label_text + "</div>");

        var css = {
            "color": color.Text,
            "font-family": "sans_serif_normal",
            "background": color.Background,
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        }

        html.css(css);

        return html;
    };

    this.GetHTMLAbsContext = function (optional_label_text="", color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "color": "black",
            "background": color.Background,
        });

        return html;
    };

    this.GetHTMLBoxContext = function (optional_style_css={}, color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var html = $("<div></div>");

        var css = {
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": color.BackgroundRaised,
            "color": color.Background,
            "border-radius": Dash.Size.Padding * 0.5,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)"
        };

        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        }

        html.css(css);

        return html;
    };

    this.GetModalBackground = function (color=null) {
        if (!color) {
            color = Dash.Color.Light;
        }

        var background = this.GetHTMLAbsContext();

        background.css({
            "z-index": 100000,  // Set Modal element to this +1
            "background": color.BackgroundRaised,
            "opacity": 0.6
        });

        // Block any elements from being clicked until app is done loading/processing/etc
        background.on("click", function (event) {
            event.stopPropagation();
        });

        return background;
    };

    this.HasOverflow = function (html) {
        try {
            return html[0].offsetHeight < html[0].scrollHeight;
        }

        catch {
            return false;
        }
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
            "background": color ? color.AccentGood : Dash.Color.Light.AccentGood,
        });

        return bottom_divider;
    };

    this.GetTipBox = function (code, msg, optional_style_css) {
        // A full width box that is meant to display information

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

    this.GetErrorBox = function (code, msg) {
        // A full width box that is meant to display an error

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
            "box-shadow": "0px 0px 15px 1px rgba(0, 0, 0, 0.2)",
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

    this.GetColorPicker = function (binder, callback, label_text="Color Picker", dash_color=null, default_picker_hex_color="#ff0000") {
        if (!dash_color) {
            dash_color = Dash.Color.Light;
        }

        callback = callback.bind(binder);

        var color_picker = {};
        color_picker["html"] = $("<div></div>");
        color_picker["label"] = $("<label for='colorpicker'>" + label_text + "</label>");
        color_picker["input"] = $("<input type='color' id='colorpicker' value='" + default_picker_hex_color + "'>");

        color_picker.label.css({
            "font-family": "sans_serif_normal",
            "color": dash_color.Text || "black"
        });

        color_picker.input.css({
            "margin-left": Dash.Size.Padding * 0.5,
            "margin-right": Dash.Size.Padding,
            "font-family": "sans_serif_normal",
            "color": dash_color.Text || "black"
        });

        color_picker.html.append(color_picker.label);
        color_picker.html.append(color_picker.input);

        (function (input, callback) {
            input.on("change", function () {
                callback(color_picker.input.val());
            });
        })(color_picker.input, callback);

        return color_picker;
    };

    this.GetTopRightIconButton = function (binder, callback, icon_id="trash", data_key=null, additional_data=null, existing_top_right_label=null) {
        callback = callback.bind(binder);

        if (existing_top_right_label) {
            existing_top_right_label.css({
                "right": Dash.Size.Padding * 5
            });
        }

        return (function (self, icon_id, callback, data_key, additional_data, binder) {
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
        })(this, icon_id, callback, data_key, additional_data, binder);
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
        }

        fetch(
            url
        ).then(
            resp => resp.blob()
        ).then(
            blob => {
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
            }
        ).catch(
            () => {
                if (callback) {
                    callback();
                }

                alert("File download failed, please try again, or open a new tab and go to the file's URL:\n\n" + url);
            }
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
            "border-radius": 3
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
        });
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

            if (override_element instanceof DashGuiListRow) {
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
                    "left": left
                });

                tooltip.show();

                if (text_getter) {
                    try {
                        tooltip.text(text_getter());
                    }

                    catch {
                        // Ignore
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

            if (override_element instanceof DashGuiListRow) {
                if (override_element.IsExpanded()) {
                    return;
                }
            }
        }

        clearTimeout(timer);

        tooltip.hide();
    };
}
