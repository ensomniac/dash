function DashView () {
    this.Admin            = DashAdminView;
    this.PDF              = DashPDFView;
    this.SiteSettings     = DashAdminView;
    this.SiteSettingsTabs = new DashAdminTabs();
    this.Style            = DashStyleView;
    this.User             = DashUserView;
}
