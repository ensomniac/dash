function DashPDFView (options) {

    this.html = Dash.Gui.GetHTMLContext("", {"margin": Dash.Size.Padding});

    options = options || {};
    this.on_uploaded_callback = null;
    this.content_key = options["content_key"] || null;
    this.owner_email_list = options["owner_email_list"] || [];
    this.content_width = -1;
    this.images = [];
    this.images_initialized = false;

    if (options["binder"] && options["callback"]) {
        this.on_uploaded_callback = options["callback"].bind(options["binder"]);
    }

    this.upload_button = null;
    this.pages_area = $("<div></div>");
    this.data = null;

    this.setup_styles = function () {
        if (!this.content_key) {
            console.error("Content key is missing for DashPDFView");

            return;
        }

        this.upload_button = new Dash.Gui.Button("Upload PDF", this.upload_pdf, this);
        this.upload_button.html.css({"margin-bottom": Dash.Size.Padding});

        this.params = {};
        this.params["f"] = "upload_pdf";
        this.params["content_key"] = this.content_key;

        this.upload_button.SetFileUploader(
            "Api",
            this.params
        );

        this.html.append(this.upload_button.html);
        this.html.append(this.pages_area);

        (function (self) {
            setInterval(function () {
                self.check_width();
            }, 100);
        })(this);
    };

    this.check_width = function () {

        if (this.pages_area.width() != this.content_width) {
            this.content_width = this.pages_area.width();
            this.update_sizes();
        }

    };

    this.upload_pdf = function (response) {
        if (response.originalEvent) {
            // TODO: Prevent this from being called inside of dash_gui_button_uploader.js
            return;
        }

        Dash.Log.Log("Uploading pdf...");

        if (this.on_uploaded_callback) {
            this.on_uploaded_callback(response);
        }

        this.on_data(response);
    };

    this.update_sizes = function () {
        if (!this.images) {
            return;
        }

        // A small timeout that lets the stack
        // of images fade in one by one
        var init_delay = 0;

        // The number of ms between
        // each image's reveal
        var init_step = 100;

        // The number of ms it takes to
        // fade in each image
        var fade_in_duration = 100;

        for (var i in this.images) {

            this.images[i].css({
                "width": this.content_width,
            });

            if (!this.images_initialized) {

                if (init_delay > 10) {

                    (function (self, i, init_delay, fade_in_duration) {

                        setTimeout(function () {

                            self.images[i].animate({"opacity": 1}, fade_in_duration);

                        }, init_delay);

                    })(this, i, init_delay, fade_in_duration);

                }
                else {
                    this.images[i].animate({"opacity": 1}, fade_in_duration);
                }

                init_delay += init_step;
            }

        }

        this.images_initialized = true;

    };

    this.on_pdf_page_clicked = function (page_data) {
        Dash.Log.Log(page_data);

        window.open(page_data["url"], '_blank');
    };

    this.on_data = function (response) {
        if (!Dash.Validate.Response(response)) {return;}

        this.data = null;

        if (!response["data"]) {
            this.pages_area.empty();
            this.pages_area.text(response);
            return;
        }

        if (!response["data"]["pages"]) {
            this.pages_area.empty();
            this.pages_area.text("No Pages Converted");
            return;
        }

        this.data = response["data"];
        this.content_width = this.pages_area.width();
        this.images = [];
        this.images_initialized = false;

        for (var i in this.data["pages"]) {
            var page_data = this.data["pages"][i];
            var image = $("<img src='" + page_data["url"] + "' alt=''>");

            image.css({
                "width": this.content_width-(Dash.Size.Padding * 2),
                "margin-bottom": Dash.Size.Padding,
                "border-radius": Dash.Size.Padding * 0.5,
                "box-shadow": "0px 0px 10px 0px rgba(0, 0, 0, 0.2)",
                "opacity": 0.01,
                "cursor": "pointer",
            });

            this.pages_area.append(image);
            this.images.push(image);

            (function (self, image, page_data) {
                image.on("click", function () {
                    self.on_pdf_page_clicked(page_data);
                });
            })(this, image, page_data);

        }

        (function (self) {
            setTimeout(function () {
                if (!self.images_initialized) {
                    self.update_sizes();
                }
            }, 300);
        })(this);

    };

    this.setup_styles();
    Dash.Request(this, this.on_data, "Api", {"f": "get_pdf", "content_key": this.content_key});

}
