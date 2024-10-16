function DashGuiFileExplorerPreviewStrip (file_explorer, file_id) {
    this.file_explorer = file_explorer;
    this.file_id = file_id;

    this.html = $("<div></div>");
    this.details_property_box = null;
    this.detail_box = $("<div></div>");
    this.preview_box = $("<div></div>");
    this.color = this.file_explorer.color;
    this.height = Dash.Size.RowHeight * 15;
    this.read_only = this.file_explorer.read_only;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.setup_styles = function () {
        this.html.css({
            "height": this.height
        });

        this.preview_box.css({
            "background": this.opposite_color.BackgroundRaised,
            "position": "absolute",
            "inset": 0,
            "width": this.height,
            "overflow": "auto"
        });

        this.detail_box.css({
            "background": this.color.Background,
            "padding-left": this.height,
            "height": "100%"
        });

        this.ReloadFileContentPreview();
        this.ReloadFileDetailsPropertyBox();

        this.html.append(this.detail_box);
        this.html.append(this.preview_box);
    };

    this.ReloadFileContentPreview = function () {
        if (!Dash.Validate.Object(this.get_data())) {
            return;
        }

        this.preview_box.empty();

        this.preview_box.append(Dash.File.GetPreview(this.color, this.get_data(), this.height));
    };

    this.ReloadFileDetailsPropertyBox = function () {
        if (!Dash.Validate.Object(this.get_data())) {
            return;
        }

        this.detail_box.empty();

        this.add_details_property_box();

        this.detail_box.append(this.details_property_box.html);
    };

    this.ReplacePropertyBoxWithHTML = function (html) {
        this.detail_box.empty();
        this.detail_box.append(html);
    };

    this.get_data = function () {
        return this.file_explorer.get_file_data(this.file_id);
    };

    this.get_file_ext = function (file_url) {
        return file_url.split(".").Last();
    };

    this.set_data = function (key, value) {
        this.file_explorer.set_file_data(key, value, this.file_id);
    };

    this.add_details_property_box = function () {
        var file_data = this.get_data();

        this.details_property_box = new Dash.Gui.PropertyBox(this, this.get_data, this.set_data);

        this.details_property_box.SetTopRightLabel(file_data["id"]);

        var is_image = "aspect" in file_data;

        this.add_header_to_property_box(file_data);

        if (this.read_only) {
            this.add_read_only_inputs(file_data);
        }

        else {
            this.add_primary_inputs(file_data, is_image);
        }

        if (is_image) {
            this.details_property_box.AddTopRightIconButton(
                () => {
                    var print_window = window.open(this.file_explorer.get_file_url(this.get_data()), "_blank");

                    // Wait for the content to load and then trigger the print dialog
                    print_window.onload = () => {
                        print_window.focus();  // Will likely already be in focus, but just in case

                        // Close the window after printing
                        print_window.addEventListener("afterprint", () => {
                            print_window.close();
                        });

                        print_window.print();
                    };
                },
                null,
                null,
                "print"
            ).AddHighlight();

            this.details_property_box.top_right_label.css({
                "right": Dash.Size.ButtonHeight + Dash.Size.Padding
            });
        }

        this.details_property_box.AddExpander();

        if (!this.read_only) {
            this.add_server_data_inputs(file_data);
        }

        this.details_property_box.html.css({
            "position": "absolute",
            "inset": 0,
            "padding-left": this.height,
            "margin": 0,
            "margin-left": Dash.Size.Padding,
            "box-shadow": "none",
            "border": "none",
            "overflow-y": "auto"
        });
    };

    this.add_read_only_inputs = function (file_data) {
        var added = false;

        for (var key in file_data) {
            if (key === "id" || key === "url" || key === "filename" || key === "name") {
                continue;
            }

            this.details_property_box.AddInput(key, key.Title(), file_data[key], null, false);

            added = true;
        }

        if (!added) {
            this.details_property_box.AddText("(No details for this file)", this.color);
        }
    };

    this.add_header_to_property_box = function (file_data) {
        var file_ext = this.get_file_ext(this.file_explorer.get_file_url(file_data));
        var header = this.details_property_box.AddHeader("File Details");

        header.ReplaceBorderWithIcon(Dash.File.GetIconNameByExt(file_ext)).AddShadow();
    };

    this.add_primary_inputs = function (file_data, is_image) {
        this.details_property_box.AddInput(is_image ? "orig_filename" : "filename", "Filename", this.file_explorer.get_filename(file_data), null, true);
        this.details_property_box.AddInput(is_image ? "orig_url" : "url", "URL", this.file_explorer.get_file_url(file_data), null, false);

        if ("thumb_url" in file_data) {
            this.details_property_box.AddInput("thumb_url", "URL (Thumbnail)", file_data["thumb_url"], null, false);
        }

        if ("thumb_sq_url" in file_data) {
            this.details_property_box.AddInput("thumb_sq_url", "URL (Square Thumbnail)", file_data["thumb_sq_url"], null, false);
        }

        if ("glb_url" in file_data) {
            this.details_property_box.AddInput("glb_url", "URL (GLB)", file_data["glb_url"], null, false);
        }
    };

    this.add_server_data_inputs = function (file_data) {
        if ("modified_by" in file_data) {
            var modified_by = this.details_property_box.AddInput("modified_by", "Last Modified By", file_data["modified_by"], null, false);
        }

        if ("modified_on" in file_data) {
            var modified_on = this.details_property_box.AddInput("modified_on", "Last Modified On", file_data["modified_on"], null, false);
        }

        var uploaded_by = this.details_property_box.AddInput("uploaded_by", "Uploaded By", file_data["uploaded_by"], null, false);
        var uploaded_on = this.details_property_box.AddInput("uploaded_on", "Uploaded On", file_data["uploaded_on"], null, false);

        [modified_by, modified_on, uploaded_by, uploaded_on].forEach(function (input) {
            if (input) {
                input.html.css({
                    "opacity": 0.5
                });
            }
        });
    };

    this.setup_styles();
}
