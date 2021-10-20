function DashGuiFileExplorerPreviewStrip (binder, color, file_id, get_data_cb, set_data_cb) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Light;
    this.file_id = file_id;
    this.get_data_cb = get_data_cb ? get_data_cb.bind(this.binder) : get_data_cb;
    this.set_data_cb = set_data_cb ? set_data_cb.bind(this.binder) : set_data_cb;

    this.file_url = null;
    this.file_ext = null;
    this.content_preview = null;
    this.html = $("<div></div>");
    this.details_property_box = null;
    this.detail_box = $("<div></div>");
    this.preview_box = $("<div></div>");
    this.height = Dash.Size.RowHeight * 15;
    this.opposite_color = Dash.Color.GetOpposite(this.color);

    this.extensions = {
        "model_viewer": ["gltf", "glb"],

        // Add to these categories as we become aware of more extensions that are being uploaded
        "video":        ["mp4", "mov"],
        "audio":        ["mp3", "wav"],
        "model":        ["fbx", "obj"],
        "drafting":     ["cad"]
    };

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
        if (!Dash.IsValidObject(this.get_data())) {
            return;
        }

        this.preview_box.empty();

        this.content_preview = new Dash.Gui.FileExplorer.ContentPreview(this);

        this.preview_box.append(this.content_preview.html);
    };

    this.ReloadFileDetailsPropertyBox = function () {
        if (!Dash.IsValidObject(this.get_data())) {
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
        var data = this.get_data_cb(this.file_id);

        this.file_url = data["url"] || data["orig_url"] || "";
        this.file_ext = this.file_url.split(".").Last();

        return data;
    };

    this.set_data = function (key, value) {
        this.set_data_cb(key, value, this.file_id);
    };

    this.add_details_property_box = function () {
        var file_data = this.get_data();

        this.details_property_box = new Dash.Gui.PropertyBox(this, this.get_data, this.set_data);

        this.details_property_box.SetTopRightLabel(file_data["id"]);

        var is_image = "aspect" in file_data;

        this.add_header_to_property_box(is_image);
        this.add_primary_inputs(file_data, is_image);

        this.details_property_box.AddExpander();

        this.add_server_data_inputs(file_data);

        this.details_property_box.html.css({
            "position": "absolute",
            "inset": 0,
            "padding-left": this.height,
            "margin": 0,
            "margin-left": Dash.Size.Padding,
            "box-shadow": "none",
            "overflow-y": "auto"
        });
    };

    this.add_header_to_property_box = function (is_image) {
        var header = this.details_property_box.AddHeader("File Details");

        header.ReplaceBorderWithIcon(
            is_image                                             ? "file_image"   :
            this.file_ext === "txt"                              ? "file_lined"   :
            this.file_ext === "pdf"                              ? "file_pdf"     :
            this.file_ext === "csv"                              ? "file_csv"     :
            this.file_ext === "doc" || this.file_ext === "docx"  ? "file_word"    :
            this.extensions["model"].includes(this.file_ext)     ? "cube"         :
            this.extensions["video"].includes(this.file_ext)     ? "file_video"   :
            this.extensions["drafting"].includes(this.file_ext)  ? "pencil_ruler" :
            "file"
        );

        header.icon.AddShadow();
    };

    this.add_primary_inputs = function (file_data, is_image) {
        this.details_property_box.AddInput(is_image ? "orig_filename" : "filename", "Filename", file_data[is_image ? "orig_filename" : "filename"], null, true);
        this.details_property_box.AddInput(is_image ? "orig_url" : "url", "URL", this.file_url, null, false);

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
