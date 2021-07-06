function DashGuiLayoutDashboard (binder, color=null) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.modules = [];
    this.html = Dash.Gui.GetHTMLAbsContext();

    // TODO: How can we make this collapsible?

    this.setup_styles = function () {
        this.html.css({
            "background": this.color.Background,
            "display": "flex"
        });
    };

    this.AddSquareTagModule = function () {
        return this.add_module("square", "tag");
    };

    this.AddSquareRadialModule = function () {
        return this.add_module("square", "radial");
    };

    this.AddRectListModule = function () {
        return this.add_module("rect", "list");
    };

    this.AddFlexBarModule = function () {
        return this.add_module("flex", "bar");
    };

    this.add_module = function (style, sub_style) {
        var index = this.modules.length;
        var module = new Dash.Gui.Layout.Dashboard.Module(this, style, sub_style);

        this.html.append(module.html);

        this.modules.push({
            "module": module,
            "style": style,
            "sub_style": sub_style,
            "index": index
        });

        return module;
    };

    this.setup_styles();
}
