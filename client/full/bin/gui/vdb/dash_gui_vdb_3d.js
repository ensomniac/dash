function DashGuiVDB3D (
    vdb_type, obj_id, data={}, color=null, header_text="3D", asset_bundle_only=false,
    pbr=false, read_only=false, include_ref_box=false, include_unity_preview=false, get_unity_preview_cb=null
) {
    this.vdb_type = vdb_type;
    this.obj_id = obj_id;
    this.data = data;
    this.color = color || Dash.Color.Light;
    this.header_text = header_text;
    this.asset_bundle_only = asset_bundle_only;
    this.pbr = pbr;
    this.read_only = read_only;
    this.include_ref_box = include_ref_box;
    this.include_unity_preview = include_unity_preview;
    this.get_unity_preview_cb = get_unity_preview_cb;

    this.images = {};
    this.header = null;
    this.model_box = null;
    this.html = $("<div></div>");
    this.asset_bundle_box = null;
    this.last_asset_bundle_url = "";
    this.model_row = $("<div></div>");
    this.texture_row = $("<div></div>");
    this.asset_bundle_download_button = null;
    this.preview_width = Dash.Size.ColumnWidth * 2;
    this.texture_width = this.preview_width * (this.pbr ? 0.65 : 1);
    this.download_asset_bundle_text = "Download" + (this.asset_bundle_only ? "" : " Asset Bundle");

    this.asset_bundle_na_text = (
        this.asset_bundle_only ? "" : " Asset Bundle "
    ) + "Not Available (or currently being generated)";

    this.asset_area = Dash.Gui.GetHTMLBoxContext(
        {"margin-left": Dash.Size.Padding * 2},
        this.color
    );

    this.setup_styles = function (validated=false) {
        if (!validated && !(this instanceof DashGuiVDB3D)) {
            setTimeout(
                () => {
                    // If this class is inherited, use a small delay
                    // to allow for any overrides before setup
                    this.setup_styles(true);
                },
                100
            );

            return;
        }

        this.html.css({
            "margin-top": Dash.Size.Padding * 2
        });

        this.header = new Dash.Gui.Header(this.header_text);

        this.header.ReplaceBorderWithIcon("cube");

        this.html.append(this.header.html);

        this.add_asset_bundle_buttons();

        this.html.append(this.asset_area);

        if (!this.asset_bundle_only) {
            this.texture_row.css({
                "display": "flex"
            });

            this.asset_area.append(this.texture_row);
        }

        this.model_row.css({
            "display": "flex",
            "margin-top": this.asset_bundle_only ? 0 : Dash.Size.Padding
        });

        this.asset_area.append(this.model_row);

        if (!this.asset_bundle_only) {
            this.add_textures();
            this.redraw_model_box();
        }

        this.redraw_asset_bundle_box();
    };

    this.UpdateAssetBundle = function (data=null) {
        if (Dash.Validate.Object(data)) {
            this.data = data;
        }

        var url = (this.data["asset_bundle"] || {})["url"];

        this.asset_bundle_download_button.SetText(
            url ? this.download_asset_bundle_text : this.asset_bundle_na_text
        );

        this.asset_bundle_download_button.SetLoading(false);

        if (url) {
            this.asset_bundle_download_button.Enable();
        }

        else {
            this.asset_bundle_download_button.Disable();
        }

        if (url !== this.last_asset_bundle_url) {
            this.redraw_asset_bundle_box();
        }
    };

    this.OnGeneratingNewAssetBundle = function () {
        if (!this.asset_bundle_download_button) {
            return;
        }

        this.asset_bundle_download_button.SetText("Generating New Asset Bundle");
        this.asset_bundle_download_button.SetLoading(true);
        this.asset_bundle_download_button.Disable();
    };

    this.add_asset_bundle_buttons = function () {
        this.add_asset_bundle_download_button();

        if (this.read_only || (Dash.User.Init["roles"] && !Dash.User.Init["roles"].includes("admin"))) {
            return;
        }

        this.add_asset_bundle_regen_button();
        this.add_asset_bundle_log_button();
    };

    this.add_asset_bundle_download_button = function () {
        var asset_bundle_url = (this.data["asset_bundle"] || {})["url"];

        this.asset_bundle_download_button = (function (self) {
            return self.get_asset_bundle_button(
                asset_bundle_url ? self.download_asset_bundle_text : self.asset_bundle_na_text,
                function (event, button) {
                    var url = (self.data["asset_bundle"] || {})["url"];

                    if (!url) {
                        alert("URL missing");

                        return;
                    }

                    button.SetLoading(true);
                    button.Disable();

                    Dash.Gui.OpenFileURLDownloadDialog(
                        url,
                        "",
                        function () {
                            button.SetLoading(false);
                            button.Enable();
                        }
                    );
                }
            );
        })(this);

        if (!asset_bundle_url) {
            this.asset_bundle_download_button.Disable();
        }

        this.header.html.append(this.asset_bundle_download_button.html);
    };

    this.add_asset_bundle_regen_button = function () {
        this.header.html.append((function (self) {
            return self.get_asset_bundle_button(
                "Manually Regenerate" + (self.asset_bundle_only ? "" : " Asset Bundle"),
                function () {
                    if (!window.confirm(
                        "Asset bundles are queued to be generated automatically when a new texture or " +
                        "model is uploaded. Manual generation is not typically necessary.\n\nProceed anyway?"
                    )) {
                        return;
                    }

                    Dash.Request(
                        self,
                        function (response) {
                            if (!Dash.Validate.Response(response)) {
                                return;
                            }

                            alert(
                                "Asset bundle has been queued!\n\n(It may take a few minutes before it's available)"
                            );

                            self.asset_bundle_download_button.SetText(self.asset_bundle_na_text);

                            self.asset_bundle_download_button.SetLoading(false);
                            self.asset_bundle_download_button.Disable();
                        },
                        "VDB",
                        {
                            "f": "rebuild_3d_pipeline_asset_bundle",
                            "vdb_type": self.vdb_type,
                            "obj_id": self.obj_id
                        }
                    );
                }
            );
        })(this).html);
    };

    this.add_asset_bundle_log_button = function () {
        this.header.html.append(((function (self) {
            return self.get_asset_bundle_button(
                "Open Last"  + (self.asset_bundle_only ? "" : " Asset Bundle") + " Log",
                function () {
                    var url = (self.data["asset_bundle"] || {})["log_url"];

                    if (!url) {
                        alert(
                            "No log found.\n\n(Likely due to the asset bundle " +
                            "not existing or currently being generated)"
                        );

                        return;
                    }

                    window.open(url, "_blank");
                }
            );
        })(this)).html);
    };

    this.get_asset_bundle_button = function (label_text, callback) {
        var button = new Dash.Gui.Button(
            label_text,
            callback,
            this,
            this.color,
            {"style": "toolbar"}
        );

        button.html.css({
            "margin-top": 0
        });

        return button;
    };

    this.add_ref_box = function () {
        if (!this.include_ref_box) {
            return;
        }

        var box = this.get_container(this.texture_width);
        var img = this.get_image(this.texture_width, this.get_thumb_url("graphic"), "graphic");
        var toolbar = this.get_toolbar("Ref (PNG, square, no background)", "graphic");

        box.append(img);
        box.append(toolbar.html);

        this.texture_row.append(box);
    };

    this.add_texture_box = function (label_text, texture_key="") {
        var box = this.get_container(this.texture_width);
        var asset_type = "texture" + (texture_key ? "s" : "");

        var img = this.get_image(
            this.texture_width,
            this.get_thumb_url(asset_type, null, texture_key),
            asset_type,
            false,
            texture_key
        );

        var toolbar = this.get_toolbar(label_text, asset_type, texture_key);

        box.append(img);
        box.append(toolbar.html);

        this.texture_row.append(box);
    };

    this.add_textures = function () {
        if (this.pbr) {
            var sets = {
                "albedo": "Albedo/Color\n(RGB)",
                "occl": "Ambient Occlusion\n(Single channel)",
                "normal": "Normals\n(RGB)",
                "metal_gloss": "Metal (R channel)\nGloss (A channel)",
                "height": "Height\n(Single channel)"
            };

            for (var texture_key in sets) {
                this.add_texture_box(sets[texture_key], texture_key);
            }
        }

        else {  // Basic 3D assets (color map only)
            this.add_ref_box();
            this.add_texture_box("Color Map (PNG, 4096x4096)");
        }
    };

    this.add_model_box = function () {
        this.model_box = this.get_container(this.preview_width);

        var toolbar = this.get_toolbar("Model (FBX)", "model");
        var url = this.data["model"] ? (this.data["model"]["glb_url"] || this.data["model"]["url"] || "") : "";

        if (url) {
            var viewer = $("<model-viewer src='" + url + "' alt='' camera-controls></model-viewer>");

            viewer.css({
                "width": this.preview_width,
                "height": this.preview_width,
                "border-radius": Dash.Size.Padding * 0.5,
                "position": "absolute",
                "top": 0,
                "left": 0
            });

            this.model_box.append(viewer);
        }

        else {
            this.model_box.append(this.get_image(this.preview_width));
        }

        this.model_box.append(toolbar.html);

        this.model_row.append(this.model_box);
    };

    this.add_asset_bundle_box = function () {
        this.asset_bundle_box = this.get_container(this.preview_width, false);

        if (this.include_unity_preview) {
            if ((this.data["asset_bundle"] || {})["url"]) {
                this.asset_bundle_box.append(
                    this.get_unity_preview_cb ? this.get_unity_preview_cb(this) : this.get_unity_placeholder(
                        "get_unity_preview_cb\nwas not provided"
                    )
                );
            }

            else {
                this.asset_bundle_box.append(this.get_unity_placeholder(
                    this.asset_bundle_na_text.replace(" (", "\n(")
                ));
            }
        }

        else {
            this.asset_bundle_box.append(this.get_unity_placeholder("Unity Previews Disabled"));
        }

        if (!this.asset_bundle_only) {
            var toolbar = this.get_toolbar("Asset Bundle (Unity)");

            this.asset_bundle_box.append(toolbar.html);
        }

        this.model_row.append(this.asset_bundle_box);
    };

    this.get_unity_placeholder = function (text) {
        var line_break = text.includes("\n");
        var placeholder = $("<div>" + text + "</div>");

        var css = {
            "border-radius": Dash.Size.BorderRadius,
            "background": this.color.StrokeDark,
            "width": this.preview_width,
            "height": line_break ? "auto" : this.preview_width,
            "line-height": (line_break ? Dash.Size.RowHeight : this.preview_width) + "px",
            "color": this.color.Background,
            "font-family": "sans_serif_bold",
            "text-align": "center"
        };

        if (line_break) {
            var pad = (this.preview_width - (Dash.Size.RowHeight * 2)) / 2;

            css["white-space"] = "pre";
            css["padding-top"] = pad;
            css["padding-bottom"] = pad;
        }

        placeholder.css(css);

        return placeholder;
    };

    this.download = function (button, config) {
        var data = this.data[config["asset_type"]];

        if (data && config["texture_key"]) {
            data = data[config["texture_key"]];
        }

        var url = data ? (
            data["orig_url"] || data["url"] || ""
        ) : "";

        if (!url) {
            Dash.Log.Warn("No url to download for " + config["asset_type"] + ":", data);

            return;
        }

        button.SetLoading(true);
        button.Disable();

        Dash.Gui.OpenFileURLDownloadDialog(
            url,
            data["orig_filename"] || data["filename"] || "",
            function () {
                button.SetLoading(false);
                button.Enable();
            }
        );
    };

    this.on_upload = function (response, asset_type, texture_key="") {
        if (!Dash.Validate.Response(response) || !response["uploaded_file"]) {
            return;
        }

        var data = response["uploaded_file"];

        var url = asset_type === "model" ? (
            data["glb_url"] || data["url"]
        ) : this.get_thumb_url(asset_type, data, texture_key);

        if (!url) {
            Dash.Log.Warn("No URL for newly uploaded " + asset_type + ":", data);

            return;
        }

        if (texture_key) {
            if (!(asset_type in this.data)) {
                this.data[asset_type] = {};
            }

            this.data[asset_type][texture_key] = data;
        }

        else {
            this.data[asset_type] = data;
        }

        if (asset_type === "model") {
            this.redraw_model_box();
            this.redraw_asset_bundle_box();
        }

        else {
            if (response["updated_glb_url"]) {
                this.data["model"]["glb_url"] = response["updated_glb_url"];

                this.redraw_model_box();
                this.redraw_asset_bundle_box();
            }

            this.images[asset_type][texture_key].css({
                "background-image": "url('" + url + "')"
            });
        }

        if (
                asset_type === "model"
            || (asset_type === "texture" && (texture_key ? texture_key === "albedo" : true))
        ) {
            this.OnGeneratingNewAssetBundle();
        }
    };

    this.redraw_model_box = function () {
        if (this.model_box) {
            this.model_box.remove();
        }

        this.add_model_box();
    };

    this.redraw_asset_bundle_box = function () {
        if (this.asset_bundle_box) {
            this.asset_bundle_box.remove();
        }

        this.add_asset_bundle_box();
    };

    this.get_thumb_url = function (asset_type, data=null, texture_key="") {
        if (!data) {
            data = this.data[asset_type];

            if (!data) {
                return "";
            }

            if (texture_key) {
                data = data[texture_key];
            }

            if (!data) {
                return "";
            }
        }

        return (data["thumb_png_url"] || data["thumb_url"] || data["orig_url"] || data["url"] || "");
    };

    this.get_container = function (width, include_bg=true) {
        var container = $("<div></div>");

        container.css({
            "width": width,
            "margin-right": Dash.Size.Padding
        });

        if (include_bg) {
            container.append(this.get_image(width, "", "", true));
        }

        return container;
    };

    this.get_image = function (width, url="", asset_type="", as_background=false, texture_key="") {
        var image = $("<div></div>");

        var css = {
            "width": width,
            "height": width,
            "border-radius": Dash.Size.Padding * 0.5,
            "pointer-events": "none"
        };

        if (as_background) {
            css["background-image"] = (
                  "url('https://dash.guide/github/dash/client/full/bin/img/checker_bg_"
                + (Dash.Color.IsDark(this.color) ? "dark" : "light") + ".png')"
            );

            css["box-shadow"] = "0px 0px 1px 1px rgba(0, 0, 0, 0.1)";
        }

        else {
            if (url) {
                css["background-image"] = "url('" + url + "')";
            }

            css = {
                ...css,
                "position": "absolute",
                "background-repeat": "no-repeat",
                "background-size": "contain",
                "top": 0,
                "left": 0
            };
        }

        image.css(css);

        if (asset_type) {
            if (!(asset_type in this.images)) {
                this.images[asset_type] = {};
            }

            this.images[asset_type][texture_key] = image;
        }

        return image;
    };

    this.get_toolbar = function (label_text, asset_type="", texture_key="") {
        var toolbar = new Dash.Layout.Toolbar(this, this.color);

        toolbar.html.css({
            "background": this.color.Pinstripe,
            "padding-right": 0,
            "padding-left": Dash.Size.Padding,
            "margin-top": Dash.Size.Padding * 0.5,
            "border-radius": Dash.Size.BorderRadius
        });

        toolbar.DisablePaddingRefactoring();

        var label = toolbar.AddText(label_text, this.color);

        label.label.css({
            "line-height": toolbar.height + "px"
        });

        if (label_text.includes("\n")) {
            label.html.css({
                "height": "100%"
            });

            label.label.css({
                "padding-top": Dash.Size.Padding * 0.1,
                "white-space": "pre",
                "height": "100%",
                "line-height": Dash.Size.RowHeight * 0.7 + "px"
            });
        }

        if (!asset_type) {
            return toolbar;
        }

        var config = {
            "asset_type": asset_type,
            "texture_key": texture_key
        };

        toolbar.AddExpander();

        if (!this.read_only) {
            (function (self) {
                var icon = toolbar.AddIconButton(
                    "upload",
                    function (response) {
                        self.on_upload(response, asset_type, texture_key);
                    },
                    140
                );

                icon.html.css({
                    "margin-right": 0
                });

                icon.SetFileUploader(
                    "VDB",
                    {
                        "f": "upload_3d_pipeline_asset",
                        "vdb_type": self.vdb_type,
                        "obj_id": self.obj_id,
                        ...config
                    }
                );
            })(this);
        }

        var download_icon = toolbar.AddIconButton("download", this.download, 140, config);

        download_icon.html.css({
            "margin-right": 0
        });

        return toolbar;
    };

    this.setup_styles();
}
