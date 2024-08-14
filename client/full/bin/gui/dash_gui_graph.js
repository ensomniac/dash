class DashGuiGraph {

    constructor (graph_id_or_options=null) {

        this.options = {};

        if (typeof(graph_id_or_options) === "object") {
            this.options = graph_id_or_options;
            this.graph_id = this.options["graph_id"];
        }
        else {
            this.graph_id = graph_id_or_options;
        };

        this.app = null;
        this.api = null;
        this.check_save = false;
        this.save_initialized = false;
        this.last_json = null;
        this.needs_save = false;
        this.initially_loaded = false;

        this.data = {};
        this.data["id"] = this.graph_id;
        this.data["elements"] = [];
        this.data["app_state"] = {};

        this.html     = $("<div>Graph</div>");

        this.setup_styles();
        Dash.SetInterval(this,  this.get_scene_data, 5000);
        Dash.SetInterval(this,  this.manage_save, 500);
        Dash.SetInterval(this,  this.save_trigger, 2000);

    };

    manage_save () {

        if (!this.check_save) {
            return;
        };

        // var scene_elements = this.api.getSceneElements();
        // var app_state      = this.api.getSceneElements();

        this.data["elements"] = this.api.getSceneElements();
        this.data["app_state"] = this.api.getAppState();

        if (!this.last_json) {
            this.last_json = ExcalidrawLib.serializeAsJSON(this.data["elements"], this.data["app_state"]);
        };

        var json = ExcalidrawLib.serializeAsJSON(this.data["elements"], this.data["app_state"]);

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

        if (!this.needs_save) {
            return;
        };

        console.log("[TRIGGER] SAVE TO SERVER");
        this.needs_save = false;

        var params         = {};
        params["f"]        = "excalidraw";
        params["graph_id"] = this.graph_id;
        params["set_scene_data"] = true;
        params["scene_data_json"] = JSON.stringify(this.data);

        Dash.Request(
            this,
            this.on_data,
            "Api",
            params
        );

    };

    on_saved (result) {
        console.log("** ON SAVE **")
        console.log(result)
    };

    get_scene_data () {

        var params         = {};
        params["f"]        = "excalidraw";
        params["graph_id"] = this.graph_id;
        params["get_scene_data"] = true;

        Dash.Request(
            this,
            this.on_data,
            "Api",
            params
        );

    };

    on_data (response) {
        console.log("ON SCENE DATA!!!")
        console.log(response);

        if (response["version"]) {
            this.data = response;

            if (!this.initially_loaded) {
                this.load_scene_data(this.data["elements"], this.data["app_state"]);
            };

        };

    };

    on_excalidraw_api (api) {
        // This is called when everything is finally loaded
        this.api = api;
        this.load_scene_data();
    };

    on_change (elements, app_state, files) {
        // console.log("ON CHANGE", elements, app_state, files);
        // console.log(elements)
        this.check_save = true;
    };

    load_scene_data (elements, app_state, files) {

        if (!this.api) {
            console.log("Api not loaded yet");
            return;
        };

        console.log("version", this.data["version"])

        if (!this.data["version"]) {
            console.log("Data not ready yet");
            return;
        };

        console.log("LOADING SCENE", this.data["version"]);

        var scene_data = {
          elements: elements,
          // appState: app_state,
        };

        // var scene_data = {
        //   elements: [
        //     {
        //       type: "rectangle",
        //       version: 141,
        //       versionNonce: 361174001,
        //       isDeleted: false,
        //       id: "oDVXy8D6rom3H1-LLH2-f",
        //       fillStyle: "hachure",
        //       strokeWidth: 1,
        //       strokeStyle: "solid",
        //       roughness: 1,
        //       opacity: 100,
        //       angle: 0,
        //       x: 100.50390625,
        //       y: 93.67578125,
        //       strokeColor: "#c92a2a",
        //       backgroundColor: "transparent",
        //       width: 186.47265625,
        //       height: 141.9765625,
        //       seed: 1968410350,
        //       groupIds: [],
        //       boundElements: null,
        //       locked: false,
        //       link: null,
        //       updated: 1,
        //       roundness: {
        //         type: 3,
        //         value: 32,
        //       },
        //     },
        //   ],
        //   appState: {
        //     viewBackgroundColor: "#edf2ff",
        //   },
        // };

        console.log(scene_data)

        this.api.updateScene(scene_data);
        this.last_json = ExcalidrawLib.serializeAsJSON(this.api.getSceneElements(), this.api.getAppState());

        if (!this.initially_loaded) {
            console.log("INITIALLY LOADED >>>");
            this.initially_loaded = true;
        };

    };

    setup_styles () {

        this.html.css({
            "background": "orange",
            "color": "black",
            "left":   0,
            "right":  0,
            "top":    0,
            "bottom": 0,
            "height": "100%",
        });

        var js_path = "dash/dist/excalidraw/excalidraw.production.min.js";

        this.load_react_p1();

    };

    load_react_p1 () {

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react/umd/react.production.min.js";

        (function(self, script){

            script.onload = function() {
                self.load_react_p2();
            };

        })(this, script);

        script.onerror = function() {
            console.error("Failed to load Dash.Gui.Graph -> React p1");
        };

        document.head.appendChild(script);

    };

    load_react_p2 () {

        var script = document.createElement("script");
        script.src = "https://unpkg.com/react-dom/umd/react-dom.production.min.js";

        (function(self, script){

            script.onload = function() {
                self.load_excalidraw_module();
            };

        })(this, script);

        script.onerror = function() {
            console.error("Failed to load Dash.Gui.Graph -> React p2");
        };

        document.head.appendChild(script);

    };

    load_excalidraw_module () {

        console.log("load_excalidraw_module");


        var script = document.createElement("script");
        script.src = "dash/dist/excalidraw/excalidraw.production.min.js";

        (function(self, script){

            script.onload = function() {
                self.on_excalidraw_loaded(script);
            };


        })(this, script);

        script.onerror = function() {
            console.error("Failed to load Dash.Gui.Graph -> React p2");
        };

        document.head.appendChild(script);

    };

    on_excalidraw_loaded () {

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
                      excalidrawAPI: function(api){self.on_excalidraw_api(api)},
                      onChange:      function(e, a, f){self.on_change(e, a, f)},
                  }),
                ),
              );
            };

        })(this);

        var root = ReactDOM.createRoot(this.html[0]);
        root.render(React.createElement(this.app));

    };

}
