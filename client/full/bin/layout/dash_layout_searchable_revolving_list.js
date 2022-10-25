// This must be an abstraction to combine the two, since implementing the revolving list into the searchable list is not going to work favorably
function DashLayoutSearchableRevolvingList (binder, column_config, color=null, include_header_row=false, row_options={}, get_data_for_key=null) {
    this.list = new DashLayoutRevolvingList(binder, column_config, color, include_header_row, row_options, get_data_for_key);
    this.input = new DashLayoutSearchableListInput(this.list, this.on_search.bind(this));

    this.html = $("<div></div>");

    this.setup_styles = function () {
        this.list.html.css({
            "position": ""
        });

        this.html.append(this.input.html);
        this.html.append(this.list.html);
    };

    this.on_search = function (search_text) {
        console.debug("TEST on search", search_text);  // TODO
    };

    this.setup_styles();
}
