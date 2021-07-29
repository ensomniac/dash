function DashSize (is_mobile) {

    this.Padding = 10;
    this.Stroke = 3;
    this.RowHeight = 20;
    this.ButtonHeight = this.RowHeight + (this.Padding);
    this.ColumnWidth = 150;

    this.BorderRadius = 3; // For containers
    this.BorderRadiusInteractive = 3; // For interactive elements (buttons, inputs, combos, etc)

    if (is_mobile) {

        this.Padding = 20;
        this.Stroke = 6;
        this.RowHeight = 40;
        this.ButtonHeight = this.RowHeight + (this.Padding);
        this.ColumnWidth = 300;

        this.BorderRadius = 9; // For containers
        this.BorderRadiusInteractive = 30; // For interactive elements (buttons, inputs, combos, etc)

    };

};
