function DashFile () {
    // These have not all been tested for the ability to display a preview
    this.Extensions = {
        "image": [
            "gif",
            "jpeg",
            "jpg",
            "png",
            "svg",
            "webp"
        ],
        "model_viewer": [
            "gltf",
            "glb"
        ],

        // Add to these categories as we become aware of more extensions that are commonly being uploaded
        "video": [
            "mp4",
            "mov"
        ],
        "audio": [
            "mp3",
            "wav"
        ],
        "model": [
            "fbx",
            "obj"
        ],
        "drafting": [
            "cad",
            "pdg",
            "3d"
        ]
    };

    this.abs_center_css = {
        "position": "absolute",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)"
    };

    this.URLToBlob = function (url, callback, error_callback=null) {
        fetch(
            url
        ).then(
            resp => resp.blob()
        ).then(
            blob => callback(blob)
        ).catch(
            () => {
                if (error_callback) {
                    error_callback();
                }

                console.error("File download using Dash.File.URLToBlob() failed. The URL will now be opened in a new tab:\n" + url);

                window.open(url, "_blank");
            }
        );
    };

    this.GetPreview = function (color, file_data, height) {
        var file_url = file_data["url"] || file_data["orig_url"] || "";
        var filename = file_data["filename"] || file_data["orig_filename"];

        if (!file_url) {
            return this.GetPlaceholderPreview(color, filename);
        }

        var file_ext = file_url.split(".").Last();

        if (file_ext === "txt") {
            return this.GetPlainTextPreview(file_url);
        }

        if (this.Extensions["video"].includes(file_ext)) {
            return this.GetVideoPreview(file_url, height);
        }

        if (this.Extensions["audio"].includes(file_ext)) {
            return this.GetAudioPreview(file_url, height);
        }

        if (file_ext === "pdf") {
            return this.GetPDFPreview(file_url, height);
        }

        if (this.Extensions["image"].includes(file_ext) || "aspect" in file_data) {
            return this.GetImagePreview(file_url, height);
        }

        if (this.Extensions["model_viewer"].includes(file_ext)) {
            return this.GetModelPreview(file_data["glb_url"], height);
        }

        if (this.Extensions["model"].includes(file_ext) && "glb_url" in file_data) {
            return this.GetModelPreview(file_data["glb_url"], height);
        }

        if (file_ext === "csv") {
            return this.GetCSVPreview(color, file_url, height);
        }

        if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "one"].includes(file_ext)) {
            return this.GetMicrosoftPreview(file_url, height);
        }

        return this.GetPlaceholderPreview(color, filename);
    };

    // Dash.Size.RowHeight * 15

    this.set_preview_size = function (html, width, height=null) {
        var css = {"width": width};

        if (height) {
            css["height"] = height;
        }

        html.css(css);

        return html;
    };

    this.GetPDFPreview = function (url, height) {
        return this.set_preview_size(
            $("<iframe src='" + url + "'></iframe>"),
            height,
            "100%"
        );
    };

    this.GetPlainTextPreview = function (url, formatted=true) {
        var preview = $("<iframe src='" + url + "'></iframe>");

        if (!formatted) {
            return preview;
        }

        var html = $("<div></div>");

        html.css({
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "overflow": "auto",
            "transform": "translate(-50%, -50%)",
            "background": Dash.Color.Light.Background  // This is deliberate
        });

        html.append(preview);

        return this.set_preview_size(html, "77%", "100%");
    };

    this.GetModelPreview = function (glb_url, height) {
        // As we become aware of more model file types that are commonly uploaded, we need to write
        // ways in the back-end to convert them to GLB format - FBX is the only one supported for now

        return this.set_preview_size(
            $("<model-viewer src='" + glb_url + "' alt='' camera-controls></model-viewer>"),
            height,
            "100%"
        );
    };

    this.GetVideoPreview = function (url, height, center_in_parent=true, square=false) {
        var html = $("<video src='" + url + "' controls></video>");

        if (center_in_parent) {
            html.css(this.abs_center_css);
        }

        return this.set_preview_size(html, height, square ? height : null);
    };

    this.GetAudioPreview = function (url, height, center_in_parent=true) {
        var html = $("<audio src='" + url + "' controls></audio>");

        if (center_in_parent) {
            html.css(this.abs_center_css);
        }

        return this.set_preview_size(html, height - (Dash.Size.Padding * 2), null);
    };

    this.GetMicrosoftPreview = function (url, height) {
        return this.set_preview_size(
            $("<iframe src='https://view.officeapps.live.com/op/embed.aspx?src=" + url + "' ></iframe>"),
            height,
            "100%"
        );
    };

    this.GetCSVPreview = function (color, url, height) {
        var html = $("<div></div>");

        html.css({
            "padding": Dash.Size.Padding,
            "background": color.Background,
            "color": color.Text
        });

        (function (self) {
            $.get(
                url,
                function (data) {
                    var table = "<table>";
                    var rows = data.split("\n");

                    // This row-by-row display is fairly quick/rough, should be improved once it's more important
                    rows.forEach(function (row) {
                        table += "<tr>";

                        var columns = row.split(",");

                        table += "<td>" + columns[0] + "</td>";
                        table += "<td>" + columns[1] + "</td>";
                        table += "<td>" + columns[2] + "</td>";
                        table += "</tr>";
                    });

                    table += "</table>";

                    html.append(table);
                }
            );
        })(this);

        return this.set_preview_size(html, height, "100%");
    };

    // Basic version
    this.GetImagePreview = function (url, height, width=null) {
        var html = $("<div></div>");

        html.css({
            "background-image": url ? "url(" + url + ")" : "",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center center"
        });

        return this.set_preview_size(html, width ? width : height, width ? height : "100%");
    };

    this.GetPlaceholderPreview = function (color, filename="File Preview") {
        var html = $("<div></div>");

        html.text(filename);

        html.css({
            ...this.abs_center_css,
            "font-family": "sans_serif_bold",
            "color": Dash.Color.GetOpposite(color).Text,
        });

        return html;
    };
}
