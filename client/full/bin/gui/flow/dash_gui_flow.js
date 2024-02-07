class DashGuiFlow {
    constructor (api, steps, step_init_bound_cb, flow_id="", color=null) {
        /**
         * Flow element.
         * --------------------------
         *
         * IMPORTANT NOTE: <br>
         *     For consistency across Dash, this takes an API name with an optional flow ID, and uses
         *     predetermined names for function calls. For each context this is used in, make sure
         *     to add the correct function names to the respective API file as follows:
         *
         *         - "save":               Save flow data, usually on each step change, but sometimes on a field change
         *         - "get_data":           Get flow data (using flow ID, if provided)
         *         - "reset":              Reset flow data and start over
         *         - "finish":             Finish flow (backend should also reset data after, in most cases)
         *         - "new_option_request": Prompts the user to type in some details, then emails those details to the admins
         *
         *     Equally important: DO NOT nest the data on the server. The data that comes in from the "get_data"
         *     call needs to not be nested in order for this module to be able to remain generic and flexible.
         *
         * @param {string} api - API name for requests
         * @param {Array} steps - List of dicts with ID and other optional values such as display_name, type, and key
         * @param {function} step_init_bound_cb - Callback that's called when step is changed and should utilize the public
         *                                        methods in DashGuiFlowStep and DashGuiFlowStepArea to draw each step's gui
         * @param {string} flow_id - If provided, will be sent as the ID for the flow's data container in requests
         *                           (Some flows may not need this because they default on the backend
         *                            to something like a user's email instead of an ID, for example)
         * @param {DashColorSet} color - DashColorSet instance
         */

        this.api = api;
        this.steps = steps;
        this.step_init_cb = step_init_bound_cb;
        this.flow_id = flow_id;
        this.color = color || Dash.Color.Dark;

        this.data = {};
        this.step_map = null;
        this.timeline = null;
        this.step_area = null;
        this.now = new Date();
        this.on_exit_cb = null;
        this.header_bar = null;
        this.back_button = null;
        this.resize_timer = null;
        this.initialized = false;
        this.can_finish_cb = null;
        // this.window_size_mult = 1;
        this.loading_overlay = null;
        this.modal_bg_opacity = 0.95;
        this.content_area_size = 1024;
        this.core_gui_font_size = 250;
        this.back_button_visible = false;
        this.exit_button_size_mult = 0.75;
        this.get_locked_step_ids_cb = null;
        this.exit_button_top = Dash.Size.Padding * 0.7;
        this.missing_option_text_color = this.color.Stroke;
        this.icon_button_container_size = Dash.Size.Padding * 3;
        this.modal_bg_color = Dash.Color.Darken(this.color.Background, 30);
        this.timeline_pad = this.icon_button_container_size - Dash.Size.Padding;
        this.header_bar_height = this.icon_button_container_size - Dash.Size.Padding;

        this.tomorrow = new Date(this.now.getTime());

        this.tomorrow.setDate(this.tomorrow.getDate() + 1);

        this.one_year_out = new Date(this.now.getTime());

        this.one_year_out.setDate(this.tomorrow.getDate() + 365);

        this.html = Dash.Gui.GetHTMLAbsContext(
            "",
            this.color,
            {
                "background": Dash.Color.Darken(this.color.Background, 7),
                "display": "flex",
                "padding": Dash.Size.Padding,
                "flex-direction": "column"
            }
        );

        this.content_area = Dash.Gui.GetHTMLContext(
            "",
            {
                "aspect-ratio": "1",
                "min-width": this.content_area_size * 0.5,
                "min-height": this.content_area_size * 0.5,
                "max-width": this.content_area_size,
                "width": "100%",
                "height": "auto",
                "margin": "auto",
                "border": "1px solid " + this.color.PinstripeLight,
                "border-radius": Dash.Size.BorderRadius * 4
            },
            this.color
        );

        this.row_area_css = {
            "border-radius": Dash.Size.BorderRadius,
            "padding": Dash.Size.Padding * 2,
            "background": this.color.PinstripeLight
        };

        this.setup_styles();
    }

    setup_styles () {
        // var min_window_size = Math.min(window.innerHeight, window.innerWidth);
        //
        // if (min_window_size < this.content_area_size) {
        //     this.window_size_mult = min_window_size / this.content_area_size;
        //
        //     this.core_gui_font_size *= this.window_size_mult;
        // }

        this.html.append(this.content_area);

        this.get_data();
    }

    SetOnExitCB (bound_cb) {
        this.on_exit_cb = bound_cb;
    }

    SetCanFinishCB (bound_cb) {
        this.can_finish_cb = bound_cb;
    }

    SetGetLockedStepIDsCB (bound_cb) {
        this.get_locked_step_ids_cb = bound_cb;
    }

    RequestNewOption (step) {
        var text_area = new Dash.Gui.TextArea(
            this.color,
            "Please describe the new option you'd like to have added with any additional relevant context.",
            this
        );

        text_area.SetHeight(Dash.Size.RowHeight * 8, true);

        var prompt;  // Define this variable before it's initialized so that it can be referenced in the callback
        var size = Dash.Size.ColumnWidth * 2;  // Correlated to the text area's height

        prompt = new Dash.Gui.Prompt(
            (selected_index) => {
                if (selected_index === 1) {  // Send
                    var request_text = text_area.GetText().trim().Trim("\n").trim();

                    if (!request_text) {
                        this.on_empty_request_text(prompt);

                        return;
                    }

                    this.send_option_request(step, request_text);
                }

                prompt.Remove();
            },
            size,
            size,
            "",
            "Request a new option",
            "Send",
            "Cancel",
            this.color,
            true,
            this.modal_bg_opacity,
            true,
            this.modal_bg_color
        );

        prompt.AddHTML(text_area.html);
        prompt.DisableRemoveOnSelection();
    }

    LoadStep (step, force=false, from_reset=false, save_first=false) {
        if (typeof step === "string") {
            step = this.get_step_from_id(step);
        }

        // var node = this.timeline.GetNodeByID(step["id"]);
        //
        // if (node && node.IsLocked()) {  // Should never happen, just in case
        //     Dash.Log.Warn("Locked step (" + step["id"] + ") was attempted to be loaded");
        //
        //     return;
        // }

        if (!force) {
            new Dash.Gui.Prompt(
                (selected_index) => {
                    if (selected_index === 1) {  // Yes
                        this.LoadStep(step, true, from_reset, save_first);
                    }
                },
                Dash.Size.ColumnWidth * 1.5,
                Dash.Size.ColumnWidth * 1.25,
                "Go to " + this.get_step_display_name(step) + "?",
                "Change Step",
                "Yes",
                "Cancel",
                this.color,
                true,
                this.modal_bg_opacity,
                true,
                this.modal_bg_color
            );

            return;
        }

        this.UpdateLocal("active_step_id", step["id"]);

        if (save_first) {
            this.Save(
                true,
                () => {
                    this.load_step(step, from_reset);
                },
                step["id"]
            );
        }

        else {
            this.load_step(step, from_reset);
        }
    }

    Save (show_loading_overlay=false, callback=null, active_step_id="") {
        if (show_loading_overlay) {
            this.show_loading_overlay();
        }

        Dash.Request(
            this,
            (response) => {
                this.hide_loading_overlay();

                if (!Dash.Validate.Response(response)) {
                    return;
                }

                if (callback) {
                    callback();
                }
            },
            this.api,
            {
                "f": "save",
                "flow_id": this.flow_id,
                "data": JSON.stringify(this.data),
                "step_id": active_step_id || this.timeline.GetActiveNode().ID()
            }
        );
    }

    UpdateLocal (key, value) {
        this.data[key] = value;
    }

    GetLabel (text, header=false, button=false) {
        var label = $("<div>" + text + "</div>");

        var css = {
            "user-select": "none",
            "color": header ? this.color.Text : button ? this.missing_option_text_color : this.color.StrokeDark,
            "font-family": "sans_serif_" + (header ? "bold" : button ? "bold" : "normal"),
            "text-align": "center",
            "font-size": header ? "225%" : button ? "100%" : "125%",
            "margin-top": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "cursor": button ? "pointer" : "auto",
            "white-space": "pre-wrap",
            "width": "fit-content"
        };

        if (button) {
            css["font-style"] = "italic";  // Allows for both bold and italic
        }

        label.css(css);

        return label;
    }

    ShowBackButton () {
        if (this.back_button_visible) {
            return;
        }

        this.back_button_visible = true;

        if (this.back_button) {
            this.back_button.html.show();
        }

        else {
            this.add_back_button();
        }
    }

    HideBackButton () {
        if (!this.back_button || !this.back_button_visible) {
            return;
        }

        this.back_button_visible = false;

        this.back_button.html.hide();
    }

    // Follows a 'Save' call from the step's continue button
    Finish () {
        if (this.can_finish_cb && !this.can_finish_cb(this)) {
            return;
        }

        this.show_loading_overlay();

        Dash.Request(
            this,
            (response) => {
                if (!Dash.Validate.Response(response)) {
                    this.hide_loading_overlay();

                    return;
                }

                this.exit(true, true);
            },
            this.api,
            {
                "f": "finish",
                "flow_id": this.flow_id
            }
        );
    }

    OnMissedStep (missed_step_id, message="") {
        var step = this.get_step_from_id(missed_step_id);

        new Dash.Gui.Alert(
            (
                message || (
                    "The data from a prerequisite step ("
                    + this.get_step_display_name(step)
                    + ") is missing. Please go back to the missed step before continuing here."
                )
            ),
            this.color,
            "Missed required step",
            "Go to missed step",
            () => {
                this.LoadStep(step, true, false, true);
            },
            Dash.Size.ColumnWidth * 2.6,
            Dash.Size.ColumnWidth * 1.4,
            true,
            this.modal_bg_opacity,
            false,
            this.modal_bg_color
        );
    }

    GetLockedStepIDs () {
        return this.get_locked_step_ids_cb ? this.get_locked_step_ids_cb(this) : [];
    }

    AddHTMLToHeaderBar (html) {
        if (!this.header_bar) {
            this.header_bar = $("<div></div>");

            this.header_bar.css({
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "position": "absolute",
                "gap": Dash.Size.Padding,
                "top": Dash.Size.Padding * 0.5,
                "left": this.icon_button_container_size + Dash.Size.Padding,
                "right": this.icon_button_container_size + Dash.Size.Padding,
                "height": this.header_bar_height
            });

            this.content_area.append(this.header_bar);
        }

        this.header_bar.append(html);
    }

    init_step (step) {
        this.step_init_cb(this, step);
    }

    load_step (step, from_reset) {
        this.timeline.SetActiveNode(step, from_reset);

        this.step_area.SetActiveStep(step);
    }

    get_data () {
        this.show_loading_overlay();

        Dash.Request(
            this,
            (response) => {
                this.hide_loading_overlay();

                if (!Dash.Validate.Response(response)) {
                    return;
                }

                if ("error" in response) {
                    delete response["error"];
                }

                this.data = response;

                this.init_gui();
            },
            this.api,
            {
                "f": "get_data",
                "flow_id": this.flow_id
            }
        );
    }

    init_gui () {
        if (this.initialized) {
            return;
        }

        this.step_area = new DashGuiFlowStepArea(this);
        this.timeline = new DashGuiFlowTimeline(this);

        this.timeline.html.css({
            "position": "absolute",
            "left": this.timeline_pad,
            "right": this.timeline_pad,
            "bottom": this.timeline_pad
        });

        this.step_area.html.css({
            "position": "absolute",
            "top": this.icon_button_container_size,
            "left": this.icon_button_container_size,
            "right": this.icon_button_container_size,
            "bottom": this.timeline.height + (this.timeline_pad * 2)
        });

        this.content_area.append(this.step_area.html);
        this.content_area.append(this.timeline.html);

        this.add_exit_button();
        this.add_reset_button();
        this.LoadStep(this.data["active_step_id"] || this.steps[0], true);
        this.add_resize_listener();

        this.initialized = true;
    }

    add_resize_listener () {
        $(window).on("resize", () => {
            if (this.resize_timer) {
                clearTimeout(this.resize_timer);
            }

            this.resize_timer = setTimeout(
                () => {
                    for (var options of this.step_area.step.options) {
                        options.OnResize();
                    }
                },
                250
            );
        });
    }

    add_exit_button () {
        var button = new Dash.Gui.IconButton(
            "close_circle",
            () => {
                this.exit(true);  // Don't need to confirm with the user if they already clicked the button
            },
            this,
            this.color,
            {
                // Normally the multiplier would be passed to the "size_mult" key,
                // but that would leave empty space in the button's container, meaning the click
                // event can be triggered in that empty space, which is not desired in this case
                "container_size": this.icon_button_container_size * this.exit_button_size_mult
            }
        );

        button.html.css({
            "position": "absolute",
            "top": this.exit_button_top,
            "left": Dash.Size.Padding * 0.7
        });

        this.style_icon_button(button, "Exit", true);

        this.content_area.append(button.html);
    }

    // TODO: double width on hover?
    add_back_button () {
        var left_margin = Dash.Size.Padding * 0.2;

        this.back_button = new Dash.Gui.IconButton(
            "arrow_left_alt2_heavy",
            () => {
                this.timeline.GoBack();
            },
            this,
            this.color,
            {
                "container_size": this.icon_button_container_size,
                "size_mult": 1.1
            }
        );

        this.back_button.html.css({
            "position": "absolute",
            "height": "auto",
            "top": "25%",
            "bottom": "25%",
            "left": 0,
            "overflow": "hidden",
            "padding-right": left_margin * 2
        });

        this.back_button.icon.html.css({
            "height": "100%"
        });

        this.back_button.icon.icon_html.css({
            "margin-left": left_margin,
            "top": "calc(50% - " + (this.icon_button_container_size * 0.5) + "px)"
        });

        this.style_icon_button(this.back_button, "Back", false, this.color.PinstripeLight);

        this.content_area.append(this.back_button.html);
    }

    add_reset_button () {
        var button = new Dash.Gui.IconButton(
            "refresh",
            () => {
                this.reset();
            },
            this,
            this.color,
            {
                // Normally the multiplier (0.65) would be passed to the "size_mult" key,
                // but that would leave empty space in the button's container, meaning the click
                // event can be triggered in that empty space, which is not desired in this case
                "container_size": this.icon_button_container_size * 0.65
            }
        );

        button.html.css({
            "position": "absolute",
            "top": Dash.Size.Padding * 0.9,
            "right": Dash.Size.Padding * 0.8
        });

        this.style_icon_button(button, "Start over", true);

        this.content_area.append(button.html);
    }

    style_icon_button (button, hover_text, mirror=false, bg_hover_color=null) {
        var default_color = this.color.Stroke;

        if (mirror) {
            button.MirrorIcon();
        }

        button.SetHoverHint(hover_text);
        button.SetIconColor(default_color);

        button.html.on("mouseenter", () => {
            button.SetIconColor(this.color.Button.Background.Base);

            if (bg_hover_color) {
                button.html.css({
                    "background": bg_hover_color
                });
            }
        });

        button.html.on("mouseleave", () => {
            button.SetIconColor(default_color);

            if (bg_hover_color) {
                button.html.css({
                    "background": ""
                });
            }
        });
    }

    on_empty_request_text (prompt) {
        prompt.DisableEscShortcut();
        prompt.DisableEnterShortcut();

        var alert = new Dash.Gui.Alert(
            (
                "It looks like you forgot to explain your request.\n\n" +
                "Please write something in the box and try again."
            ),
            this.color,
            "Hang on",
            "Got it",
            () => {
                prompt.EnableEscShortcut();
                prompt.EnableEnterShortcut();
            },
            prompt.width,
            prompt.height,
            false  // Don't need another bg, the prompt is still up
        );

        alert.IncreaseZIndex(Math.abs(prompt.modal.css("z-index") - alert.modal.css("z-index")) + 1);
    }

    send_option_request (step, request_text) {
        this.show_loading_overlay();

        Dash.Request(
            this,
            (response) => {
                this.hide_loading_overlay();

                if (!Dash.Validate.Response(response)) {
                    return;
                }

                new Dash.Gui.Alert(
                    (
                        "Your request was sent directly to the RTC team. If they have any questions, " +
                        "they'll reach out directly, otherwise, you can expect a fairly quick turnaround." +
                        "\n\nOnce your new option has been added, you'll be notified and can return to " +
                        "this tool to continue creating your new drop.\n\nIf you have any questions, " +
                        "please don't hesitate to reach out to the RTC team."
                    ),
                    this.color,
                    "Request Sent",
                    "Exit for now",
                    () => {
                        this.exit(true);
                    },
                    Dash.Size.ColumnWidth * 2.5,
                    Dash.Size.ColumnWidth * 2.1,
                    true,
                    this.modal_bg_opacity,
                    true,
                    this.modal_bg_color
                );
            },
            this.api,
            {
                "f": "new_option_request",
                "flow_id": this.flow_id,
                "step_id": step["id"],
                "request_text": request_text
            }
        );
    }

    show_loading_overlay () {
        if (!this.loading_overlay) {
            this.loading_overlay = new Dash.Gui.LoadingOverlay(this.color, "none", "Loading", this.content_area);
        }

        this.loading_overlay.Show();
    }

    hide_loading_overlay () {
        if (!this.loading_overlay) {
            return;
        }

        this.loading_overlay.Hide();
    }

    get_step_display_name (step) {
        return step["display_name"] || step["id"].toString().Title();
    }

    get_step_from_id (step_id) {
        if (!this.step_map) {
            this.step_map = {};

            for (var step of this.steps) {
                this.step_map[step["id"]] = step;
            }
        }

        if (!this.step_map[step_id]) {
            this.step_map[step_id] = {"id": step_id};
        }

        return this.step_map[step_id];
    }

    reset (_force=false) {
        if (!_force) {
            new Dash.Gui.Prompt(
                (selected_index) => {
                    if (selected_index === 1) {  // Start over
                        this.reset(true);
                    }
                },
                Dash.Size.ColumnWidth * 1.5,
                Dash.Size.ColumnWidth * 1.35,
                "All progress will be lost.\n\nAre you sure you want to start over?",
                "Start over?",
                "Start over",
                "Keep working",
                this.color,
                true,
                this.modal_bg_opacity,
                true,
                this.modal_bg_color
            );

            return;
        }

        this.show_loading_overlay();

        Dash.Request(
            this,
            (response) => {
                this.hide_loading_overlay();

                if (!Dash.Validate.Response(response)) {
                    return;
                }

                this.data = {};

                this.LoadStep(this.steps[0], true, true);
            },
            this.api,
            {
                "f": "reset",
                "flow_id": this.flow_id
            }
        );
    }

    exit (force=false, from_finish=false) {
        if (!force) {
            new Dash.Gui.Prompt(
                (selected_index) => {
                    if (selected_index === 1) {  // Exit
                        this.exit(true);
                    }
                },
                Dash.Size.ColumnWidth * 1.5,
                Dash.Size.ColumnWidth * 1.15,
                "All progress will be saved and you can return any time.",
                "Exit?",
                "Exit",
                "Keep working",
                this.color,
                true,
                this.modal_bg_opacity,
                true,
                this.modal_bg_color
            );

            return;
        }

        if (from_finish) {  // Save is handled right before Finish is called
            this._exit(from_finish);
        }

        else {
            this.Save(
                true,
                () => {
                    this._exit(from_finish);
                }
            );
        }
    }

    _exit (from_finish) {
        this.html.stop().animate(
            {"opacity": 0},
            750,
            () => {
                if (this.on_exit_cb) {
                    this.on_exit_cb(this, from_finish);
                }
            }
        );
    }
}
