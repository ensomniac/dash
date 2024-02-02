class DashGuiFlowTimeline {
    constructor (view) {
        this.view = view;

        this.nodes = [];
        // this.back_button = null;
        this.left_flex_area = null;
        this.right_flex_area = null;
        this.highest_node_index = 0;
        this.color = this.view.color;
        this.steps = this.view.steps;
        this.html = $("<div></div>");
        // this.back_button_visible = false;
        this.height = Dash.Size.ButtonHeight;
        this.stroke_color = this.color.StrokeDark;
        this.stroke_size = Dash.Size.Padding * 0.2;

        this.setup_styles();
    }

    setup_styles () {
        if (this.view.data["furthest_step_id"]) {
            this.highest_node_index = this.view.steps.indexOf(
                this.view.get_step_from_id(this.view.data["furthest_step_id"])
            );
        }

        this.html.css({
            "display": "flex",
            "justify-content": "center",
            "height": this.height
        });

        this.left_flex_area = Dash.Gui.GetFlexSpacer(3);

        this.left_flex_area.css({
            "display": "flex",
            "margin-right": Dash.Size.Padding,
            "justify-content": "left"
        });

        this.html.append(this.left_flex_area);

        this.draw_nodes();

        this.right_flex_area = Dash.Gui.GetFlexSpacer(3);

        this.right_flex_area.css({
            "display": "flex",
            "margin-left": Dash.Size.Padding,
            "justify-content": "right"
        });

        this.html.append(this.right_flex_area);
    }

    RefreshLockedNodes () {
        if (!this.view.get_locked_step_ids_cb) {
            return;
        }

        var locked_step_ids = this.view.GetLockedStepIDs();

        for (var node of this.nodes) {
            node.SetLocked(locked_step_ids.includes(node.ID()));
        }
    }

    SetActiveNode (step, from_reset=false) {
        var locked_step_ids = this.view.GetLockedStepIDs();

        if (from_reset) {
            this.highest_node_index = 0;
        }

        var active_set = false;
        var show_back_button = true;

        for (var i in this.nodes) {
            var index = parseInt(i);
            var node = this.nodes[i];

            if (locked_step_ids.includes(node.ID())) {
                node.SetLocked(true);

                continue;
            }

            node.SetLocked(false);

            if (active_set) {
                if (index > this.highest_node_index) {
                    node.SetDisabled(true);
                }

                else {
                    node.SetActive(false);
                }

                continue;
            }

            if (node.ID() === step["id"]) {
                active_set = true;

                if (index > this.highest_node_index) {
                    this.highest_node_index = index;

                    this.view.UpdateLocal("furthest_step_id", step["id"]);
                }

                if (index === 0) {
                    this.view.HideBackButton();

                    show_back_button = false;
                }
            }

            node.SetActive(active_set);
        }

        if (show_back_button) {
            this.view.ShowBackButton();
        }
    }

    GetActiveNode () {
        for (var node of this.nodes) {
            if (node.IsActive()) {
                return node;
            }
        }

        return null;
    }

    GetNodeByID (step_id) {
        for (var node of this.nodes) {
            if (node.ID() === step_id) {
                return node;
            }
        }

        return null;
    }

    GetNextNode (ignore_locked=true) {
        var active_node_index = this.nodes.indexOf(this.GetActiveNode());

        if (!ignore_locked) {
            return this.nodes[active_node_index + 1];
        }

        for (var num of Dash.Math.Range(this.view.steps.length - active_node_index - 1)) {
            var node = this.nodes[active_node_index + (num + 1)];

            if (!node.IsLocked()) {
                return node;
            }
        }

        return null;
    }

    GetPreviousNode (ignore_locked=true) {
        var active_node_index = this.nodes.indexOf(this.GetActiveNode());

        if (!ignore_locked) {
            return this.nodes[active_node_index - 1];
        }

        for (var num of Dash.Math.Range(active_node_index)) {
            var node = this.nodes[active_node_index - (num + 1)];

            if (!node.IsLocked()) {
                return node;
            }
        }

        return null;
    }

    GoBack () {
        this.view.LoadStep(this.GetPreviousNode().Step(), true, false, true);
    }

    draw_nodes () {
        var draw_line = false;

        for (var step of this.steps) {
            if (draw_line) {
                this.html.append(this.get_line());
            }

            var node = new DashGuiFlowTimelineNode(this, step);

            this.html.append(node.html);

            this.nodes.push(node);

            draw_line = true;
        }
    }

    get_line () {
        var line = $("<div></div>");
        var height = this.stroke_size * 0.5;

        line.css({
            "height": height,
            "width": this.height - (this.stroke_size * 4),
            "background": this.stroke_color,
            "margin-top": (this.height * 0.5) - (height * 0.5)
        });

        return line;
    }

    // show_back_button () {
    //     if (this.back_button_visible) {
    //         return;
    //     }
    //
    //     this.back_button_visible = true;
    //
    //     if (this.back_button) {
    //         this.back_button.html.show({
    //             "complete": () => {
    //                 this.left_flex_area.css({
    //                     "min-width": this.back_button.html.outerWidth()
    //                 });
    //             }
    //         });
    //     }
    //
    //     else {
    //         this.add_back_button();
    //     }
    // }
    //
    // add_back_button () {
    //     this.back_button = new DashGuiFlowButton(
    //         "Back",
    //         this,
    //         () => {
    //             this.GoBack();
    //         }
    //     );
    //
    //     this.back_button.AddIcon("arrow_left_circled", 0.5, null, false);
    //
    //     // This is the only way for the button to not affect the sizing of its flex
    //     // spacer parent, which is important so the timeline nodes stay centered
    //     this.back_button.html.css({
    //         "position": "absolute",
    //         "top": 0,
    //         "left": 0
    //     });
    //
    //     this.back_button.label.css({
    //         "margin-right": Dash.Size.Padding * 0.5
    //     });
    //
    //     this.left_flex_area.append(this.back_button.html);
    //
    //     requestAnimationFrame(() => {
    //         this.left_flex_area.css({
    //             "min-width": this.back_button.html.outerWidth()
    //         });
    //     });
    // };
    //
    // hide_back_button () {
    //     if (!this.back_button || !this.back_button_visible) {
    //         return;
    //     }
    //
    //     this.back_button_visible = false;
    //
    //     this.back_button.html.hide({
    //         "complete": () => {
    //             this.left_flex_area.css({
    //                 "min-width": ""
    //             });
    //         }
    //     });
    // }
}
