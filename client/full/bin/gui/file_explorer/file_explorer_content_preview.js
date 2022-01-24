function DashGuiFileExplorerContentPreview (preview_strip) {
    this.preview_strip = preview_strip;

    this.html = null;
    this.color = this.preview_strip.color;
    this.height = this.preview_strip.height;
    this.file_data = this.preview_strip.get_data();
    this.extensions = this.preview_strip.extensions;
    this.file_explorer = this.preview_strip.file_explorer;
    this.opposite_color = this.preview_strip.opposite_color;
    this.file_url = this.file_explorer.get_file_url(this.file_data);
    this.file_ext = this.preview_strip.get_file_ext(this.file_url) || this.file_url.split(".").Last();

    this.abs_center_css = {
        "position": "absolute",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)"
    };

    this.setup_styles = function () {
        var height = "100%";
        var width = this.height;

        if (this.file_ext === "pdf") {
            this.set_pdf_preview();
        }

        else if (this.file_ext === "txt") {
            this.set_plain_text_preview();

            width = "77%";
        }

        else if (this.extensions["image"].includes(this.file_ext) || "aspect" in this.file_data) {
            this.set_image_preview();
        }

        else if (this.extensions["model_viewer"].includes(this.file_ext)) {
            this.set_model_preview();
        }

        else if (this.extensions["model"].includes(this.file_ext) && "glb_url" in this.file_data) {
            this.set_model_preview();
        }

        else if (this.extensions["video"].includes(this.file_ext)) {
            this.set_video_preview();

            height = null;
        }

        else if (this.extensions["audio"].includes(this.file_ext)) {
            this.set_audio_preview();

            width = this.height - (Dash.Size.Padding * 2);
            height = null;
        }

        else if (this.file_ext === "csv") {
            this.set_csv_preview();
        }

        else if (this.file_ext === "doc" || this.file_ext === "docx") {
            this.set_word_doc_preview();
        }

        // Final formatting
        if (this.html) {
            this.set_preview_size(width, height);
        }

        else {
            this.set_default_preview();
        }
    };

    this.set_pdf_preview = function () {
        this.html = $("<iframe src='" + this.file_url + "'></iframe>");
    };

    this.set_plain_text_preview = function () {
        this.html = $("<div></div>");

        this.html.css({
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "overflow": "auto",
            "transform": "translate(-50%, -50%)",
            "background": Dash.Color.Light.Background  // This is deliberate
        });

        this.html.append($("<iframe src='" + this.file_url + "'></iframe>"));
    };

    this.set_image_preview = function () {
        this.html = $("<div></div>");

        this.html.css({
            "background-image": "url(" + this.file_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center center"
        });
    };

    this.set_model_preview = function () {
        // As we become aware of more model file types that are commonly uploaded, we need to write
        // ways in the back-end to convert them to GLB format - FBX is the only one supported for now

        this.html = $("<model-viewer src='" + this.file_data["glb_url"] + "' alt='' camera-controls></model-viewer>");
    };

    this.set_video_preview = function () {
        this.html = $("<video src='" + this.file_url + "' controls></video>");

        this.html.css(this.abs_center_css);
    };

    this.set_audio_preview = function () {
        this.html = $("<audio src='" + this.file_url + "' controls></audio>");

        this.html.css(this.abs_center_css);
    };

    this.set_csv_preview = function () {
        this.html = $("<div></div>");

        this.html.css({
            "padding": Dash.Size.Padding
        });

        (function (self) {
            $.get(
                self.file_url,
                function (data) {
                    var html = "<table>";
                    var rows = data.split("\n");

                    // This row-by-row display is fairly quick/rough, should be improved once it's more important
                    rows.forEach(function (row) {
                        html += "<tr>";

                        var columns = row.split(",");

                        html += "<td>" + columns[0] + "</td>";
                        html += "<td>" + columns[1] + "</td>";
                        html += "<td>" + columns[2] + "</td>";
                        html += "</tr>";
                    });

                    html += "</table>";

                    self.html.append(html);
                }
            );
        })(this);
    };

    this.set_word_doc_preview = function () {
        this.html = $("<iframe src='https://view.officeapps.live.com/op/embed.aspx?src=" + this.file_url + "' ></iframe>");
    };

    this.set_default_preview = function () {
        this.html = $("<div></div>");

        this.html.text(this.file_data["filename"] || this.file_data["orig_filename"] || "File Preview");

        this.html.css({
            ...this.abs_center_css,
            "font-family": "sans_serif_bold",
            "color": this.opposite_color.Text,
        });
    };

    this.set_preview_size = function (width, height=null) {
        this.html.css({
            "width": width
        });

        if (height) {
            this.html.css({
                "height": height
            });
        }
    };

    this.setup_styles();
}
