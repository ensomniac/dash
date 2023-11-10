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
        "presentation": [
            "ppt",
            "pptx"
        ],
        "document": [
            "doc",
            "docx"
        ],
        "spreadsheet": [
            "csv",
            "xls",
            "xlsx"
        ],
        "drafting": [
            "cad",
            "pdg",
            "dxf",
            "dwg",
            "job",
            "3d"
        ],
        "code": [
            "json",
            "py",
            "js",
            "cs",
            "html"
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

                console.warn("Inline file download using Dash.File.URLToBlob() failed. The URL will be opened in a new tab instead:\n" + url);

                window.open(url, "_blank");
            }
        );
    };

    this.GetPreview = function (color, file_data, height, allow_100_percent_size=true, default_to_placeholder=true) {
        var preview = null;
        var file_url = file_data["url"] || file_data["orig_url"] || "";
        var filename = file_data["filename"] || file_data["orig_filename"];

        if (file_url) {
            var file_ext = file_url.split(".").Last();

            if (file_ext === "txt") {
                preview = this.GetPlainTextPreview(file_url);
            }

            else if (this.Extensions["video"].includes(file_ext)) {
                preview = this.GetVideoPreview(file_url, height);
            }

            else if (this.Extensions["audio"].includes(file_ext)) {
                preview = this.GetAudioPreview(file_url, height);
            }

            else if (file_ext === "pdf") {
                preview = this.GetPDFPreview(file_url, height);
            }

            else if (this.Extensions["image"].includes(file_ext) || "aspect" in file_data) {
                preview = this.GetImagePreview(file_url, height);
            }

            else if (this.Extensions["model_viewer"].includes(file_ext)) {
                preview = this.GetModelPreview(file_data["glb_url"], height);
            }

            else if (this.Extensions["model"].includes(file_ext) && "glb_url" in file_data) {
                preview = this.GetModelPreview(file_data["glb_url"], height);
            }

            else if (file_ext === "csv") {
                preview = this.GetCSVPreview(color, file_url, height);
            }

            else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "one"].includes(file_ext)) {
                preview = this.GetMicrosoftPreview(file_url, height);
            }
        }

        if (!preview) {
            if (!default_to_placeholder) {
                return preview;
            }

            preview = this.GetPlaceholderPreview(color, filename);
        }

        if (!allow_100_percent_size) {
            var h = preview.css("height");
            var w = preview.css("width");

            if (h === "100%" && w && w !== "100%") {
                preview.css({
                    "height": parseInt(w)
                });
            }

            if (w === "100%" && h && h !== "100%") {
                preview.css({
                    "width": parseInt(h)
                });
            }
        }

        return preview;
    };

    this.set_preview_size = function (html, width=null, height=null) {
        var css = {};

        if (width) {
            css["width"] = width;
        }

        if (height) {
            css["height"] = height;
        }

        html.css(css);

        return html;
    };

    this.GetPDFPreview = function (url, height) {
        if (Dash.IsMobile && !Dash.IsMobileiOS) {
            // iOS can render PDFs in iframes just fine, but Android
            // can't, so load the URL in Google's PDF viewer instead
            url = ("https://docs.google.com/gview?url=" + url + "&embedded=true");
        }

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
        if (Dash.IsMobile) {
            return null;  // Model viewer isn't optimal for mobile and doesn't appear to be supported
        }

        // As we become aware of more model file types that are commonly uploaded, we need to write
        // ways in the back-end to convert them to GLB format - FBX is the only one supported for now

        return this.set_preview_size(
            $("<model-viewer src='" + glb_url + "' alt='' camera-controls></model-viewer>"),
            height,
            "100%"
        );
    };

    this.GetVideoPreview = function (url, height, center_in_parent=true, square=false, controls=true) {
        var html = $("<video src='" + url + "' crossorigin='anonymous'></video>");

        if (center_in_parent) {
            html.css(this.abs_center_css);
        }

        this.check_if_video_exists_in_dom(html, height, square, controls);

        return html;
    };

    this.GetAudioPreview = function (url, height, center_in_parent=true) {
        var html = $("<audio src='" + url + "' crossorigin='anonymous' controls></audio>");

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

        (function () {
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
        })();

        return this.set_preview_size(html, height, "100%");
    };

    // Basic version
    this.GetImagePreview = function (url, height, width=null) {
        var html = $("<div></div>");

        var css = {
            "background-image": url ? "url(" + url + ")" : "",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center center"
        };

        if (!url) {
            css["background-color"] = Dash.Color.Light.StrokeDark;
        }

        html.css(css);

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

    this.GetIconNameByExt = function (file_ext) {
        return (
            file_ext === "txt"                                 ? "file_lined"       :
            file_ext === "pdf"                                 ? "file_pdf"         :
            this.Extensions["code"].includes(file_ext)         ? "file_code"        :
            this.Extensions["spreadsheet"].includes(file_ext)  ? "file_spreadsheet" :
            this.Extensions["document"].includes(file_ext)     ? "file_word"        :
            this.Extensions["presentation"].includes(file_ext) ? "file_powerpoint"  :
            this.Extensions["image"].includes(file_ext)        ? "file_image"       :
            this.Extensions["model"].includes(file_ext)        ? "cube"             :
            this.Extensions["model_viewer"].includes(file_ext) ? "cube"             :
            this.Extensions["video"].includes(file_ext)        ? "file_video"       :
            this.Extensions["audio"].includes(file_ext)        ? "file_audio"       :
            this.Extensions["drafting"].includes(file_ext)     ? "pencil_ruler"     :
            "file"
        );
    };

    // Doing this on instantiation of the video tag can sometimes cause a conflict between the
    // drawing of the controls vs the drawing of the video tag in the DOM, which can lead to the
    // controls not being scaled properly to match the video tag element. Waiting until the
    // video tag exists in the DOM solves that problem. If the source (URL) is updated
    // while the video is not in view, this problem may reappear. This isn't perfect.
    this.check_if_video_exists_in_dom = function (html, height, square=false, controls=true) {
        (function (self) {
            setTimeout(
                function () {
                    if (!($.contains(document, html[0]))) {
                        self.check_if_video_exists_in_dom(html, height, square, controls);

                        return;
                    }

                    self.set_preview_size(html, square ? height : null, height);

                    if (controls) {
                        html.attr("controls", true);
                    }
                },
                100
            );
        })(this);
    };
}
