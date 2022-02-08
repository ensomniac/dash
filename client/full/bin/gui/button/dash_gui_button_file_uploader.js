function DashGuiButtonFileUploader(GuiButton, api, params, callback, on_start_callback) {

    this.button = GuiButton;
    this.api = api;
    this.params = params;
    this.filename = "unknown";
    this.type = this.button.file_upload_type;
    this.callback = callback;
    this.file_id = null;
    this.save_folder = "files";
    this.dropzone_visible = false;
    this.on_start_callback = on_start_callback.bind(GuiButton);
    this.dropzone_label_text = "Drop " + this.type.charAt(0).toUpperCase() + this.type.slice(1);

    this.html = $("<div></div>");
    this.dropzone_box = $("<div></div>");
    this.dropzone_label = $("<div>" + this.dropzone_label_text + "</div>");
    this.upload_backing_bar = $("<div></div>");
    this.upload_progress_bar = $("<div></div>");

    this.html.append(this.dropzone_box);
    this.dropzone_box.append(this.dropzone_label);
    this.html.append(this.upload_backing_bar);
    this.html.append(this.upload_progress_bar);
    this.dropzone_box.hide();

    this.SetCallback = function (callback, bind_to) {

        if (!bind_to) {
            // console.warn("Warning: This SetCallback() callback should be passed a bind_to object");
            this.callback = callback;
        }
        else {
            this.callback = callback.bind(bind_to);
        }
    };

    this.SetDropzone = function (dropzone_visible) {
        this.dropzone_visible = dropzone_visible;
        this.draw();
    };

    this.SetDropzoneLabel = function (label) {
        this.dropzone_label_text = label;
        this.dropzone_label.text(this.dropzone_label_text);
    };

    this.setup_styles = function () {


        this.html.css({
            // "background": "rgba(0, 0, 0, 0)",
            // "text-align": "center",
        });

        this.dropzone_box.css({
        });

    };

    this.draw = function () {

        this.width = this.button.width;
        this.height = Dash.Size.ButtonHeight;
        var border_width = 2;
        var margin_top = "";
        var dropzone_box_width = this.width - (border_width*2);
        var dropzone_box_height = Dash.Size.ButtonHeight;

        if (this.dropzone_visible) {
            this.dropzone_box.show();
            margin_top = Dash.Size.ButtonHeight;

        }

        this.upload_bar_css = {};
        this.upload_bar_css["height"] = 5;
        this.upload_bar_css["width"] = this.width;
        this.upload_bar_css["position"] = "absolute";
        this.upload_bar_css["bottom"] = 0;
        this.upload_bar_css["left"] = 0;
        this.upload_bar_css["background"] = "rgba(255, 255, 255, 0)";

        this.html.css({
            "padding": 0,
            "height": this.height,
            "width": this.width,
            "margin-top": margin_top,
            "position": "absolute",
            "inset": 0,
        });

        this.dropzone_box.css({
            "background": "red",
            "width": dropzone_box_width,
            "height": dropzone_box_height,
            "bottom": margin_top,
            "border": border_width + "px dashed rgba(0, 0, 0, 0.5)",
        });

        this.dropzone_label.css({
            "color": "rgba(0, 0, 0, 0.5)",
            "height": Dash.Size.ButtonHeight,
            "width": dropzone_box_width,
            "text-align": "center",
            "top": (dropzone_box_height * 0.5)-(Dash.Size.ButtonHeight * 0.5),
        });

        this.upload_backing_bar.css(this.upload_bar_css);
        this.upload_progress_bar.css(this.upload_bar_css);
        this.upload_progress_bar.css({"background": "rgba(255, 255, 255, 0.8)", "width": 0});

    };

    this.added_file = function (file, dz) {
        this.html.hide();
    };

    this.error_uploading = function (file, error) {
        console.error("Error uploading", error);

        alert(error["error"] || error);
    };

    this.processing_upload = function (file) {
        this.on_start_callback();
    };

    this.upload_progress = function (file, progress) {
        var progress_t = parseInt(progress) * 0.01;
        this.button.SetLoadBar(progress_t);
        this.upload_backing_bar.css({"background": "rgba(255, 255, 255, 0.2)", "opacity": 1});
        this.upload_progress_bar.css({"width": this.width*progress_t, "opacity": 1});
    };

    this.upload_success = function (file, result) {
        this.button.SetLoadBar(0);

        this.upload_backing_bar.animate({"opacity": 0});
        this.upload_progress_bar.animate({"opacity": 0});

        this.callback(result);
    };

    this.draw_dropzone = function () {
        (function (self) {
            self.dropzone_options = {
                "init": function () {
                    this.on("addedfile", function (file) {self.added_file(file);});
                    this.on("error", function (file, error) {self.error_uploading(file, error);});
                    this.on("processing", function (file) {self.processing_upload(file);});
                    this.on("uploadprogress", function (file, progress) {self.upload_progress(file, progress);});
                    this.on("success", function (file, result) {self.upload_success(file, result);});
                },
                "url": self.api,
                "uploadMultiple": false,
                "addRemoveLinks": false,
                "createImageThumbnails": false,
                //"params": {"cid": "CID", "t": "TOKEN", "type": self.type, "file_id": self.file_id, "save_folder": self.save_folder}
                "params": self.params
            };

            self.html.dropzone(self.dropzone_options);

        })(this);
    };


    this.setup_styles();
    this.draw();
    this.draw_dropzone();
}
