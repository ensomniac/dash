function DashGuiListColumnConfig(){

    this.columns = [];

    this.AddColumn = function(display_name, data_key, can_edit, width){

        if (typeof can_edit != "boolean") {
            can_edit = true;
        };

        var column_details = {};
        column_details["type"] = "input";
        column_details["display_name"] = display_name;
        column_details["data_key"] = data_key;
        column_details["can_edit"] = can_edit;
        column_details["width"] = width;

        this.columns.push(column_details);

    };

    this.AddSpacer = function(){
        var column_details = {};
        column_details["type"] = "spacer";
        this.columns.push(column_details);
    };

};
