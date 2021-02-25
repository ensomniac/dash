
// Profile page layout for the currently logged in user
function DashGuiLayoutUserProfile(user_data){

    this.user_data = user_data || Dash.User.Data;
    this.as_overview = false;

    this.property_box = null;
    this.html = null;

    this.setup_styles = function(){

        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            this.get_data,  // Function to return live data
            this.set_data,  // Function to set saved data locally
            "Users",        // Endpoint
            this.user_data["email"] // Dash obj_id (unique for users)
        );

        this.html = this.property_box.html;

        var header_title = "User Settings";
        if (this.user_data["first_name"]) {
            header_title = this.user_data["first_name"] + "'s User Settings";
        };

        this.property_box.AddHeader(header_title);
        this.property_box.AddInput("email",       "E-mail Address", "", null, false);
        this.property_box.AddInput("first_name",  "First Name",     "", null, true);
        this.property_box.AddInput("last_name",   "Last Name",      "", null, true);
        this.property_box.AddInput("job_prefix",   "Job Prefix",      "", null, true);

        this.new_password_row = new d.Gui.InputRow("Update Password", "", "New Password", "Update", this.update_password, this);

        // if (this.user_data["admin"]) {
        //     this.is_admin = new d.Gui.InputRow("Admin", "Yes", "Admin", "Revoke", function(b){this.set_group(b, "admin", false)}, this);
        // }
        // else {
        //     this.is_admin = new d.Gui.InputRow("Admin", "No", "Admin", "Promote", function(b){this.set_group(b, "admin", true)}, this);
        // };

        this.new_password_row.html.css("margin-left", Dash.Size.Padding*2);

        this.property_box.html.append(this.new_password_row.html);

        this.property_box.AddButton("Log Out", this.log_out);

    };

    this.get_data = function(){
        return this.user_data;
    };

    this.set_data = function(){
        console.log("set data");
        // return {};
    };

    this.log_out = function(button){
        d.Local.Set("email", "");
        d.Local.Set("token", "");
        d.Local.Set("user_json", "");
        location.reload();
    };

    this.set_group = function(button, group_name, group_option){

        console.log("this.set_group");

        // var api = "https://altona.io/Users";
        // var server_data = {};
        // server_data["f"] = "update_group_information";
        // server_data["token"] = localStorage.getItem("login_token");
        // server_data["as_user"] = this.user_data["email"];
        // server_data["group_name"] = group_name;
        // server_data["group_option"] = group_option;

        // button.Request(api, server_data, this.on_info_saved, this);

    };

    this.update_password = function(){

        if (!this.new_password_row.Text()) {
            return;
        };

        var params = {};
        params["f"] = "update_password";
        params["p"] = this.new_password_row.Text();

        (function(self, params){
            d.Request(self, function(response){
                self.on_info_saved(response, self.new_password_row);
            }, "Users", params);
        })(this, params);

    };

    this.update_first_name = function(){
        this.update_personal_information(this.first_name);
    };

    this.update_last_name = function(){
        this.update_personal_information(this.last_name);
    };

    this.update_hidden_mindtwins = function(){
        this.update_personal_information(this.hidden_mindtwins_csv);
    };

    this.update_personal_information = function(button){
        console.log("this.update_personal_information");
        console.log(response);


        // var api = "https://altona.io/Users";
        // var server_data = {};
        // server_data["f"] = "update_personal_information";
        // server_data["token"] = localStorage.getItem("login_token");
        // server_data["first_name"] = this.first_name.Text();
        // server_data["last_name"] = this.last_name.Text();
        // server_data["as_user"] = this.user_data["email"];

        // if (this.hidden_mindtwins_csv) {
        //     server_data["hidden_mindtwins_csv"] = this.hidden_mindtwins_csv.Text();
        // };

        // button.Request(api, server_data, this.on_info_saved, this);

    };

    this.on_info_saved = function(response, input_row){

        if (response.error) {
            console.log(response);
            alert(response.error);
            return;
        };

        console.log("** Info saved successfully **");
        input_row.FlashSave();

    };

    this.setup_styles();

};
