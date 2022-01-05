function DashGuiLayout () {
    this.UserProfile = DashGuiLayoutUserProfile;

    this.List = DashGuiList;
    this.List.ColumnConfig = DashGuiListColumnConfig;

    this.PaneSlider = DashGuiPaneSlider;

    this.RevolvingList = DashGuiRevolvingList;

    this.Tabs = {};
    this.Tabs.Top = DashGuiLayoutTabsTop;
    this.Tabs.Side = DashGuiLayoutTabsSide;

    this.Toolbar = DashGuiLayoutToolbar;

    this.Dashboard = DashGuiLayoutDashboard;
    this.Dashboard.Module = DashGuiLayoutDashboardModule;

    this.ButtonBar = DashGuiButtonBar;

    this.Mobile = {};
    this.Mobile.CardStack = DashMobileLayoutCardStack;
    this.Mobile.UserProfile = DashMobileLayoutUserProfile;

}
