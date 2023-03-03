function DashSize (is_mobile) {
    this.Stroke = is_mobile ? 6 : 3;
    this.Padding = is_mobile ? 20 : 10;
    this.RowHeight = is_mobile ? 40 : 20;
    this.BorderRadius = is_mobile ? 9 : 3; // For containers
    this.ColumnWidth = is_mobile ? 300 : 150;
    this.BorderRadiusInteractive = is_mobile ? 30 : 3; // For interactive elements (buttons, inputs, combos, etc)
    this.ButtonHeight = this.RowHeight + (this.Padding);

    if (is_mobile) {
        // This is special handling for iPhone 13 mini that has "Larger Text" selected for the "Display Zoom" setting (globally-zoomed screen)
        if (/iPhone/i.test(navigator.userAgent) && window.devicePixelRatio === 3 && window.screen.width === 320 && window.screen.height === 693) {
            for (var prop_name in this) {
                this[prop_name] = Math.round(this[prop_name] * 0.9);
            }
        }

        // Add any other special cases here
    }
}
