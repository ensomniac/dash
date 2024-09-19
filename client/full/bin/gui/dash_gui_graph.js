class DashGuiGraph {

    constructor (graph_id_or_options=null) {

        if (typeof(graph_id_or_options) === "object") {
            this.options = graph_id_or_options;
        }
        else {
            this.options = {};
            this.options["graph_id"] = graph_id_or_options;
        };

        this.options["binder"] = this.options["binder"] || null;
        this.options["color"]  = this.options["color"]  || Dash.Color.Light;

        this.graph_id = this.options["graph_id"];
        this.color    = this.options["color"];

        this.app              = null;
        this.api              = null;
        this.fonts_ready      = false;
        this.check_save       = false;
        this.save_initialized = false;
        this.last_json        = null;
        this.needs_save       = false;
        this.initially_loaded = false;
        this.load_dots        = null;
        this.max_version      = 0;
        this.active_editing   = false;
        this.active_editing_timeout = null;

        this.data = {};
        this.data["id"]        = this.graph_id;
        this.data["version"]   = 0;
        this.data["elements"]  = [];
        this.data["app_state"] = {};

        this.html             = $("<div></div>");
        this.excalidraw_layer = $("<div></div>");

        this.setup_styles();

        Dash.SetInterval(this,  this.get_scene_data, 3000);
        Dash.SetInterval(this,  this.manage_save,    500);
        Dash.SetInterval(this,  this.save_trigger,   2000);

    };

    setup_styles () {

        this.load_dots = new Dash.Gui.LoadDots();
        this.html.append(this.load_dots.html);
        this.html.append(this.excalidraw_layer);
        this.load_dots.Start();

        this.load_dots.html.css({
            "margin-left": "auto",
            "margin-right": "auto",
        });

        this.html.css({
            "background": this.color.Background,
            "color":      this.color.Text,
            "left":       0,
            "right":      0,
            "top":        0,
            "bottom":     0,
            "height":     "100%",
        });

        this.excalidraw_layer.css({
            "position": "absolute",
            "color":      this.color.Text,
            "left":       0,
            "right":      0,
            "top":        0,
            "bottom":     0,
            "margin":     0,
            "padding":    0,
            "opacity":    0.0,
        });

        this.load_excalidraw();

    };

    manage_save () {

        if (!this.check_save || !this.api) {
            return;
        };

        if (!this.last_json) {
            this.last_json = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());
        };

        var json = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());

        if (json === this.last_json) {
            this.last_json = json;
            this.check_save = false;
            return;
        };

        this.check_save       = false;
        this.last_json        = json;

        if (!this.save_initialized) {
            this.save_initialized = true;
            return;
        };

        this.needs_save = true;

    };

    mark_editing_start () {

        this.active_editing = true;

        if (this.active_editing_timeout) {
            clearTimeout(this.active_editing_timeout);
            this.active_editing_timeout = null;
        };

        (function (self) {

            self.active_editing_timeout = setTimeout(function () {
                self.active_editing_timeout = null;
                self.active_editing         = false;
            }, 8000);

        })(this);

    };

    save_trigger () {

        if (!this.needs_save || !this.api) {
            return;
        };

        this.mark_editing_start();

        console.log("Saving to server...");

        this.needs_save = false;

        this.data["version"] += 1;

        if (this.data["version"] > this.max_version) {
            this.max_version = this.data["version"];
        };

        var params         = {};
        params["f"]        = "excalidraw";
        params["graph_id"] = this.graph_id;
        params["set_scene_data"] = true;
        params["scene_data_json"] = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());
        this.last_json = params["scene_data_json"];

        Dash.Request(
            this,
            this.on_saved,
            "Api",
            params
        );

    };

    on_saved (result) {
        console.log("\tSave complete.", result);
    };

    get_scene_data () {

        var params         = {};
        params["f"]        = "excalidraw";
        params["graph_id"] = this.graph_id;
        params["get_scene_data"] = true;

        Dash.Request(
            this,
            this.on_scene_data,
            "Api",
            params
        );

    };

    on_scene_data (response) {

        if (!response["version"]) {

            console.log("ERROR: Problem receiving scene data from server...")
            console.log(response);

            return;
        };

        var current_version = this.data["version"];

        this.data = response;

        if (!this.initially_loaded) {
            this.check_initial_load_state();
            return;
        };

        if (this.data["version"] > current_version && this.data["version"] > this.max_version) {

            console.log("** Auto update from " + current_version + " to " + this.data["version"]);

            if (this.data["version"] > this.max_version) {
                this.max_version = this.data["version"];
            };

            this.load_scene_data();

        };

    };

    check_initial_load_state () {
        // Make sure we have both server data and the
        // module loaded before actually loading

        if (this.initially_loaded || this.data["version"] < 1) {
            // We don't have server data yet
            return;
        };

        if (!this.api) {
            // The api isn't loaded yet
            return;
        };

        this.initially_loaded = true;

        (function (self) {

            setTimeout(function () {
                self.load_dots.Stop();
                self.excalidraw_layer.stop().animate({"opacity": 1}, 500);
                self.load_scene_data();
            }, 250);

            setTimeout(function () {
                ExcalidrawLib.restoreElements(self.data["elements"]);
            }, 500);

            setTimeout(function () {
                ExcalidrawLib.restoreElements(self.data["elements"]);
            }, 1500);

        })(this);

    };

    on_change (elements, app_state, files) {

        if (!this.api || !this.initially_loaded) {
            return;
        };

        this.check_save = true;

    };

    load_scene_data () {

        if (this.active_editing) {
            console.log("Debug: Skipping auto-update because of active editing");
            return;
        };

        var scene_data = {
            elements: this.data["elements"],
            appState: this.data["app_state"],
        };

        this.max_version = this.data["version"];

        ExcalidrawLib.restoreElements(this.data["elements"]);

        this.api.updateScene(scene_data);
        this.last_json = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());

    };

    load_excalidraw () {

        var font_path = "dash/dist/excalidraw/excalidraw-assets/Virgil.woff2";
        var font = new FontFace("Virgil", `url(${font_path})`);

        (function (self) {

            font.load().then(function (loadedFont) {
                document.fonts.add(loadedFont);
                self.fonts_ready = true;
                self.load_excalidraw_p1();
            }).catch(function (error) {
                console.error('Font loading failed:', error);
            });

        })(this);

    };

    load_excalidraw_p1 () {

        window.EXCALIDRAW_ASSET_PATH = "dash/dist/excalidraw/";

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react/umd/react.production.min.js";

        (function (self, script) {

            script.onload = function () {
                self.load_excalidraw_p2();
            };

        })(this, script);

        script.onerror = function () {
            console.error("Failed to load Dash.Gui.Graph -> React p1");
        };

        document.head.appendChild(script);

    };

    load_excalidraw_p2 () {

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react-dom/umd/react-dom.production.min.js";

        (function (self, script) {

            script.onload = function () {
                self.load_excalidraw_p3();
            };

        })(this, script);

        script.onerror = function () {
            console.error("Failed to load Dash.Gui.Graph -> React p2");
        };

        document.head.appendChild(script);

    };

    load_excalidraw_p3 () {

        var script = document.createElement("script");
        script.src = "dash/dist/excalidraw/excalidraw.production.min.js";

        script.onload = () => {
            this.load_excalidraw_p4(script);
        }

        script.onerror = function () {
            console.error("Failed to load Dash.Gui.Graph -> React p2");
        };

        document.head.appendChild(script);

    };

    on_clear_canvas () {

        if (!window.confirm("Clear the canvas?")) {
            console.log("not today!")
            return;
        };

        this.api.resetScene();

    };

    inject_custom_css() {
        // As of Aug 16 '24 this isn't quite working yet
        // but I am leaving it here to revisit... <3 Ryan

        var style = document.createElement("style");

        style.innerHTML = `
            .custom-styles .excalidraw {
                --color-primary: #ffffff;
                --color-primary-darker: #f783ac;
                --color-primary-darkest: #e64980;
                --color-primary-light: #f2a9c4;
                --color-disabled: #ffffff;
            }

            .custom-styles .excalidraw.theme--dark {
                --color-primary: red;
                --color-primary-darker: #d64c7e;
                --color-primary-darkest: #e86e99;
                --color-primary-light: #dcbec9;
                --color-disabled: #ffffff;
            }
        `;

        document.head.appendChild(style);

    };

    load_excalidraw_p4 () {

        this.inject_custom_css();

        this.app = null;

        this.ui_options = {};
        this.ui_options["canvasActions"] = {};
        this.ui_options["canvasActions"]["changeViewBackgroundColor"] = true;
        this.ui_options["canvasActions"]["clearCanvas"]      = false;
        this.ui_options["canvasActions"]["export"]           = false;
        this.ui_options["canvasActions"]["loadScene"]        = false;
        this.ui_options["canvasActions"]["saveToActiveFile"] = false;
        this.ui_options["canvasActions"]["toggleTheme"]      = false;
        this.ui_options["canvasActions"]["saveAsImage"]      = false;

        this.ui_options["tools"] = {};
        this.ui_options["tools"]["image"] = false;

        (function (self) {

            var clear_item = React.createElement(
                ExcalidrawLib.MainMenu.Item,
                {
                    shortcut: "Clear All",
                    onSelect: function () {self.on_clear_canvas()},
                }
            );

            var test_url_item = React.createElement(
                ExcalidrawLib.MainMenu.ItemLink,
                {
                    shortcut: "Test Link",
                    href: "https://www.ensomniac.com",
                }
            );

            var main_menu_style = React.createElement(
                  "div", {style: {width: Dash.Size.ColumnWidth}},
                  clear_item,
                  test_url_item,
            );

            var main_menu = React.createElement(

                ExcalidrawLib.MainMenu, {},
                main_menu_style,

            );

            self.app = () => {
              return React.createElement(
                React.Fragment,
                null,
                React.createElement(

                  "div",
                  {style: {height: "100%"}, className: "custom-styles"},




                  React.createElement(ExcalidrawLib.Excalidraw, {
                      excalidrawAPI: function (api) {self.load_excalidraw_p5(api)},
                      onChange:      function (e, a, f) {self.on_change(e, a, f)},
                      UIOptions:     self.ui_options,
                  },
                      main_menu,
                  ),
                ),
              );
            };

        })(this);

        var root = ReactDOM.createRoot(this.excalidraw_layer[0]);
        root.render(React.createElement(this.app));

    };

    load_excalidraw_p5 (api) {
        // This is called when all modules are finally loaded

        this.api = api;

        if (!this.initially_loaded) {
            this.check_initial_load_state();
        };

    };

}
