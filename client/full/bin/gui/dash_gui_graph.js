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
        this.check_save       = false;
        this.save_initialized = false;
        this.last_json        = null;
        this.needs_save       = false;
        this.initially_loaded = false;
        this.load_dots        = null;
        this.max_version      = 0;

        this.data = {};
        this.data["id"]        = this.graph_id;
        this.data["version"]   = 0;
        this.data["elements"]  = [];
        this.data["app_state"] = {};

        this.html             = $("<div></div>");
        this.excalidraw_layer = $("<div></div>");

        this.setup_styles();

        Dash.SetInterval(this,  this.get_scene_data, 2000);
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

        this.load_excalidraw_p1();

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

    save_trigger () {

        if (!this.needs_save || !this.api) {
            return;
        };

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

        this.load_dots.Stop();
        this.load_scene_data();

        this.excalidraw_layer.stop().animate({"opacity": 1}, 500);
        this.initially_loaded = true;

    };

    on_change (elements, app_state, files) {
        // console.log("ON CHANGE", elements, app_state, files);
        // console.log(elements)
        this.check_save = true;
    };

    load_scene_data () {

        var scene_data = {
            elements: this.data["elements"],
            appState: this.data["app_state"],
        };

        this.max_version = this.data["version"];

        this.api.resetScene();

        this.api.updateScene(scene_data);
        this.last_json = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());

    };

    load_excalidraw_p1 () {

        window.EXCALIDRAW_ASSET_PATH = "dash/dist/excalidraw/";

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react/umd/react.production.min.js";

        (function(self, script){

            script.onload = function() {
                self.load_excalidraw_p2();
            };

        })(this, script);

        script.onerror = function() {
            console.error("Failed to load Dash.Gui.Graph -> React p1");
        };

        document.head.appendChild(script);

    };

    load_excalidraw_p2 () {

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react-dom/umd/react-dom.production.min.js";

        (function(self, script){

            script.onload = function() {
                self.load_excalidraw_p3();
            };

        })(this, script);

        script.onerror = function() {
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

        script.onerror = function() {
            console.error("Failed to load Dash.Gui.Graph -> React p2");
        };

        document.head.appendChild(script);

    };

    load_excalidraw_p4 () {

        this.app = null;

        (function(self){

            self.app = () => {
              return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "div",
                  {
                    style: {height: "100%"},
                  },
                  React.createElement(ExcalidrawLib.Excalidraw, {
                      excalidrawAPI: function(api){self.load_excalidraw_p5(api)},
                      onChange:      function(e, a, f){self.on_change(e, a, f)},
                  }),
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
