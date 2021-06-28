function DashGuiLayout () {

    this.UserProfile = DashGuiLayoutUserProfile;

    this.List = DashGuiList;
    this.List.ColumnConfig = DashGuiListColumnConfig;

    this.PaneSlider = DashGuiPaneSlider;

    this.Tabs = {};
    this.Tabs.Top = DashGuiLayoutTabsTop;
    this.Tabs.Side = DashGuiLayoutTabsSide;

    this.Toolbar = DashGuiLayoutToolbar;

    this.ButtonBar = DashGuiButtonBar;

}
