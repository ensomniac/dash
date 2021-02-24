
function DashGuiLogin(on_login_binder, on_login_callback){

    this.html = $("<div></div>");
    this.login_box = $("<div></div>");
    this.header_label = $("<div>" + d.Context["display_name"] + "</div>");
    this.email_row = $("<div></div>");
    this.password_row = $("<div></div>");
    this.button_bar = $("<div></div>");

    this.on_login_callback = null;
    if (on_login_binder && on_login_callback){
        this.on_login_callback = on_login_callback.bind(on_login_binder);
    };

    this.setup_styles = function(){

        this.login_button   = new d.Gui.Button("Login", this.Login, this);
        this.reset_button   = new d.Gui.Button("Create / Reset Login", this.ResetLogin, this);
        this.email_input    = new d.Gui.Input("email@" + d.Context["domain"]);
        this.password_input = new d.Gui.Input("Password");

        this.email_input.OnSubmit(this.Submit, this);
        this.password_input.OnSubmit(this.Submit, this);

        this.email_input.OnChange(this.store_input, this);
        this.password_input.OnChange(this.store_input, this);

        this.email_row.append(this.email_input.html);
        this.password_row.append(this.password_input.html);

        this.html.append(this.login_box);

        this.login_box.append(this.header_label);
        this.login_box.append(this.email_row);
        this.login_box.append(this.password_row);
        this.login_box.append(this.button_bar);
        this.button_bar.append(this.reset_button.html);
        this.button_bar.append(this.login_button.html);

        var login_box_width = window.outerWidth*0.5;
        if (!d.IsMobile && login_box_width > 350) {
            login_box_width = 350;
        };

        var login_box_height = (d.Size.RowHeight*4)+(d.Size.Padding*3);

        this.html.css({
            // "position": "fixed",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            // "background": d.Color.Background,
            "text-align": "center",
        });

        this.login_box.css({
            "width": login_box_width,
            // "height": login_box_height*2,
            "height": "auto",
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-top": d.Size.Padding*2,
            "padding-bottom": d.Size.Padding*2,
            "background": d.Color.Dark,
            // "background": "rgba(0, 0, 0, 0.1)",
            "border-radius": 4,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "opacity": 0,
        });

        this.header_label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "height": d.Size.RowHeight,
            "line-height": d.Size.RowHeight + "px",
        });

        this.button_bar.css({
            "display": "flex",
            "height": d.Size.RowHeight,
        });

        this.email_row.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
        });

        this.password_row.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
        });

        this.login_button.html.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
            "padding": d.Size.Padding*0.5,
            "width": login_box_width*0.5,
            "background": d.Color.Primary,
        });

        this.reset_button.html.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
            "margin-right": 0,
            "padding": d.Size.Padding*0.5,
            "width": login_box_width*0.5,
        });

        this.email_input.SetText(d.Local.Get("email") || "");
        this.show_login_box();

    };

    this.show_login_box = function(){
        this.login_box.css({"opacity": 1});
    };

    this.store_input = function(){
        d.Local.Set("email", this.email_input.Text());
    };

    this.Submit = function(){
        var email = this.email_input.Text();
        var pass = this.password_input.Text();

        if (email && pass) {
            this.Login();
        }
        else {
            this.ResetLogin();
        };

    };

    this.Login = function(){
        var email = this.email_input.Text();
        var pass = this.password_input.Text();

        if (!pass) {
            alert("Please enter a valid password");
            return;
        };

        var api = "https://" + d.Context["domain"] + "/Users";
        var server_data = {};
        server_data["f"] = "login";
        server_data["email"] = email;
        server_data["pass"] = pass;

        this.login_button.Request(api, server_data, this.on_login_response, this);

    };

    this.ResetLogin = function(){
        var email = this.email_input.Text();
        var api = "https://" + d.Context["domain"] + "/Users";
        var server_data = {};
        server_data["f"] = "reset";
        server_data["email"] = email;

        this.reset_button.Request(api, server_data, this.on_reset_response, this);

    };

    this.on_reset_response = function(response){

        if (response["error"]) {
            alert(response["error"]);
            return;
        };

        if (response["success"]) {
            alert("Your password link has been sent to " + response["email"] + ". Click that link to receive a new temporary password and log in");
        };

    };

    this.on_login_response = function(response){

        if (response["error"]) {
            alert(response["error"]);
            return;
        };

        console.log("******* LOG IN *******");
        console.log(response);

        d.User.SetUserAuthentication(this.email_input.Text(), response);

        (function(self){

            self.html.animate({"opacity": 0}, 150, function(){
                self.html.remove();
                self.on_login_callback();
            });

        })(this);

    };

    this.setup_styles();

};
