
function DashAdminView(){

    this.layout = new Dash.Gui.Layout.Tabs.Top(this);
    this.html = this.layout.html;

    this.setup_styles = function(){
        this.layout.Append("Settings", DashAdminSettings);
        this.layout.Append("Color", DashAdminColor);
    };

    this.setup_styles();

};
