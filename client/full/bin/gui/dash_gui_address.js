/**
 * Address input element that uses the Google Places API for autocomplete and address lookup via geocoding.
 * --------------------------
 *
 * REQUIREMENTS IN GOOGLE CLOUD CONSOLE: <br>
 *  - Enable Places API
 *  - Enable Places API (New)
 *  - Enable Maps JavaScript API
 *  - Enable Geocoding API
 *  - Create an API key, restrict it to this specific website
 *    (ex: https://analog.technology), and restrict it to the three APIs above
 *
 * TO ENABLE: <br>
 *  - Add script to index.html, replacing API_KEY with your API key:
 *    <script src="https://maps.googleapis.com/maps/api/js?key={API_KEY}
 *     &libraries=places&loading=async" async defer></script>
 *
 * @param {string} label_text - Text for label preceding input (default="")
 * @param {function} binder - Binder for on_submit_cb (default=null)
 * @param {function} on_submit_cb - Callback for non-autocomplete submission (default=null)
 * @param {DashColorSet} color - DashColorSet instance (default=null)
 * @param {boolean} international - Include and allow international addresses (default=false)
 * @param {string} placeholder_text - Placeholder text for input (default="Start typing an address to search...")
 */
class DashGuiAddress extends DashGuiInputType {
    constructor (
        label_text="",
        binder=null,
        on_submit_cb=null,
        color=null,
        international=false,
        placeholder_text="Start typing an address to search...",
        include_tip_icon=true
    ) {
        super(
            $("<input>", {"placeholder": placeholder_text}),
            label_text,
            null,
            () => {
                this.on_submit_timer = setTimeout(
                    () => {
                        this._on_submit();
                    },
                    500
                );
            },
            null,
            null,
            color,
            false
        );

        this._on_submit_cb = (on_submit_cb && binder ? on_submit_cb.bind(binder) : on_submit_cb);
        this.international = international;
        this.include_tip_icon = include_tip_icon;
        this.placeholder_text = placeholder_text;

        this.geocoder = null;
        this.tip_icon = null;
        this.map_link_url = "";
        this.on_submit_timer = null;
        this.formatted_address = "";
        this.map_link_button = null;
        this.address_components = {};
        this.last_selected_value = "";
        this.last_submitted_value = "";
        this.place_selection_pending = false;
        this.google_places_autocomplete = null;
        this.google_places_autocomplete_place = {};
        this.fallback_to_legacy_in_progress = false;
        this.google_places_autocomplete_listeners = [];
        this.google_places_autocomplete_is_new = false;

        this.tip_text = (
            "Start typing an address to search,\nthen select the corresponding address.\n\n" +
            "You can also freely enter any address if it's\nnot listed, though this will be uncommon.\n\n" +
            'More granular address details,\nsuch as "Suite 100", can be manually\nadded after selecting the address.'
        );

        // Ref: https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions
        this.legacy_autocomplete_options = {
            // Ref: https://developers.google.com/maps/documentation/javascript/supported_types#table3
            "types": ["geocode"],

            // *** KEEP THESE AS SPARSE AS POSSIBLE FOR BILLING ***
            // Ref: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
            "fields": [
                "address_components",
                "formatted_address",
                "url"
            ]
        };

        // For some reason, traditional function overriding is not working.
        // I can't figure it out, but it seems to have something to do with
        // this class being a proper class and DashGuiInputType and DashGuiInputBase
        // being function "classes". This is the only way I could get it to work.
        this.SetValue = this._set_value;
        this.parse_value = this._parse_value;
        this.on_set_locked = this._on_set_locked;

        this._setup_styles();
    }

    _setup_styles () {
        this.apply_input_styles();
        this.setup_autocomplete();
        this.add_icon();
        this.add_map_link_button();
    }

    GetString () {
        return this.formatted_address;
    }

    GetComponents () {
        return this.address_components;
    }

