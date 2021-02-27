
function DashPDFView(options){

    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});

    options = options || {};
    this.content_key = options["content_key"] || null;
    this.owner_email_list = options["owner_email_list"] || [];

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
            "https://" + Dash.Context.domain + "/Artist",
            this.params
        );

        this.html.append(this.upload_button.html);
        this.html.append(this.pages_area);

    };

    this.upload_pdf = function(){
        console.log("Upload pdf");
    };

    this.setup_styles();

};