function DashAdminColor () {

    // this.html = Dash.Gui.GetHTMLContext("", {"margin": Dash.Size.Padding});
    this.html = Dash.Gui.GetHTMLContext("");
    this.property_box = null;
    this.data = null;

    this.display_theme = Dash.Local.Get("dash_admin_color_style") || "light";
    this.color = null; // ex. Dash.Color.Light

    ////// Objects
    this.header = null;
    this.property_box = null;

    this.setup_styles = function () {

        this.html.css({
            "position": "absolute",
            "inset": 0,
            "padding": Dash.Size.Padding,
        });

        this.draw_all();

    };

    this.draw_all = function () {

        if (this.display_theme == "light") {
            this.color = Dash.Color.Light;
        }
        else {
            this.color = Dash.Color.Dark;
        }

        this.html.empty();

        this.html.css({
            "background": this.color.Background,
            // "background": Dash.Color.Light.Background,
        });

        this.draw_header();
        this.draw_property_box();

        // COLOR INTERFACE - BUTTON
        //
        //           ▽ - Color of the page/element background
        //           |
        // Dash.Color.Dark.Button.Background.Main
        // Dash.Color.Dark.Button.Background.Hover
        // Dash.Color.Dark.Button.Background.Selected
        // Dash.Color.Dark.Button.Background.SelectedHover

        // console.log(color_set);
        // console.log(color_set.Background);
        // console.log(color_set.Text);
        // console.log(color_set.Button);

        // console.log(color_set.Tab); // DashColorButtonSet
        // console.log(color_set.Tab.Background); // DashColorStateSet
        // console.log(color_set.Tab.Text); // DashColorStateSet

        // for (var color_set_name in color_root) {
        //     console.log(color_set_name + ":");
        //     console.log(color_root[color_set_name]);
        // };

    };

    this.draw_header = function (color_set) {

        var label = "Header - " + this.display_theme.Title() + " Style (Switch to Dark)";

        if (this.display_theme != "light") {
            label = "Header - " + this.display_theme.Title() + " Style (Switch to Light)";
        }

        this.header = new Dash.Gui.Header(label, this.color);
        this.html.append(this.header.html);

        this.header.html.css({
            "cursor": "pointer",
        });

        (function (self) {
            self.header.html.on("click", function () {

                if (self.display_theme == "light") {
                    self.display_theme = "dark";
                }

                else {
                    self.display_theme = "light";
                }

                Dash.Local.Set("dash_admin_color_style", self.display_theme);

                console.log("switch to " + self.display_theme);

                self.draw_all();
            });
        })(this);

        var doc = new DashAdminColorDoc(this.color);
        this.html.append(doc.html);
    };

    this.draw_property_box = function (color_set) {
        console.log("Adding property box");

        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            this.get_data,  // Function to return live data
            this.set_data,  // Function to set saved data locally
            null,           // Endpoint
            null,           // Dash obj_id (unique for users)
            {"color": this.color}
        );

        this.html.append(this.property_box.html);

        var header_title = "Property Box";

        this.property_box.AddHeader(header_title, this.color);
        this.property_box.AddInput("email",       "E-mail Address", "", null, false);
        this.property_box.AddInput("first_name",  "First Name",     "", null, true);

        this.new_password_row = new Dash.Gui.InputRow("Password", "", "Password", "Update", this.dummy_cb, this, this.color);
        this.new_password_row.html.css("margin-left", Dash.Size.Padding * 2);
        this.property_box.AddHTML(this.new_password_row.html);

        this.property_box.AddButton("Property Box Button", this.dummy_cb);
    };

    this.get_data = function () {
        return "";
    };

    this.set_data = function () {
        return "";
    };

    this.dummy_cb = function () {
        return "";
    };

    this.setup_styles();
}
