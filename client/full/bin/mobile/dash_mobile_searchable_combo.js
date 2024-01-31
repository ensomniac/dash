function DashMobileSearchableCombo (
    color=null, options={}, placeholder_text="", binder=null, on_submit_cb=null, on_change_cb=null
) {
    this.color = color || (binder && binder.color ? binder.color : Dash.Color.Light);
    this.options = options;  // Format: {id: label}
    this.placeholder_text = placeholder_text;
    this.binder = binder;
    this.on_submit_cb = binder && on_submit_cb ? on_submit_cb.bind(binder) : on_submit_cb;
    this.on_change_cb = binder && on_change_cb ? on_change_cb.bind(binder) : on_change_cb;

    this.label = null;
    this.disabled = false;
    // this.option_rows = [];
    this.clear_button = null;
    // this.on_change_delay_ms = 0;
    this.html = $("<div></div>");
    // this.on_change_timeout = null;
    this.id = "DashMobileSearchableCombo_" + Dash.Math.RandomID();
    this.datalist = $("<datalist></datalist", {"id": this.id});

    this.input = $(
        "<input/>",
        {
            "list": this.id,
            "class": this.color.PlaceholderClass,
            "placeholder": this.placeholder_text,
            "inputmode": "search"
        }
    );

    this.setup_styles = function () {
        var shared_css = {
            "box-sizing": "border-box",
            "color": this.color.Text,
            "border-radius": Dash.Size.BorderRadius * 0.5
        };

        this.html.css({
            "height": Dash.Size.RowHeight,
            "border": "1px solid " + this.color.Stroke,
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            ...shared_css
        });

        this.input.css({
            "height": Dash.Size.RowHeight - 2,  // Account for border
            ...shared_css
        });

        this.set_width("100%", true);
        this.add_options();

        this.html.append(this.datalist);
        this.html.append(this.input);

        this.setup_connections();
    };

    this.GetID = function (allow_none=true) {
        var label = this.GetLabel();

        for (var id in this.options) {
            if (this.options[id].toString().toLowerCase() === label.toString().toLowerCase()) {
                if (id === "none" && !allow_none) {
                    return null;
                }

                return id;
            }
        }

        return null;
    };

    this.GetLabel = function () {
        return this.input.val();
    };

    this.SetLabel = function (text) {
        this.input.val(text);
    };

    this.SetLabelByID = function (id) {
        if (!(id in this.options)) {
            Dash.Log.Warn("ID not in options:", id);

            return;
        }

        this.SetLabel(this.options[id]);
    };

    this.SetOnChangeDelayMs = function (ms) {
        this.on_change_delay_ms = parseInt(ms);
    };

    this.GetOptions = function () {
        return this.options;
    };

    this.SetOptions = function (options={}) {
        this.datalist.empty();

        this.options = options;

        this.add_options();
    };

    this.AddOption = function (id, label, _check=true, _from_filter=false) {
        if (!_from_filter) {
            if (_check && this.options[id]) {
                return;
            }

            this.options[id] = label;
        }

        // Unlike the select element, the datalist does not allow option elements
        // to contain both a value and a label, so for us to get the ID after a
        // selection is made, we loop through the options and match the current value (label)
        var row = $("<option></option>",{"value": label});

        row.css({
            "height": Dash.Size.RowHeight
        });

        // if (!_from_filter) {
        //     this.option_rows.push(row);
        // }

        this.datalist.append(row);
    };

    this.EnableResetInvalidOnBlur = function () {
        (function (self) {
            self.input.on("blur", function () {
                if (!self.GetID()) {
                    self.input.val("");
                }
            });
        })(this);
    };

    this.AddLabel = function (text) {
        if (this.label) {
            return this.label;
        }

        this.label = $("<div>" + text + "</div>");

        this.label.css({
            "position": "absolute",
            "font-family": "sans_serif_bold",
            "font-size": "80%",
            "color": this.color.StrokeLight,
            "top": -Dash.Size.Padding * 0.8,
            "left": Dash.Size.Padding * 0.1
        });

        this.html.append(this.label);

        return this.label;
    };

    this.AddClearButton = function () {
        if (this.clear_button) {
            return this.clear_button;
        }

        (function (self) {
            self.clear_button = new Dash.Gui.IconButton(
                "close_circle",
                function () {
                    self.SetLabel("");

                    requestAnimationFrame(function () {
                        self.input.trigger("focus");
                        self.input.trigger("click");
                    });
                },
                self,
                self.color,
                {
                    "container_size": Dash.Size.RowHeight,
                    "size_mult": 0.6
                }
            );
        })(this);

        this.clear_button.SetIconColor(Dash.Color.Mobile.AccentPrimary);

        this.clear_button.html.css({
            "position": "absolute",
            "top": 0,
            "right": -(Dash.Size.Padding * 1.9)
        });

        this.set_width("calc(100% - " + (Dash.Size.Padding * 1.4) + "px)");

        this.html.append(this.clear_button.html);

        return this.clear_button;
    };

    // There might be a better way to do this for a datalist element, but
    // this is a quick thing for now since I have limited time
    // - maybe update later, maybe not a big deal
    this.Disable = function (opacity=0.5) {
        if (this.disabled) {
            return;
        }

        this.disabled = true;

        this.html.css({
            "opacity": opacity,
            "pointer-events": "none",
            "user-select": "none"
        });
    };

    this.Enable = function () {
        if (!this.disabled) {
            return;
        }

        this.disabled = false;

        this.html.css({
            "opacity": 1,
            "pointer-events": "auto",
            "user-select": "auto"
        });
    };

    this.set_width = function (width, set_input=false, min_width=null, max_width=null) {
        var css = {
            "width": width,
            "min-width": min_width || width,
            "max-width": max_width || width
        };

        this.html.css(css);

        if (set_input) {
            this.input.css(css);
        }
    };

    this.add_options = function (_from_filter=false) {
        for (var id in this.options) {
            this.AddOption(id, this.options[id], false, _from_filter);
        }
    };

    // Datalists have their own built-in native filtering, but it returns matches
    // for anything that includes the characters typed in the input, so this
    // overwrites it. For example, typing the letter "m" should (typically) return
    // results that start with "m", but datalists return any result that includes
    // the letter "m", which doesn't feel logical to the user, in most cases.
    this.filter_datalist = function () {
        var id;
        var label;
        var added_ids = [];
        var search_text = this.GetLabel().toLocaleLowerCase("en-US");

        // As of writing, this doesn't seem necessary for performance, even
        // with very long lists drawing 1000 results without any noticeable
        // lag. If performance is an issue at any point, this should be the
        // first place to start. If moving forward with this in the future,
        // at the very least, need to display a little tag that says something
        // like "showing top 50 results" when the limit is hit, so it's
        // clear that not every potential match is shown. To do it right,
        // we'd need to also offer a way to load more, or load all, etc.
        var max_results = 0;  // 100;

        // Currently, we're emptying the datalist, then creating and appending new options for
        // the included options. If performance becomes an issue, we can try detaching all the
        // options instead and manage which one's get re-appended each time, similar to what
        // we do in the non-mobile combo on search.
        this.datalist.empty();

        // Show everything, to retain the functionality of being able to use the dropdown instead of search
        if (!search_text) {
            // This does not work. No matter what I've tried, blur, refocus, click, reclick, timeout,
            // anim frame, remove, re-append - nothing successfully redraws the list to the original
            // version with all the options in the original order. After digging, it seems a user
            // action is required for some reason, which I confirmed after manually blurring/refocusing.
            // Super frustrating and annoying, but it appears there's nothing to be done here.
            this.add_options(true);
            this.trigger_reclick();

            return;
        }

        // This logic is the same as the logic in DashGuiComboSearch.on_search_text_changed,
        // so if any logic is added here, be sure to mirror that there as well.

        // First, list options that start with the input text
        for (id in this.options) {
            label = (this.options[id] || "").toString();

            if (!label.length || !label.toLocaleLowerCase("en-US").startsWith(search_text)) {
                continue;
            }

            this.AddOption(id, label, false, true);

            added_ids.push(id);

            if (max_results && added_ids.length >= max_results) {
                return;
            }
        }

        // Below those options, list options that don't start with the input text, but contain it
        for (id in this.options) {
            if (added_ids.includes(id)) {
                continue;
            }

            label = (this.options[id] || "").toString();

            if (!label.length || !label.toLocaleLowerCase("en-US").includes(search_text)) {
                continue;
            }

            this.AddOption(id, label, false, true);

            added_ids.push(id);

            if (max_results && added_ids.length >= max_results) {
                return;
            }
        }
    };

    // this.on_change = function () {
    //     if (!this.on_change_delay_ms) {
    //         this.filter_datalist();
    //
    //         if (this.on_change_cb) {
    //             this.on_change_cb();
    //         }
    //
    //         return;
    //     }
    //
    //     if (this.on_change_timeout) {
    //         clearTimeout(this.on_change_timeout);
    //
    //         this.on_change_timeout = null;
    //     }
    //
    //     (function (self) {
    //         self.on_change_timeout = setTimeout(
    //             function () {
    //                 self.filter_datalist();
    //
    //                 if (self.on_change_cb) {
    //                     self.on_change_cb();
    //                 }
    //             },
    //             self.on_change_delay_ms
    //         );
    //     })(this);
    // };

    this.setup_connections = function () {
        (function (self) {
            self.input.on("change", function () {
                // Since this is linked to the datalist, the change event only triggers
                // when a selection is made, whether that's by clicking an option or
                // typing an option and selecting it using the arrow keys and enter key
                if (self.on_submit_cb) {
                    var id = self.GetID();

                    if (id) {
                        self.on_submit_cb(id);
                    }
                }
            });

            self.input.on("input", function () {
                // Since we're overriding the datalist's default filtering and
                // that default filtering doesn't get delayed, delaying the
                // custom filtering causes both default and custom filtering to
                // occur, which is visibly noticeable. This doesn't appear to
                // be necessary anyway for performance, so not a big deal.
                // self.on_change();

                self.filter_datalist();

                if (self.on_change_cb) {
                    self.on_change_cb();
                }
            });

            self.input.on("click", function (event, reclick=false) {
                if (reclick) {
                    // Force redraw of datalist
                    // self.option_rows.Last().detach();
                    //
                    // requestAnimationFrame(function () {
                    //     self.datalist.append(self.option_rows.Last());
                    // });

                    return;
                }

                self.trigger_reclick();
            });
        })(this);
    };

    this.trigger_reclick = function () {
        (function (self) {
            setTimeout(
                function () {
                    // If the list is long, the list will cover the virtual keyboard unless re-clicked after initial draw
                    self.input.trigger("focus");
                    self.input.trigger("click", [true]);
                },
                300
            );
        })(this);
    };

    this.setup_styles();
}
