
function DashAdminColor(){

    this.html = Dash.Gui.GetHTMLContext("Coming soon...", {"margin": d.Size.Padding});
    this.property_box = null;
    this.data = null;

    this.setup_styles = function(){

        this.draw_color_section(Dash.Color.Light);
        this.draw_color_section(Dash.Color.Dark);

    };

    this.draw_color_section = function(color_set){

        // COLOR INTERFACE - BUTTON
        //
        //           ▽ - Color of the page/element background
        //           |
        // d.Color.Dark.Button.Background.Main
        // d.Color.Dark.Button.Background.Hover
        // d.Color.Dark.Button.Background.Selected
        // d.Color.Dark.Button.Background.SelectedHover

        console.log(color_set);
        console.log(color_set.Background);
        console.log(color_set.Text);
        console.log(color_set.Button);

        console.log(color_set.Tab); // DashColorButtonSet
        console.log(color_set.Tab.Background); // DashColorStateSet
        console.log(color_set.Tab.Text); // DashColorStateSet



        // for (var color_set_name in color_root) {
        //     console.log(color_set_name + ":");
        //     console.log(color_root[color_set_name]);
        // };

    };

    this.setup_styles();

};
