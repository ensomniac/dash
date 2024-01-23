/**@member DashLayoutRevolvingList*/

function DashLayoutRevolvingListScrolling () {
    this.on_view_scrolled = function () {
        if (!this.parent) {
            return;
        }

        var [start_index, end_index] = this.get_scroll_indexes();
        var needed_count = this.get_scroll_needed_count(start_index, end_index);
        var needed_indexes = this.get_scroll_needed_indexes(start_index);
        var [can_move, already_moved] = this.get_scroll_moves(needed_indexes);

        this.show_scroll_moves(needed_count, already_moved, can_move, start_index);
    };

    this.get_scroll_index_components = function (start_pos=0) {
        if (start_pos < 0) {
            start_pos = 0;
        }

        var end_pos = start_pos + window.innerHeight + this.full_row_height;
        var start_index = parseInt(this.get_index_from_pos(start_pos));

        return [start_pos, end_pos, start_index];
    };

    this.get_scroll_indexes = function () {
        var [start_pos, end_pos, start_index] = this.get_scroll_index_components(
            this.container.scrollTop() - this.full_row_height
        );

        for (var row_id in this.expanded_ids) {
            var expanded_data = this.expanded_ids[row_id];

            if (!Dash.Validate.Object(expanded_data) || !expanded_data["preview_content"]) {
                continue;
            }

            if (start_index < expanded_data["row_index"]) {
                continue;
            }

            var preview_height = parseInt(expanded_data["preview_content"].css("height"));
            var index_buffer = Math.ceil(preview_height / this.full_row_height);

            if (start_index > (expanded_data["row_index"] + index_buffer)) {
                start_pos -= preview_height;

                [start_pos, end_pos, start_index] = this.get_scroll_index_components(start_pos);

                continue;
            }

            start_index = expanded_data["row_index"] - 1;

            end_pos -= preview_height;

            break;
        }

        var end_index = parseInt(this.get_index_from_pos(end_pos));

        if (start_index < 0) {
            start_index = 0;
        }

        if (end_index > this.included_row_ids.length) {
            end_index = this.included_row_ids.length;
        }

        return [start_index, end_index];
    };

    this.get_index_from_pos = function (pos=0) {
        if (!pos) {
            return 0;
        }

        var top = 0;

        for (var i in this.included_row_ids) {
            if (top >= pos) {
                return i;
            }

            top += (this.row_height * (
                this.included_row_ids[i].toString().startsWith(this.divider_row_tag) ? 0.5 : 1
            )) + 1;
        }

        return i || 0;
    };

    this.get_scroll_needed_count = function (start_index, end_index) {
        var needed = (end_index - start_index) + this.row_count_buffer;

        if (needed > this.row_objects.length) {
            this.create_row_objects(needed);
        }

        return needed;
    };

    this.get_scroll_needed_indexes = function (row_index) {
        var needed_indexes = [];

        for (var i = 0; i < this.row_objects.length; i++) {
            needed_indexes.push(row_index);

            row_index += 1;
        }

        return needed_indexes;
    };

    this.get_scroll_moves = function (needed_indexes) {
        var can_move = [];
        var already_moved = [];

        for (var i = 0; i < this.row_objects.length; i++) {
            if (needed_indexes.includes(this.row_objects[i].index)) {
                already_moved.push(this.row_objects[i].index);
            }

            else {
                can_move.push(this.row_objects[i]);
            }
        }

        already_moved.sort();

        return [can_move, already_moved];
    };

    this.show_scroll_moves = function (needed_count, already_moved, can_move, row_index) {
        var available_index = 0;

        for (var i = 0; i < needed_count; i++) {
            if (already_moved.includes(row_index)) {
                row_index += 1;

                continue;
            }

            if (row_index >= this.included_row_ids.length) {
                continue;
            }

            this.show_row(can_move[available_index], row_index);

            available_index += 1;

            row_index += 1;
        }

        this.re_expand_rows();
        this.re_highlight_rows();
        this.tighten_scroll_moves();
    };

    this.tighten_scroll_moves = function () {
        var row;

        for (row of this.row_objects) {
            if (!row.IsExpanded()) {
                continue;
            }

            // What's going on here?
            return;
        }

        for (row of this.row_objects) {
            row.html.css({
                "top": this.get_row_top(row.index)
            });
        }
    };

    this.re_expand_rows = function () {
        for (var row_id in this.expanded_ids) {
            var expanded_data = this.expanded_ids[row_id];

            if (!Dash.Validate.Object(expanded_data)) {
                return;
            }

            for (var row of this.row_objects) {
                if (row.ID().toString() !== row_id.toString()) {
                    continue;
                }

                if (!row.IsExpanded()) {
                    this.on_row_selected(row, true);
                }

                break;
            }
        }
    };

    this.re_highlight_rows = function () {
        if (!this.non_expanding_click_highlight_color || !this.last_selected_row_id) {
            return;
        }

        for (var row of this.row_objects) {
            if (row.ID().toString() !== this.last_selected_row_id.toString()) {
                continue;
            }

            row.ShowHighlight(this.non_expanding_click_highlight_color);

            break;
        }
    };

    // If scrollbar exists in container, shift the header to the left to compensate and prevent misalignment
    this.set_header_scrollbar_offset = function () {
        if (!this.header_row) {
            return;
        }

        var margin = 0;

        if (Dash.Gui.HasOverflow(this.container)) {
            margin = Dash.Size.Padding * 1.5;
        }

        this.header_row.html.css({
            "margin-right": margin
        });
    };

    // If scrollbar exists in container, shift the footer to the left to compensate and prevent misalignment
    this.set_footer_scrollbar_offset = function () {
        if (!this.footer_row) {
            return;
        }

        var margin = 0;

        if (Dash.Gui.HasOverflow(this.container)) {
            margin = Dash.Size.Padding * 1.5;
        }

        this.footer_row.html.css({
            "margin-right": margin
        });
    };

    this.setup_scroll_connections = function () {
        (function (self) {
            self.parent = self.html.parent();

            self.parent.on("scroll", function () {
                self.on_view_scrolled();
            });

            self.container.on("scroll", function () {
                self.on_view_scrolled();
            });
        })(this);

        this.on_view_scrolled();
    };
}
