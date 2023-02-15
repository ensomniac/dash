function DashGuiContext2DEditorPanelContentNew (content) {
    this.content = content;

    this.import_combo = null;
    this.floating_combos = [];
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

        this.draw_types();
        this.add_import_combo();

        (function (self) {
            requestAnimationFrame(function () {
                self.content.FloatCombos(self);
            });
        })(this);
    };

    // Called by DashGuiContext2D when combo options are received
    this.UpdateImportComboOptions = function () {
        if (!this.import_combo) {
            return;
        }

        this.import_combo.Update(
            this.editor.ComboOptions["contexts"] ? this.editor.ComboOptions["contexts"] : [{"id": "", "label_text": "ERROR"}],
            "",
            true
        );
    };

    this.draw_types = function () {
        for (var primitive_type of this.content.PrimitiveTypes) {
            if (primitive_type === "text") {
                (function (self, primitive_type) {
                    self.html.append(self.get_button(
                        "New Text Layer",
                        function () {
                            self.panel.AddLayer(primitive_type);
                        }
                    ).html);
                })(this, primitive_type);
            }

            else if (primitive_type === "image") {
                this.html.append(this.get_upload_button(primitive_type, "New Image Layer").html);
            }

            else {
                console.warn("Warning: Unhandled primitive type in 'New' tab:", primitive_type);
            }
        }
    };

    this.get_button = function (label_text, callback) {
        var button = new Dash.Gui.Button(label_text, callback, this, this.color, {"style": "toolbar"});

        button.html.css({
            "margin-top": 0,
            "margin-right": 0,
            "margin-bottom": Dash.Size.Padding
        });

        if (!this.can_edit) {
            button.Disable();
        }

        return button;
    };

    this.get_upload_button = function (primitive_type, label_text) {
        var button = (function (self) {
            return self.get_button(
                label_text + " (Upload)",
                function (response) {
                    // TODO: revert to this once data and image uploads are fully set up
                    // if (!Dash.Validate.Response(response)) {
                    //     return;
                    // }
                    //
                    // if ("error" in response) {
                    //     delete response["error"];
                    // }
                    //
                    // self.panel.AddLayer(primitive_type, response);

                    // TODO: TESTING
                    if (self.content.num === 3) {
                        self.content.num = -1;
                    }

                    self.content.num += 1;

                    self.panel.AddLayer(
                        primitive_type,
                        [
                            {
                                "exif": {},
                                "org_format": "png",
                                "orig_filename": "1x1.png",
                                "orig_width": 576,
                                "orig_height": 576,
                                "orig_aspect": 1.0,
                                "id": "2023021420135923786",
                                "uploaded_by": "stetandrew@gmail.com",
                                "uploaded_on": "2023-02-14T20:13:59.237993",
                                "parent_folders": [],
                                "orig_url": "https://realtimecandy.com/local/temp_test/2023021420135923786/2023021420135923786_orig.png",
                                "thumb_url": "https://realtimecandy.com/local/temp_test/2023021420135923786/2023021420135923786_thb.jpg",
                                "thumb_sq_url": "",
                                "thumb_png_url": "https://realtimecandy.com/local/temp_test/2023021420135923786/2023021420135923786_thb.png",
                                "width": 512,
                                "height": 512,
                                "aspect": 1.0
                            },
                            {
                                "exif": {},
                                "org_format": "png",
                                "orig_filename": "9x16.png",
                                "orig_width": 324,
                                "orig_height": 576,
                                "orig_aspect": 0.5625,
                                "id": "2023021420145992778",
                                "uploaded_by": "stetandrew@gmail.com",
                                "uploaded_on": "2023-02-14T20:14:59.927136",
                                "parent_folders": [],
                                "orig_url": "https://realtimecandy.com/local/temp_test/2023021420145992778/2023021420145992778_orig.png",
                                "thumb_url": "https://realtimecandy.com/local/temp_test/2023021420145992778/2023021420145992778_thb.jpg",
                                "thumb_sq_url": "",
                                "thumb_png_url": "https://realtimecandy.com/local/temp_test/2023021420145992778/2023021420145992778_thb.png",
                                "width": 288,
                                "height": 512,
                                "aspect": 0.5625
                            },
                            {
                                "exif": {},
                                "org_format": "png",
                                "orig_filename": "16x9.png",
                                "orig_width": 1024,
                                "orig_height": 576,
                                "orig_aspect": 1.7777777777777777,
                                "id": "2023021420151289278",
                                "uploaded_by": "stetandrew@gmail.com",
                                "uploaded_on": "2023-02-14T20:15:12.892139",
                                "parent_folders": [],
                                "orig_url": "https://realtimecandy.com/local/temp_test/2023021420151289278/2023021420151289278_orig.png",
                                "thumb_url": "https://realtimecandy.com/local/temp_test/2023021420151289278/2023021420151289278_thb.jpg",
                                "thumb_sq_url": "",
                                "thumb_png_url": "https://realtimecandy.com/local/temp_test/2023021420151289278/2023021420151289278_thb.png",
                                "width": 512,
                                "height": 288,
                                "aspect": 1.7777777777777777
                            },
                            {
                                "exif": {},
                                "org_format": "png",
                                "orig_filename": "transparent.png",
                                "orig_width": 356,
                                "orig_height": 357,
                                "orig_aspect": 0.9971988795518207,
                                "id": "2023021420163843540",
                                "uploaded_by": "stetandrew@gmail.com",
                                "uploaded_on": "2023-02-14T20:16:38.435113",
                                "parent_folders": [],
                                "orig_url": "https://realtimecandy.com/local/temp_test/2023021420163843540/2023021420163843540_orig.png",
                                "thumb_url": "https://realtimecandy.com/local/temp_test/2023021420163843540/2023021420163843540_thb.jpg",
                                "thumb_sq_url": "",
                                "thumb_png_url": "https://realtimecandy.com/local/temp_test/2023021420163843540/2023021420163843540_thb.png",
                                "width": 356,
                                "height": 357,
                                "aspect": 0.9971988795518207
                            }
                        ][self.content.num]
                    );
                    // TODO: TESTING
                }
            );
        })(this);

        // TODO: re-enable once data and image uploads are fully set up
        // button.SetFileUploader(
        //     this.editor.api,
        //     {"f": "upload_" + primitive_type}
        // );

        return button;
    };

    this.add_import_combo = function () {
        this.import_combo = (function (self) {
            return self.add_combo(
                "Import Another Context",
                "contexts",
                function (selected_option) {
                    if (!selected_option["id"]) {
                        return;
                    }

                    Dash.Request(
                        self,
                        function (response) {
                            if (!Dash.Validate.Response(response)) {
                                return;
                            }

                            if ("error" in response) {
                                delete response["error"];
                            }

                            self.panel.ImportContext(response);
                        },
                        self.api,
                        {
                            "f": "get_data",
                            "obj_id": selected_option["id"]
                        }
                    );
                }
            );
        })(this);
    };

    this.add_combo = function (label_text, options_key, callback) {
        var tool_row = this.content.GetCombo(
            label_text,
            this.editor.ComboOptions ? (
                this.editor.ComboOptions["contexts"] ? this.editor.ComboOptions["contexts"] : [{"id": "", "label_text": "ERROR"}]
            ) : [{"id": "", "label_text": "Loading..."}],
            callback
        );

        this.floating_combos.push({
            "tool_row": tool_row,
            "extra_top": Dash.Size.RowHeight
        });

        this.html.append(tool_row.html);

        return tool_row.elements.Last().combo;
    };

    this.setup_styles();
}
