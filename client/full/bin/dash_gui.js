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

    this.GetHTMLAbsContext = function (optional_label_text="") {
        var html = $("<div>" + optional_label_text + "</div>");

        html.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            "color": "black",
            "background": Dash.Color.Light.Background,
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

    this.HasOverflow = function (html) {
        try {
            return html[0].offsetHeight < html[0].scrollHeight;
        }

        catch {
            return false;
        }
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

    this.OpenFileURLDownloadDialog = function (url, filename, callback=null) {
        var dialog_id = "__dash_file_url_download_dialog";

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
            // circumstances. These will be somewhat unique depending on the element - expand as needed.

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
            // circumstances. These will be somewhat unique depending on the element - expand as needed.

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
