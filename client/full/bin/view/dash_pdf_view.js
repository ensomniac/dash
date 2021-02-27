
function DashPDFView(options){

    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});

    console.log();

    options = options || {};
    this.on_uploaded_callback = null;
    this.content_key = options["content_key"] || null;
    this.owner_email_list = options["owner_email_list"] || [];

    if (options["binder"] && options["callback"]) {
        this.on_uploaded_callback = options["callback"].bind(options["binder"]);
    };

    this.upload_button = null;
    this.pages_area = $("<div></div>");

    this.setup_styles = function(){

        if (!this.content_key) {
            console.log("Content key is missing for DashPDFView()");
            return;
        };

        this.upload_button = new d.Gui.Button("Upload PDF", this.upload_pdf, this);
        // this.upload_button.html.css({"margin-bottom": Dash.Size.Padding});

        this.params = {}
        this.params["f"] = "upload";
        this.params["key"] = this.content_key;
        this.params["token"] = d.Local.Get("token");

        this.upload_button.SetFileUploader(
            "https://" + Dash.Context.domain + "/Api",
            this.params
        );

        this.html.append(this.upload_button.html);
        this.html.append(this.pages_area);

    };

    this.upload_pdf = function(response){
        console.log(response);
        console.log("Upload pdf");
        console.log(response);

        if (this.on_uploaded_callback) {
            this.on_uploaded_callback(response);
        };

    };

    this.setup_styles();

};