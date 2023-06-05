function DashGuiContext2DEditorPanelContentPreComps (content) {
    this.content = content;

    this.rows = [];
    this.render_button = null;
    this.html = $("<div></div>");
    this.color = this.content.color;
    this.panel = this.content.panel;
    this.editor = this.panel.editor;
    this.can_edit = this.content.can_edit;

    this.setup_styles = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
            "overflow-x": "hidden"
        });

        this.redraw();
    };

    this.InputInFocus = function () {
        for (var row of this.rows) {
            if (row["input"].InFocus()) {
                return true;
            }
        }

        return false;
    };

    this.redraw = function () {
        this.html.empty();

        this.rows = [];

        for (var num in this.get_data()) {
            this.draw_row(num);
        }

        this.add_buttons();
    };

    this.draw_row = function (num) {
        var row = {};
        var data = this.get_data()[num];

        row["toolbar"] = new Dash.Layout.Toolbar(this);

        row["toolbar"].DisablePaddingRefactoring();
        row["toolbar"].RemoveStrokeSep();

        row["toolbar"].html.css({
            "background": "",
            "padding": 0,
            "margin-bottom": Dash.Size.Padding * 0.5
        });

        var on_input_changed = (function (self) {
            return function (value) {
                self.set_data("display_name", value, num);
            };
        })(this);

        row["input"] = row["toolbar"].AddInput(
            data["display_name"],
            on_input_changed,
            {
                "on_enter": on_input_changed,
                "on_autosave": on_input_changed
            },
            {},
            false
        );

        if (data["display_name"]) {
            row["input"].SetText(data["display_name"]);
        }

        row["input"].html.css({
            "flex": 2,
            "box-shadow": "none",
            "border": "1px solid " + this.color.Stroke
        });

        // This is broken by default somehow, doing this workaround for now
        row["input"].input.css({
            "color": this.color.Text
        });

        row["color_picker"] = (function (self) {
            return Dash.Gui.GetColorPicker(
                self,
                function (color_val) {
                    if (!color_val) {
                        return;
                    }

                    self.set_data("color", color_val, num);
                },
                "",
                self.color,
                data["color"] || "#000000",
                true,
                function () {
                    self.set_data("color", "", num);
                }
            );
        })(this);


        row["toolbar"].AddHTML(row["color_picker"].html);

        row["download_button"] = (function (self) {
            return row["toolbar"].AddIconButton(
                "download",
                function () {
                    self.download(num);
                },
                null,
                null,
                Dash.Size.ButtonHeight,
                0.65
            );
        })(this);

        this.rows.push(row);

        this.html.append(row["toolbar"].html);
    };

    this.add_buttons = function () {
        var button_bar = new Dash.Gui.ButtonBar(this, null, "toolbar");

        this.render_button = button_bar.AddButton("Render All Pre-Comps", this.render_all);

        this.render_button.SetHoverHint(
            "Render out pre-comps to see changes to layers tagged as pre-comps reflected in the CPE"
        );

        button_bar.html.css({
            "margin-top": Dash.Size.Padding
        });

        this.html.append(button_bar.html);
    };

    this.download = function (num) {
        this.rows[num]["download_button"].SetLoading(true);
        this.rows[num]["download_button"].Disable();

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    if (!Dash.Validate.Response(response) || !response["url"]) {
                        if (!response["url"]) {
                            alert("No rendered Pre-Comp found");
                        }

                        self.rows[num]["download_button"].SetLoading(false);
                        self.rows[num]["download_button"].Enable();

                        return;
                    }

                    Dash.Gui.OpenFileURLDownloadDialog(
                        response["url"],
                        "",
                        function () {
                            self.rows[num]["download_button"].SetLoading(false);
                            self.rows[num]["download_button"].Enable();
                        }
                    );
                },
                self.editor.api,
                {
                    "f": "get_precomp",
                    "c2d_id": self.editor.c2d_id,
                    "index": num
                }
            );
        })(this);
    };

    this.render_all = function () {
        this.render_button.SetLoading(true);
        this.render_button.Disable();

        (function (self) {
            Dash.Request(
                self,
                function (response) {
                    self.render_button.SetLoading(false);
                    self.render_button.Enable();

                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    alert("Renders complete!");

                    console.log("Pre-Comps rendered:", response);
                },
                self.editor.api,
                {
                    "f": "render_all_precomps",
                    "c2d_id": self.editor.c2d_id
                }
            );
        })(this);
    };

    this.get_data = function () {
        return this.editor.get_data()["precomps"];
    };

    this.set_data = function (key, value, num) {
        if (this.get_data()[num][key] === value) {
            return;
        }

        (function (self) {
            Dash.Request(
                this,
                function (response) {
                    if (!Dash.Validate.Response(response)) {
                        return;
                    }

                    self.editor.data = response;

                    if (key === "color" && !value) {
                        self.rows[num]["color_picker"].input.val(self.get_data()[num]["color"]);
                    }

                    self.panel.layers_box.UpdatePreCompColors();
                },
                self.editor.api,
                {
                    "f": "set_precomp_property",
                    "c2d_id": self.editor.c2d_id,
                    "key": key,
                    "value": value,
                    "index": num
                }
            );
        })(this);
    };

    this.setup_styles();
}
