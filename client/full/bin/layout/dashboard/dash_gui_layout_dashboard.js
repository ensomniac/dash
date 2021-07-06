function DashGuiLayoutDashboard (binder, color=null) {
    this.binder = binder;
    this.color = color || this.binder.color || Dash.Color.Dark;

    this.modules = [];
    this.html = Dash.Gui.GetHTMLAbsContext();

    // TODO: Ryan, how can we make this collapsible?

    this.setup_styles = function () {
        this.html.css({
            "background": this.color.Background,
            "display": "flex"
        });
    };

    this.AddSingleModule = function () {
        var index = this.modules.length;
        var module = new Dash.Gui.Layout.Dashboard.Module(this, "square");

        this.html.append(module.html);

        this.modules.push({
            "module": module,
            "index": index
        });

        return module;
    };

    this.AddDoubleModule = function () {
        var index = this.modules.length;
        var module = new Dash.Gui.Layout.Dashboard.Module(this, "rectangle");

        this.html.append(module.html);

        this.modules.push({
            "module": module,
            "index": index
        });

        return module;
    };

    this.AddFlexModule = function () {
        var index = this.modules.length;
        var module = new Dash.Gui.Layout.Dashboard.Module(this, "flex");

        this.html.append(module.html);

        this.modules.push({
            "module": module,
            "index": index
        });

        return module;
    };

    this.setup_styles();
}
