function DashLayout () {
    this.Dashboard               = DashLayoutDashboard;
    this.List                    = DashLayoutList;
    this.List.ColumnConfig       = DashLayoutListColumnConfig;
    this.PaneSlider              = DashLayoutPaneSlider;
    this.RevolvingList           = DashLayoutRevolvingList;
    this.SearchableList          = DashLayoutSearchableList;
    this.SearchableRevolvingList = DashLayoutSearchableRevolvingList;
    this.Toolbar                 = DashLayoutToolbar;
    this.UserProfile             = DashLayoutUserProfile;
    this.SelectorTabs            = DashLayoutSelectorTabs;

    this.Tabs = {
        Side: class DashLayoutTabsSide extends DashLayoutTabs {
            constructor (binder, recall_id_suffix="", color=null) {
                super(binder, true, recall_id_suffix, color);
            };
        },
        Top:  class DashLayoutTabsTop extends DashLayoutTabs {
            constructor (binder, recall_id_suffix="", color=null) {
                super(binder, false, recall_id_suffix, color);
            };
        }
    };
}
