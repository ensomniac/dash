class DashGuiFile {
    constructor (
        entry, type, key, label_text="", preview_size=0,
        include_upload_button=true, include_download_button=true, color=null
    ) {
        this.entry = entry;  // Parent/binder
        this.type = type;
        this.key = key;
        this.label_text = label_text || key.Title();
        this.preview_size = preview_size || (Dash.Size.ColumnWidth * 2);
        this.include_upload_button = include_upload_button;
        this.include_download_button = include_download_button;
        this.color = color || this.entry.color;

        this.preview = null;
        this.toolbar = null;
        this.preview_bg = null;
        this.upload_button = null;
        this.download_button = null;
        this.html = $("<div></div>");
        this.preview_width = this.preview_size;
        this.preview_height = this.preview_size;

        // Override these upload attrs for use cases that don't follow the standardized VDB.upload_file convention
        this.upload_api = this.entry.api || this.entry.list_view?.api;

        this.upload_params = {
            "f": "upload_file",
            "key": this.key,  // File name/asset-path, ex: cover_art, profile_9x16, banner
            "type": this.type,  // Ex: video, image, audio
            "obj_id": this.entry.obj_id,
            "vdb_type": this.entry.vdb_type  // Override/remove/repurpose this for non-VDB uses
        };

        this._setup_styles();
    }

    _setup_styles () {
        if ((this.type === "image" || this.type === "video") && !this.parse_aspect()) {
            return;
        }

        this.html.css({
            "background": this.color.BackgroundRaised,
            "border": "1px solid " + this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius,
            "padding": Dash.Size.Padding,
            "width": this.preview_width <= this.preview_height ? this.preview_size : this.preview_width
        });

        this.add_preview_bg();

        try {
            this.get_data();  // If this succeeds, proceed
            this.add_preview();
            this.add_toolbar();
        }

        catch {  // If not, get_data is likely being overridden and we need to wait a moment for the override
            setTimeout(
                () => {
                    this.add_preview();
                    this.add_toolbar();
                },
                100
            );
        }
    }

    // Override this for use cases that don't follow the standardized "files" structure
    get_data () {
        return this.entry.get_data()["files"]?.[this.type]?.[this.key] || {};
    }

    // Override this for use cases that don't follow the standardized "files" structure
    on_update (file_data=null) {
        if (!file_data) {
            return;
        }

        if (!this.entry.full_data) {
            this.entry.full_data = {"files": {}};
        }

        if (!(this.type in this.entry.full_data["files"])) {
            this.entry.full_data["files"][this.type] = {};
        }

        this.entry.full_data["files"][this.type][this.key] = file_data;
    }

    Update (file_data=null) {
        this.on_update(file_data);

        var url = this.get_url();

        if (this.type === "image") {
            this.preview.css({
                "background-image": url ? ("url(" + url + ")") : "",
                "background-color": url ? "" : this.color.Pinstripe
            });
        }

        else {
            this.preview.attr("src", url);
        }
    }

    parse_aspect () {
        var aspect = this.key.split("_").Last();

        if (!aspect || aspect.Count("x") !== 1) {
            console.error(
                "Error: For type '" + this.type + "', the key must end with an aspect ratio, such as '_9x16'"
            );

            return false;
        }

        var [aspect_w, aspect_h] = aspect.split("x");

        if (!aspect_w.IsDigit() || !aspect_h.IsDigit()) {
            console.error(
                "Error: For type '" + this.type + "', the key must end with an aspect ratio, such as '_9x16'"
            );

            return false;
        }

        aspect_w = parseInt(aspect_w);
        aspect_h = parseInt(aspect_h);

        if (aspect_w !== aspect_h) {
            if (aspect_w > aspect_h) {
                this.preview_height = this.preview_size;
                this.preview_width = (this.preview_size / aspect_h) * aspect_w;
            }

            else {
                this.preview_width = this.preview_size;
                this.preview_height = (this.preview_size / aspect_w) * aspect_h;
            }
        }

        return true;
    }

    get_url () {
        var data = this.get_data();

        return data["url"] || data["orig_url"] || "";
    }

    add_toolbar () {
        this.toolbar = new Dash.Layout.Toolbar(this);

        this.toolbar.RemoveStrokeSep();
        this.toolbar.DisablePaddingRefactoring();

        var top_margin = Dash.Size.Padding * (this.type === "audio" || this.type === "video" ? 0.6 : 1);

        this.toolbar.html.css({
            "background": this.color.Pinstripe,
            "border-radius": Dash.Size.BorderRadius,
            "margin-top": top_margin
        });

        this.toolbar.AddLabel(this.label_text, false, null, false, true);

        if (this.include_upload_button || this.include_download_button) {
            this.toolbar.AddExpander();

            if (this.include_upload_button) {
                this.upload_button = this.add_icon_button_to_toolbar(
                    "upload",
                    this.upload
                );

                this.upload_button.SetFileUploader(
                    this.upload_api,
                    this.upload_params
                );
            }

            if (this.include_download_button) {
                this.download_button = this.add_icon_button_to_toolbar("download", this.download);
            }
        }

        if (this.preview_width > this.preview_height) {
            this.html.css({
                "height": this.preview_size + top_margin + this.toolbar.height
            });
        }

        this.html.append(this.toolbar.html);
    }

    upload (file_data) {
        if (!Dash.Validate.Response(file_data)) {
            return;
        }

        this.Update(file_data);
    }

    download (button) {
        var url = this.get_url();

        if (!url) {
            alert("Missing URL");

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

    add_icon_button_to_toolbar (icon_name, callback) {
        callback = callback.bind(this);

        var icon_button = this.toolbar.AddIconButton(
            icon_name,
            (response) => {
                callback(response);
            },
            140,
            null,
            this.toolbar.height,
            1.0,
            icon_name.includes("upload")
        );

        icon_button.html.css({
            "margin-top": 0,
            "margin-right": 0
        });

        icon_button.AddHighlight(true);

        return icon_button;
    }

    add_preview () {
        if (this.type === "image") {
            this.preview = Dash.File.GetImagePreview(
                this.get_url(),
                this.preview_height,
                this.preview_width,
                this.color.Pinstripe
            );
        }

        else if (this.type === "video") {
            this.preview = Dash.File.GetVideoPreview(
                this.get_url(),
                this.preview_height,
                false,
                false,
                true,
                this.preview_width
            );
        }

        else {
            this.preview = Dash.File.GetPreview(
                this.color,
                this.get_data(),
                this.preview_height,
                false,
                false,
                false,
                Dash.File.Extensions[this.type][0],
                this.preview_width
            );
        }

        if (this.type === "audio") {
            this.preview.css({
                "width": parseInt(this.preview.css("width")) + (Dash.Size.Padding * 2),
                "border-radius": Dash.Size.BorderRadius * 10,
                "border": "1px solid " + this.color.StrokeLight
            });
        }

        else {
            this.preview.css({
                "border-radius": Dash.Size.BorderRadius
            });
        }

        this.html.append(this.preview);

        if (this.preview_bg) {
            setTimeout(
                () => {
                    this.preview_bg.css({
                        "width": this.preview.width(),
                        "height": this.preview.height()
                    });
                },
                50
            );
        }
    }

    add_preview_bg () {
        if (this.type !== "image") {
            return;
        }

        this.preview_bg = Dash.File.GetImagePreview(
            (
                  "https://dash.guide/github/dash/client/full/bin/img/checker_bg_"
                + (Dash.Color.IsDark(this.color) ? "light" : "dark") + ".png"
            ),
            this.preview_size,
            this.preview_size
        );

        this.preview_bg.css({
            "position": "absolute",
            "top": Dash.Size.Padding,
            "left": Dash.Size.Padding,
            "background-size": "",
            "background-repeat": "",
            "border-radius": Dash.Size.BorderRadius
        });

        this.html.append(this.preview_bg);
    }
}
