function DashLayout () {
    this.Dashboard         = DashLayoutDashboard;
    this.List              = DashLayoutList;
    this.List.ColumnConfig = DashLayoutListColumnConfig;
    this.PaneSlider        = DashLayoutPaneSlider;
    this.RevolvingList     = DashLayoutRevolvingList;
    this.Toolbar           = DashLayoutToolbar;
    this.UserProfile       = DashLayoutUserProfile;

    this.Tabs = {
        Side: DashLayoutTabsSide,
        Top:  DashLayoutTabsTop
    };
}
