function DashLayoutTabs (binder, side_tabs, recall_id_suffix="", color=null) {
    this.binder = binder;
    this.side_tabs = side_tabs;
    this.color = color;

    this.temp_html = [];
    this.all_content = [];
    this.selected_index = -1;
    this.current_index = null;
    this.active_content = null;
    this.html = $("<div></div>");
    this.on_tab_changed_cb = null;
    this.tab_top = $("<div></div>");
    this.before_tab_changed_cb = null;
    this.tab_bottom = $("<div></div>");
    this.content_area = $("<div></div>");
    this.always_start_on_first_tab = false;

    this.recall_id = (this.binder.constructor + "").replace(
        /[^A-Za-z]/g, ""
    ).slice(0, 100).trim().toLowerCase();

    // This is necessary if there will be two different lists within the same script.
    // Without this, both lists will share the same recall ID and load indexes incorrectly.
    if (recall_id_suffix) {
        this.recall_id += "_" + recall_id_suffix;
    }

    if (this.side_tabs) {
        if (!this.color) {
            this.color = Dash.Color.Dark;
        }

        this.tab_area = $("<div></div>");
        this.tab_middle = $("<div></div>");
        this.tab_area_size = Dash.Size.ColumnWidth;
    }

    else {  // TODO: This should probably also be converted to a better div grouping
        if (!this.color) {
            this.color = Dash.Color.Light;
        }

        this.list_backing = $("<div></div>");
        this.tab_area_size = Dash.Size.RowHeight + Dash.Size.Padding;
    }

    this.setup_styles = function () {
        if (this.side_tabs) {
            this.set_styles_for_side_tabs();
        }

        else {
            this.set_styles_for_top_tabs();
        }

        (function (self) {
            requestAnimationFrame(function () {
                if (!Dash.User.Data || Dash.User.Data["first_name"]) {
                    self.load_last_selection();

                    return;
                }

                // If the user is new and hasn't yet at least entered their first name, gently
                // nudge them to do so every time they load the main view by loading their user view
                for (var i in self.all_content) {
                    if (self.all_content[i]["content_div_html_class"] !== DashUserView) {
                        continue;
                    }

                    try {
                        self.LoadIndex(i);

                        requestAnimationFrame(function () {
                            self.on_autoload_user_settings();
                        });
                    }

                    catch {
                        self.load_last_selection();
                    }
                }

                self.init();
            });
        })(this);
    };

    // This is a very specific function that is only intended to be called for new
    // users that have not filled in their name yet. When this function is called,
    // the username isn't set, but the user settings tab is loaded. Find the First Name
    // field and highlight it so it's clear what the user is supposed to do.
    this.on_autoload_user_settings = function () {
        if (
               this.all_content[this.current_index]["content_div_html_class"] != DashUserView
            || !this.active_content.user_profile
        ) {
            return;
        }

        this.active_content.user_profile.ShowNameSuggestion();
    };

    this.AlwaysStartOnFirstTab = function () {
        this.always_start_on_first_tab = true;
    };

    this.OnTabChanged = function (callback) {
        this.on_tab_changed_cb = callback.bind(this.binder);
    };

    // The function provided here should return a bool which will
    // determine if the tab should be allowed to change or not
    this.BeforeTabChanged = function (callback) {
        this.before_tab_changed_cb = callback.bind(this.binder);
    };

    this.GetCurrentIndex = function () {
        return this.current_index;
    };

    this.GetCurrentTabData = function () {
        if (this.current_index === null) {
            return {};
        }

        return this.all_content[this.current_index];
    };

    this.GetIndexByTabName = function (name, default_zero=true) {
        for (var i in this.all_content) {
            var content = this.all_content[i];

            if (content["label_text"] === name) {
                return i;
            }
        }

        Dash.Log.Warn("Warning: Failed to find index by tab name for:", name, this.all_content);

        return (default_zero ? 0 : null);
    };

    // TODO: Break this function up
    this.LoadIndex = function (index, clicked=false) {
        if (index > this.all_content.length - 1) {
            return;
        }

        if (clicked && this.before_tab_changed_cb && !this.before_tab_changed_cb(index)) {
            return;
        }

        this.remove_temp_html();

        if (!this.always_start_on_first_tab) {
            Dash.Local.Set("sidebar_index_" + this.recall_id, index);
        }

        this.current_index = index;

        var button = null;

        for (var i in this.all_content) {
            var content_data = this.all_content[i];

            if (parseInt(i) === parseInt(index)) {
                content_data["button"].SetSelected(true);

                button = content_data["button"];

                if (content_data["selected_css"]) {
                    content_data["button"].html.css(content_data["selected_css"]);
                }
            }

            else {
                content_data["button"].SetSelected(false);

                if (content_data["unselected_css"]) {
                    content_data["button"].html.css(content_data["unselected_css"]);
                }
            }

            if (content_data["css"]) {
                content_data["button"].html.css(content_data["css"]);
            }
        }

        this.content_area.empty();
        this.active_content = null;

        var inst_class;
        var content_html;

        if (typeof this.all_content[index]["content_div_html_class"] === "object") {
            content_html = this.all_content[index]["content_div_html_class"];
        }

        else if (typeof this.all_content[index]["content_div_html_class"] === "function") {
            // DashGlobalImpactChange | 12/21/21 | Ryan
            // Updating this function to pass optional_args to callback while also
            // binding the callback correctly to the parent class
            // This is likely a very low impact change that *shouldn't* affect anything

            var html_class = this.all_content[index]["content_div_html_class"];
            var callback = this.all_content[index]["content_div_html_class"].bind(this.binder);
            var optional_args = this.all_content[index]["optional_args"];
            var unpack = this.all_content[index]["unpack_params"] && Dash.Validate.Object(optional_args) && Array.isArray(optional_args);

            if (this.is_class(html_class)) {
                if (unpack) {
                    inst_class = new callback(...optional_args);
                }

                else {
                    if (optional_args) {
                        inst_class = new callback(optional_args);
                    }

                    else {
                        inst_class = new callback();
                    }
                }

                content_html = inst_class.html;
                this.active_content = inst_class;

            }

            else {  // Calling a function with 'new' will result in an incorrect binding
                if (unpack) {
                    inst_class = callback(...optional_args);
                }

                else {
                    if (optional_args) {
                        inst_class = callback(optional_args);
                    }

                    else {
                        inst_class = callback();
                    }
                }

                content_html = inst_class.html;
                this.active_content = inst_class;
            }
        }

        else {
            content_html = this.all_content[index]["content_div_html_class"].bind(this.binder)(button);
            this.active_content = content_html;
        }

        if (!content_html) {
            if (parseInt(index) === 0) {
                console.error("Error: Unknown content!");

                content_html = $("<div>Error Loading Content</div>");
            }

            else {
                console.error("Error: Invalid index", index, ", reloading index 0");

                this.LoadIndex(0);

                return;
            }

        }

        this.content_area.append(content_html);

        if (this.on_tab_changed_cb) {
            this.on_tab_changed_cb(this.all_content[index], inst_class);
        }

        if (this.all_content[index]["url_hash_text"]) {
            Dash.History.TabAdd(
                this.all_content[index]["url_hash_text"],
                this,
                index
            );
        }

        this.all_content[index]["last_inst_class"] = inst_class;

        return inst_class;
    };

    this.AddHTML = function (html, remove_on_tab_change=false) {
        html.css({
            "margin-bottom": 1
        });

        this.tab_top.append(html);

        if (remove_on_tab_change) {
            this.temp_html.push(html);
        }

        return html;
    };

    // DEPRECATED in favor of AddHTML to stay consistent with that naming across Dash
    this.AppendHTML = function (html) {
        return this.AddHTML(html);
    };

    this.MidpendHTML = function (html) {
        if (!this.side_tabs) {
            console.error("MidpendHTML only works for side tabs right now");

            return;
        }

        html.css({
            "margin-top": 1,
            "margin-bottom": 1
        });

        this.tab_middle.append(html);

        return html;
    };

    this.PrependHTML = function (html) {
        html.css({
            "margin-top": 1
        });

        this.tab_bottom.append(html);

        return html;
    };

    this.AppendImage = function (img_url, height=null) {
        // TODO: Move the concept of an 'Image' into dash as a light abstraction for managing aspect ratios

        // TODO: This AppendImage is a hack. We need to revise the stack of objects in this
        //  container so they derive from some abstraction to simplify append/prepend

        var image = $("<div></div>");

        image.css({
            "height": height || Dash.Size.RowHeight * 2,
            "background-image": "url(" + img_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center"
        });

        this.tab_top.append(image);

        return image;
    };

    this.Append = function (label_text, content_div_html_class, optional_args=null, additional_content_data={}) {
        return this._add(label_text, content_div_html_class, this.tab_top, optional_args, additional_content_data);
    };

    this.Midpend = function (label_text, content_div_html_class, optional_args=null, additional_content_data={}) {
        if (!this.side_tabs) {
            console.error("Error: Midpend only works for side tabs for now");

            return;
        }

        return this._add(label_text, content_div_html_class, this.tab_middle, optional_args, additional_content_data);
    };

    this.Prepend = function (label_text, content_div_html_class, optional_args=null, additional_content_data={}) {
        return this._add(label_text, content_div_html_class, this.tab_bottom, optional_args, additional_content_data);
    };

    this.SetTabAreaSize = function (size=null, anim_ms=0) {
        if (size !== null) {
            this.tab_area_size = size;
        }

        if (this.side_tabs) {
            if (anim_ms) {
                this.content_area.stop().animate(
                    {"left": this.tab_area_size},
                    anim_ms
                );

                this.tab_area.stop().animate(
                    {"width": this.tab_area_size},
                    anim_ms
                );

                this.tab_top.stop().animate(
                    {"width": this.tab_area_size},
                    anim_ms
                );

                this.tab_middle.stop().animate(
                    {"width": this.tab_area_size},
                    anim_ms
                );

                this.tab_bottom.stop().animate(
                    {"width": this.tab_area_size},
                    anim_ms
                );
            }

            else {
                this.content_area.css({
                    "left": this.tab_area_size
                });

                this.tab_area.css({
                    "width": this.tab_area_size
                });

                this.tab_top.css({
                    "width": this.tab_area_size
                });

                this.tab_middle.css({
                    "width": this.tab_area_size
                });

                this.tab_bottom.css({
                    "width": this.tab_area_size
                });
            }
        }

        else {
            if (anim_ms) {
                this.list_backing.stop().animate(
                    {"height": this.tab_area_size},
                    anim_ms
                );

                this.tab_top.stop().animate(
                    {"height": this.tab_area_size},
                    anim_ms
                );

                this.tab_bottom.stop().animate(
                    {"height": this.tab_area_size},
                    anim_ms
                );

                this.content_area.stop().animate(
                    {"top": this.tab_area_size},
                    anim_ms
                );
            }

            else {
                this.list_backing.css({
                    "height": this.tab_area_size
                });

                this.tab_top.css({
                    "height": this.tab_area_size
                });

                this.tab_bottom.css({
                    "height": this.tab_area_size
                });

                this.content_area.css({
                    "top": this.tab_area_size
                });
            }
        }
    };

    this.init = function () {
        if (!this.all_content.length) {
            if (this.init_attempts > 10) {
                return;
            }

            (function (self) {
                setTimeout(
                    function () {
                        self.init();
                    },
                    100
                );
            })(this);

            this.init_attempts += 1;

            return;
        }

        if (this.initial_load) {
            return;
        }

        this.initial_load = true;

        if (!Dash.User.Data || Dash.User.Data["first_name"]) {
            this.load_last_selection();

            return;
        }

        // If the user is new and hasn't yet at least entered their first name, gently
        // nudge them to do so every time they load the main view by loading their user view
        for (var i in this.all_content) {
            if (this.all_content[i]["content_div_html_class"] !== DashUserView) {
                continue;
            }

            try {
                this.LoadIndex(i);
            }

            catch {
                this.load_last_selection();
            }
        }
    };

    this.remove_temp_html = function () {
        for (var html of this.temp_html) {
            html.remove();
        }

        this.temp_html = [];
    };

    this.is_class = function (func) {
        var dummy = Function.prototype.toString.call(func);

        return dummy.includes("this.setup_styles") || dummy.includes("this.html");
    };

    this.set_styles_for_side_tabs = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.Tab.AreaBackground,
        });

        this.content_area.css({
            "position": "absolute",
            "top": 0,
            "left": this.tab_area_size,
            "bottom": 0,
            "right": 0,
            "background": Dash.Color.GetOpposite(this.color).Background,
        });

        this.tab_area.css({
            "display": "flex",
            "flex-direction": "column",
            "position": "absolute",
            "top": 0,
            "left": 0,
            "bottom": 0,
            "width": this.tab_area_size
        });

        this.tab_top.css({
            "width": this.tab_area_size
        });

        this.tab_middle.css({
            "margin-top": Dash.Size.Padding * 0.2,
            "margin-bottom": Dash.Size.Padding * 0.2,
            "flex-grow": 2,
            "overflow-y": "auto",
            "width": this.tab_area_size
        });

        this.tab_bottom.css({
            "width": this.tab_area_size
        });

        this.tab_area.append(this.tab_top);
        this.tab_area.append(this.tab_middle);
        this.tab_area.append(this.tab_bottom);

        this.html.append(this.content_area);
        this.html.append(this.tab_area);
    };

    this.set_styles_for_top_tabs = function () {
        this.html.css({
            "position": "absolute",
            "inset": 0,
            "background": this.color.Tab.AreaBackground
        });

        this.list_backing.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "height": this.tab_area_size
        });

        this.tab_top.css({
            "position": "absolute",
            "left": 0,
            "right": 0,
            "top": 0,
            "display": "flex",
            "height": this.tab_area_size
        });

        this.tab_bottom.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "display": "flex",
            "height": this.tab_area_size
        });

        // The right side / non-tab area / content
        this.content_area.css({
            "position": "absolute",
            "inset": 0,
            "overflow-y": "auto",
            // "background": Dash.Color.GetOpposite(this.color).Background,
            "background": this.color.Background,
            "top": this.tab_area_size
        });

        this.html.append(this.list_backing);
        this.html.append(this.tab_top);
        this.html.append(this.tab_bottom);
        this.html.append(this.content_area);
    };

    this.load_last_selection = function () {
        if (parseInt(this.selected_index) !== -1) {
            // A selection was already made externally
            return;
        }

        if (this.all_content.length === 0) {
            return;
        }

        if (this.always_start_on_first_tab) {
            this.LoadIndex(0);

            return;
        }

        var last_index = parseInt(Dash.Local.Get("sidebar_index_" + this.recall_id)) || 0;

        if (last_index > this.all_content.length - 1) {
            last_index = 0;
        }

        this.LoadIndex(last_index);
    };

    this._add = function (label_text, content_div_html_class, anchor_div, optional_args=null, additional_content_data={}) {
        var content_data = {
            "label_text": label_text,
            "content_div_html_class": content_div_html_class,
            "button": null,

            // Any extra arg to pass to the class (if it's an array, it can be unpacked by passing "unpack_params": true (in additional_content_data))
            "optional_args": optional_args,

            // Extra data that doesn't belong in optional_args (since optional_args gets sent to the callback)
            ...additional_content_data
        };

        (function (self, index) {
            var style = self.side_tabs ? "tab_side" : "tab_top";

            content_data["button"] = new Dash.Gui.Button(
                label_text,                         // Label
                function () {                       // Callback
                    self.LoadIndex(index, true);
                },
                self,                               // Binder
                self.color,                         // Dash Color Set
                {"style": style}                    // Options
            );
        })(this, this.all_content.length);

        anchor_div = anchor_div || this.tab_top;

        anchor_div.append(content_data["button"].html);

        this.all_content.push(content_data);

        return content_data["button"];
    };

    this.setup_styles();
}