    apply_input_styles () {
        this.input.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "box-sizing": "border-box",
            "height": this.height,
            "width": "100%"
        });
    }

    add_icon () {
        if (!this.include_tip_icon) {
            this.refresh_autocomplete_dependent_ui();

            return;
        }

        this.tip_icon = new Dash.Gui.Icon(
            this.color,
            "map_marker",
            this.height,
            0.9,
            this.color.Stroke
        );

        this.tip_icon.html.css({
            "margin-right": Dash.Size.Padding * 0.3
        });

        this.html.prepend(this.tip_icon.html);

        this.refresh_autocomplete_dependent_ui();
    }

    setup_autocomplete () {
        // Ref: https://developers.google.com/maps/documentation/javascript/reference/places-widget#PlaceAutocompleteElementOptions
        var place_autocomplete_options = {
            "includedPrimaryTypes": ["geocode"],
            "noInputIcon": true,
            "placeholder": this.placeholder_text
        };

        if (!this.international) {
            this.legacy_autocomplete_options["componentRestrictions"] = {"country": "us"};

            place_autocomplete_options["includedRegionCodes"] = ["US"];
            place_autocomplete_options["requestedRegion"] = "US";
        }

        else {
            // TODO: Resolve the other international TODOs in this code first
            console.error("Error: International address support has not yet been implemented.");

            return;
        }

        // The API key won't be authorized for this scope, so it'll fail to initialize
        if (Dash.LocalDev && !Dash.AdminEmails.includes(Dash.User.Init["email"])) {
            return;
        }

        try {
            if (google.maps.places.PlaceAutocompleteElement) {
                this.setup_place_autocomplete_element(
                    google.maps.places.PlaceAutocompleteElement,
                    place_autocomplete_options
                );

                return;
            }

            if (google.maps.importLibrary) {
                this.setup_place_autocomplete_element_async(place_autocomplete_options, this.legacy_autocomplete_options);

                return;
            }
        }

        catch {
            // Pass
        }

        this.setup_legacy_autocomplete(this.legacy_autocomplete_options);
    }

    setup_place_autocomplete_element_async (place_autocomplete_options, legacy_options) {
        google.maps.importLibrary("places").then((places) => {
            if (places.PlaceAutocompleteElement) {
                this.setup_place_autocomplete_element(places.PlaceAutocompleteElement, place_autocomplete_options);
            }

            else {
                this.setup_legacy_autocomplete(legacy_options);
            }
        }).catch(() => {
            this.setup_legacy_autocomplete(legacy_options);
        });
    }

    setup_place_autocomplete_element (PlaceAutocompleteElement, options) {
        var current_value = this.input.val();
        var place_autocomplete = new PlaceAutocompleteElement(options);

        this.google_places_autocomplete = place_autocomplete;
        this.google_places_autocomplete_is_new = true;

        this.setup_place_autocomplete_legacy_adapter(place_autocomplete);
        this.replace_input(place_autocomplete, current_value);
        this.setup_place_autocomplete_styles();

        place_autocomplete.addEventListener("gmp-select", async (event) => {
            if (!event.placePrediction) {
                return;
            }

            this.place_selection_pending = true;

            if (this.on_submit_timer) {
                clearTimeout(this.on_submit_timer);

                this.on_submit_timer = null;
            }

            try {
                var place = event.placePrediction.toPlace();

                await place.fetchFields({
                    "fields": [
                        "addressComponents",
                        "formattedAddress",
                        "googleMapsURI"
                    ]
                });

                this.update_place_attrs(place, this.Text());

                this.last_selected_value = this.formatted_address;

                this.input.val(this.formatted_address);

                this._on_submit(true);
                this.notify_place_changed_listeners();
            }

            catch (error) {
                console.warn("Warn (google.maps.places.PlaceAutocompleteElement):\nFailed to fetch place fields.", error);
            }

            finally {
                this.place_selection_pending = false;
            }
        });

        place_autocomplete.addEventListener("gmp-error", (event) => {
            console.warn("Warn (google.maps.places.PlaceAutocompleteElement):\nAutocomplete request failed.", event);

            this.fallback_to_legacy_autocomplete();
        });

        this.refresh_autocomplete_dependent_ui();
    }

    setup_place_autocomplete_legacy_adapter (place_autocomplete) {
        place_autocomplete.getPlace = () => {
            return this.google_places_autocomplete_place || {};
        };

        place_autocomplete.addListener = (event_name, callback) => {
            if (event_name !== "place_changed") {
                return null;
            }

            this.google_places_autocomplete_listeners.push(callback);

            return {
                "remove": () => {
                    this.google_places_autocomplete_listeners = this.google_places_autocomplete_listeners.filter(
                        (listener) => listener !== callback
                    );
                }
            };
        };
    }

    replace_input (place_autocomplete, current_value="") {
        var previous_input = this.input;
        var prediction_colors = this.get_place_autocomplete_prediction_colors();

        previous_input.replaceWith(place_autocomplete);

        this.input = $(place_autocomplete);

        this.input.addClass("dash-google-address");

        this.setup_place_autocomplete_value_adapter(place_autocomplete);
        this.set_place_autocomplete_placeholder(place_autocomplete);
        this.apply_input_styles();

        this.input.css({
            "background": "none",
            "border": "none",
            "border-bottom": "1px solid " + this.color.PinstripeDark,
            "color": this.color.Text,
            "color-scheme": Dash.Color.IsDark(this.color) ? "dark" : "light",
            "flex": 2,
            "font-family": "sans_serif_normal",
            "font-size": "100%",
            "line-height": this.height + "px",
            "--dash-address-prediction-background": prediction_colors["background"],
            "--dash-address-prediction-border": prediction_colors["border"],
            "--dash-address-prediction-main-text": prediction_colors["main_text"],
            "--dash-address-prediction-primary": prediction_colors["primary"],
            "--dash-address-prediction-selected-background": prediction_colors["selected_background"],
            "--dash-address-prediction-text": prediction_colors["text"],
            "--gmp-mat-color-surface": prediction_colors["background"],
            "--gmp-mat-color-on-surface": prediction_colors["main_text"],
            "--gmp-mat-color-on-surface-variant": prediction_colors["text"],
            "--gmp-mat-color-primary": prediction_colors["primary"],
            "--gmp-mat-color-outline-decorative": prediction_colors["border"],
            "--gmp-mat-font-family": "sans_serif_normal"
        });

        if (current_value) {
            this.input.val(current_value);
        }

        this.setup_connections();

        this.input.on("input", () => {
            this.on_change();
        });

        if (this.locked) {
            this._on_set_locked(true);
        }
    }

    get_place_autocomplete_prediction_colors () {
        if (Dash.Color.IsDark(this.color)) {
            return {
                "background": this.get_place_autocomplete_solid_color(
                    this.color.BackgroundRaised || this.color.Background,
                    "#1f242c"
                ),
                "border": this.color.PinstripeDark || this.color.StrokeLight || "#4b5563",
                "main_text": this.color.Text || "#f2f2f2",
                "primary": this.color.Button?.Background?.Base || this.color.AccentGood || "#659cba",
                "selected_background": this.color.PinstripeDark || "rgba(255, 255, 255, 0.16)",
                "text": this.color.Stroke || this.color.Text || "#d7dce8"
            };
        }

        return {
            "background": this.get_place_autocomplete_solid_color(
                this.color.BackgroundRaised || this.color.Background,
                "#ffffff"
            ),
            "border": this.color.PinstripeDark || this.color.StrokeLight || "#9ba8b6",
            "main_text": this.color.Text || "#07112f",
            "primary": this.color.Button?.Background?.Base || this.color.AccentGood || "#659cba",
            "selected_background": "rgba(101, 156, 186, 0.18)",
            "text": this.color.StrokeDark || this.color.Text || "#39445c"
        };
    }

    get_place_autocomplete_solid_color (color, fallback) {
        if (
               !color
            || color === "none"
            || color === "transparent"
            || typeof color !== "string"
            || color.includes("gradient")
            || color.includes("var(")
        ) {
            return fallback;
        }

        try {
            var color_data = Dash.Color.Parse(color);

            if (
                   !color_data
                || isNaN(color_data[0])
                || isNaN(color_data[1])
                || isNaN(color_data[2])
            ) {
                return fallback;
            }

            return Dash.Color.ParseToRGBA(color, 1);
        }

        catch {
            return fallback;
        }
    }

    setup_place_autocomplete_styles () {
        var style_id = "dash-google-address-place-autocomplete-styles";

        if ($("#" + style_id).length) {
            return;
        }

        $("head").append(
            $("<style>", {
                "id": style_id,
                "text": `
                    gmp-place-autocomplete.dash-google-address {
                        border-radius: 0;
                        --gmp-mat-color-surface: var(--dash-address-prediction-background, #ffffff);
                        --gmp-mat-color-on-surface: var(--dash-address-prediction-main-text, #07112f);
                        --gmp-mat-color-on-surface-variant: var(--dash-address-prediction-text, #39445c);
                        --gmp-mat-color-primary: var(--dash-address-prediction-primary, #659cba);
                        --gmp-mat-color-outline-decorative: var(--dash-address-prediction-border, #9ba8b6);
                        --gmp-mat-font-family: sans_serif_normal;
                    }

                    gmp-place-autocomplete.dash-google-address::part(input) {
                        background: transparent;
                        border: 0;
                        color: inherit;
                        color-scheme: inherit;
                        font-family: sans_serif_normal;
                        font-size: 100%;
                        line-height: inherit;
                    }

                    gmp-place-autocomplete.dash-google-address::part(prediction-list) {
                        background: var(--dash-address-prediction-background, #ffffff) !important;
                        background-color: var(--dash-address-prediction-background, #ffffff) !important;
                        backdrop-filter: none;
                        border: 1px solid var(--dash-address-prediction-border, #9ba8b6);
                        border-radius: ${Dash.Size.BorderRadius * 0.5}px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
                        color: var(--dash-address-prediction-text, #39445c);
                        font-family: sans_serif_normal;
                        opacity: 1;
                        overflow: hidden;
                        z-index: 2000000;
                    }

                    gmp-place-autocomplete.dash-google-address::part(prediction-item) {
                        background: var(--dash-address-prediction-background, #ffffff) !important;
                        background-color: var(--dash-address-prediction-background, #ffffff) !important;
                        color: var(--dash-address-prediction-text, #39445c);
                        opacity: 1;
                    }

                    gmp-place-autocomplete.dash-google-address::part(prediction-item-icon) {
                        color: var(--dash-address-prediction-primary, #659cba);
                    }

                    gmp-place-autocomplete.dash-google-address::part(prediction-item-main-text),
                    gmp-place-autocomplete.dash-google-address::part(prediction-item-match) {
                        color: var(--dash-address-prediction-main-text, #07112f);
                    }

                    gmp-place-autocomplete.dash-google-address::part(prediction-item-selected) {
                        background: var(--dash-address-prediction-selected-background, rgba(101, 156, 186, 0.18)) !important;
                        background-color: var(--dash-address-prediction-selected-background, rgba(101, 156, 186, 0.18)) !important;
                        color: var(--dash-address-prediction-main-text, #07112f);
                    }
                `
            })
        );
    }

    setup_place_autocomplete_value_adapter (place_autocomplete) {
        this.input.val = (...args) => {
            if (args.length < 1) {
                return this.get_place_autocomplete_value(place_autocomplete);
            }

            this.set_place_autocomplete_value(place_autocomplete, args[0]);

            return this.input;
        };
    }

    set_place_autocomplete_placeholder (place_autocomplete) {
        place_autocomplete.placeholder = this.placeholder_text;

        place_autocomplete.setAttribute("placeholder", this.placeholder_text);

        var input = this.get_place_autocomplete_input(place_autocomplete);

        if (input) {
            input.placeholder = this.placeholder_text;
        }
    }

    get_place_autocomplete_value (place_autocomplete) {
        var input = this.get_place_autocomplete_input(place_autocomplete);

        if (input) {
            return input.value || "";
        }

        return place_autocomplete.value || "";
    }

    set_place_autocomplete_value (place_autocomplete, value="") {
        value = value || "";

        place_autocomplete.value = value;

        place_autocomplete.setAttribute("value", value);

        var input = this.get_place_autocomplete_input(place_autocomplete);

        if (input) {
            input.value = value;
        }
    }

    get_place_autocomplete_input (place_autocomplete) {
        if (place_autocomplete.inputElement) {
            return place_autocomplete.inputElement;
        }

        if (place_autocomplete.shadowRoot) {
            return place_autocomplete.shadowRoot.querySelector("input");
        }

        return null;
    }

    notify_place_changed_listeners () {
        for (var listener of this.google_places_autocomplete_listeners) {
            listener();
        }
    }

    fallback_to_legacy_autocomplete () {
        if (this.fallback_to_legacy_in_progress || !this.google_places_autocomplete_is_new) {
            return;
        }

        this.fallback_to_legacy_in_progress = true;

        var current_value = this.Text();
        var legacy_input = $("<input>", {"placeholder": this.placeholder_text});

        this.input.replaceWith(legacy_input);

        this.input = legacy_input;
        this.google_places_autocomplete = null;
        this.google_places_autocomplete_is_new = false;

        this.apply_input_styles();
        this.apply_replacement_input_styles();

        this.input.val(current_value);

        this.setup_connections();
        this.setup_legacy_autocomplete(this.legacy_autocomplete_options);

        if (current_value) {
            this.input.trigger("focus");

            this.input[0].dispatchEvent(new Event("input", {"bubbles": true}));
        }

        this.fallback_to_legacy_in_progress = false;
    }

    apply_replacement_input_styles () {
        this.input.css({
            "background": "none",
            "color": this.color.Text,
            "flex": 2,
            "font-family": "sans_serif_normal",
            "font-size": "100%",
            "line-height": this.height + "px",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap"
        });
    }

    setup_legacy_autocomplete (options) {
        Dash.Log.Debug("❗️DashGuiAddress: Falling back to legacy Google Maps Places Autocomplete API (safe to ignore)");

        try {
            this.google_places_autocomplete = new google.maps.places.Autocomplete(this.input[0], options);
        }

        catch {
            console.warn(
                "Warn (google.maps.places.Autocomplete):\nDashGuiAddress cannot initialize because the required " +
                "script was not added to index.html, please reference the docstring and make the required change."
            );

            return;
        }

        this.google_places_autocomplete.addListener(
            "place_changed",
            () => {
                this.parse_value();
                this._on_submit(true);
            }
        );

        this.refresh_autocomplete_dependent_ui();

        setTimeout(
            () => {
                // .pac-container is the CSS class for the above autocomplete element
                // (there's no other way I found to edit the element directly)
                $(".pac-container").css({
                    // DashGuiModal, which used to be the highest in the stack,
                    // starts at half this value, so this should be more than
                    // high enough to ensure it's always on the very top
                    "z-index": 2000000
                });
            },
            500  // Ensure it's been added to the DOM first
        );
    }

    refresh_autocomplete_dependent_ui () {
        var has_autocomplete = !!this.google_places_autocomplete;

        if (this.label) {
            this.label.attr("title", has_autocomplete ? this.tip_text : "");

            this.label.css({
                "cursor": has_autocomplete ? "help" : "default"
            });
        }

        if (this.tip_icon) {
            this.tip_icon.html.attr("title", has_autocomplete ? this.tip_text : "");

            this.tip_icon.html.css({
                "cursor": has_autocomplete ? "help" : "default"
            });
        }

        this.add_map_link_button();
    }

    add_map_link_button () {
        if (!this.google_places_autocomplete || this.map_link_button) {
            return;
        }

        this.map_link_button = new Dash.Gui.IconButton(
            "map_marked",
            () => {
                if (!this.map_link_url) {
                    alert("Address is empty, invalid, or has too many matches - can't open in Google Maps:\n" + this.formatted_address);

                    return;
                }

                window.open(this.map_link_url, "_blank");
            },
            this,
            this.color,
            {
                "container_size": this.height,
                "size_mult": 0.9
            }
        );

        this.map_link_button.html.css({
            "margin-left": Dash.Size.Padding
        });

        this.map_link_button.SetHoverHint("Open address in Google Maps");

        this.html.append(this.map_link_button.html);
    }

    // Ref: https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
    parse_address_components (
        components, use_long_names=false, full_zip_code=false, include_county=false, include_country=true
    ) {
        var parsed = {};

        if (!components) {
            return parsed;
        }

        // TODO
        if (this.international) {
            console.error("Error: International address component parsing has not yet been implemented");
        }

        else {
            var zip_code_suffix = "";

            for (var component of components) {
                if (full_zip_code && component["types"].includes("postal_code_suffix")) {
                    zip_code_suffix = this.get_address_component_text(component, use_long_names);

                    continue;
                }

                var key = "";

                if (component["types"].includes("street_number")) {
                    key = "street_number";
                }

                else if (component["types"].includes("route")) {
                    key = "street_name";
                }

                else if (component["types"].includes("postal_code")) {
                    key = "zip_code";
                }

                else if (component["types"].includes("locality")) {
                    key = "city";
                }

                else if (component["types"].includes("administrative_area_level_1")) {
                    key = "state";
                }

                else if (include_county && component["types"].includes("administrative_area_level_2")) {
                    key = "county";
                }

                else if (include_country && component["types"].includes("country")) {
                    key = "country";
                }

                if (key) {
                    parsed[key] = this.get_address_component_text(component, use_long_names);

                    if (key === "county") {
                        parsed[key] = parsed[key].replace("County", "").Trim();
                    }
                }
            }

            if (zip_code_suffix && parsed["zip_code"]) {
                parsed["zip_code"] += "_" + zip_code_suffix;
            }
        }

        return parsed;
    }

    get_address_component_text (component, use_long_names=false) {
        if (use_long_names) {
            return component["long_name"] || component["longText"] || "";
        }

        return component["short_name"] || component["shortText"] || component["long_name"] || component["longText"] || "";
    }

    get_place_info (address, callback) {
        if (!this.geocoder) {
            try {
                this.geocoder = new google.maps.Geocoder();
            }

            catch {
                console.warn(
                    "Warn (google.maps.Geocoder):\nDashGuiAddress cannot initialize because the required script " +
                    "was not added to index.html, please reference the docstring to make the required change."
                );

                return;
            }
        }

        var options = {"address": address};

        if (!this.international) {
            options["componentRestrictions"] = {"country": "us"};
        }

        // noinspection JSIgnoredPromiseFromCall
        this.geocoder.geocode(
            options,
            (results, status) => {
                if (status !== "OK") {
                    Dash.Log.Warn("Geocode failed to find results for '" + address + "', status:\n" + status);

                    return null;
                }

                if (!results || results.length < 1) {
                    Dash.Log.Warn("Geocode couldn't any find results for '" + address + "'");

                    return null;
                }

                if (results.length > 1) {
                    Dash.Log.Warn(
                        "Geocode found too many results for '"
                        + address
                        + "'"
                        // + ": "
                        // + JSON.stringify(results)
                    );

                    return null;
                }

                callback(results[0]);
            }
        );
    }

    normalize_place_result (place={}) {
        var normalized = {};

        if (!place) {
            return normalized;
        }

        normalized["formatted_address"] = place["formatted_address"] || place["formattedAddress"] || "";
        normalized["url"] = place["url"] || place["googleMapsURI"] || place?.googleMapsLinks?.placeURI || "";

        normalized["address_components"] = this.normalize_address_components(
            place["address_components"] || place["addressComponents"] || []
        );

        var location = place?.geometry?.location || place["location"];

        if (location) {
            normalized["geometry"] = {"location": location};
        }

        return normalized;
    }

    normalize_address_components (components=[]) {
        var normalized = [];

        if (!components) {
            return normalized;
        }

        for (var component of components) {
            normalized.push({
                "long_name": component["long_name"] || component["longText"] || "",
                "short_name": component["short_name"] || component["shortText"] || component["long_name"] || component["longText"] || "",
                "types": component["types"] || []
            });
        }

        return normalized;
    }

    update_place_attrs (place={}, value="") {
        place = this.normalize_place_result(place);

        this.google_places_autocomplete_place = place;
        this.formatted_address = place["formatted_address"] || "";

        if (!place["url"]) {
            if (this.formatted_address) {
                place["url"] = "https://maps.google.com/?q=" + encodeURIComponent(this.formatted_address);
            }

            else {
                var location = place?.geometry?.location;

                if (location) {
                    place["url"] = "https://www.google.com/maps/?q=" + location.lat() + "," + location.lng();
                }
            }
        }

        this.map_link_url = place["url"] || "";

        if (this.formatted_address && !this.international) {
            this.formatted_address = this.formatted_address.RTrim(", USA");
        }

        if (!this.formatted_address && value) {
            this.formatted_address = value;
        }

        var address_components = place["address_components"] || [];

        this.address_components = (
            address_components.length ? this.parse_address_components(address_components) : {}
        );

        if (Dash.Validate.Object(this.address_components)) {
            this.address_components["url"] = place["url"] || "";
        }
    }

    _on_submit (from_autocomplete=false) {
        if ((this.place_selection_pending && !from_autocomplete) || this.formatted_address === this.last_submitted_value) {
            return;
        }

        if (from_autocomplete) {
            if (this.on_submit_timer) {
                clearTimeout(this.on_submit_timer);

                this.on_submit_timer = null;
            }

            this.input.val(this.formatted_address);
        }

        if (this._on_submit_cb) {
            this._on_submit_cb(this.formatted_address, this.address_components);
        }

        this.last_submitted_value = this.formatted_address;
    }

    // Overrides SetValue
    _set_value (value="") {
        this.map_link_url = "";
        this.formatted_address = "";
        this.address_components = {};

        this.get_place_info(value, (place) => {
            this.update_place_attrs(place, value);
        });

        this.SetText(value);
    }

    // Overrides parse_value
    _parse_value (value="") {
        if (this.google_places_autocomplete_is_new) {
            value = value || this.Text();

            var selected_place = (
                   this.google_places_autocomplete_place
                && this.last_selected_value
                && value === this.last_selected_value
            ) ? this.google_places_autocomplete_place : {};

            this.update_place_attrs(selected_place, value);

            return this.formatted_address;
        }

        this.update_place_attrs(this.google_places_autocomplete.getPlace() || {}, value);

        return this.formatted_address;
    }

    // Overrides on_set_locked
    _on_set_locked (locked) {
        this.input.prop("disabled", locked);

        // Intentional broad coverage
        this.input.prop("readOnly", locked);
        this.input.prop("readonly", locked);
    };
}
