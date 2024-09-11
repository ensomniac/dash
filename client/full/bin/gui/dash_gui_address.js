/**
 * Address input element that uses the Google Places API for autocomplete and address lookup via geocoding.
 * --------------------------
 *
 * REQUIREMENTS IN GOOGLE CLOUD CONSOLE: <br>
 *  - Enable Places API
 *  - Enable Maps JavaScript API
 *  - Enable Geocoding API
 *  - Create an API key, restrict it to this specific website
 *    (ex: https://altona.io), and restrict it to the three APIs above
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
            $("<input placeholder='" + placeholder_text + "'>"),
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

        this.geocoder = null;
        this.map_link_url = "";
        this.on_submit_timer = null;
        this.formatted_address = "";
        this.map_link_button = null;
        this.address_components = {};
        this.last_submitted_value = "";
        this.google_places_autocomplete = null;

        this.tip_text = (
            "Start typing an address to search,\nthen select the corresponding address.\n\n" +
            "You can also freely enter any address if it's\nnot listed, though this will be uncommon.\n\n" +
            'More granular address details,\nsuch as "Suite 100", can be manually\nadded after selecting the address.'
        );

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
        this.input.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "border-bottom": "1px solid " + this.color.PinstripeDark
        });

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

    add_icon = function () {
        if (!this.include_tip_icon) {
            if (this.label && this.google_places_autocomplete) {
                this.label.attr("title", this.tip_text);

                this.label.css({
                    "cursor": "help"
                });
            }

            return;
        }

        var icon = new Dash.Gui.Icon(
            this.color,
            "map_marker",
            this.height,
            0.9,
            this.color.Stroke
        );

        if (this.google_places_autocomplete) {
            icon.html.attr("title", this.tip_text);
        }

        icon.html.css({
            "cursor": this.google_places_autocomplete ? "help" : "default",
            "margin-right": Dash.Size.Padding * 0.3
        });

        this.html.prepend(icon.html);
    };

    setup_autocomplete () {
        // Ref: https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions
        var options = {
            // Ref: https://developers.google.com/maps/documentation/javascript/supported_types#table3
            "types": [
                "geocode"
            ],

            // *** KEEP THESE AS SPARSE AS POSSIBLE FOR BILLING ***
            // Ref: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
            "fields": [
                "address_components",
                "formatted_address",
                "url"
            ]
        };

        if (!this.international) {
            options["componentRestrictions"] = {"country": "us"};
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
            this.google_places_autocomplete = new google.maps.places.Autocomplete(this.input[0], options);
        }

        catch {
            console.warn(
                "Warn (google.maps.places.Autocomplete):\nDashGuiAddress cannot initialize because the required " +
                "script was not added to index.html, please reference the docstring and make the required change."
            );

            return;
        }

        this.google_places_autocomplete.addListener("place_changed", () => {
            this.parse_value();
            this._on_submit(true);
        });


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

    add_map_link_button () {
        if (!this.google_places_autocomplete) {
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
                    zip_code_suffix = use_long_names ? component["long_name"] : component["short_name"];

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
                    parsed[key] = use_long_names ? component["long_name"] : component["short_name"];

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

    update_place_attrs (place={}, value="") {
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

        this.address_components = Dash.Validate.Object(place["address_components"]) ? this.parse_address_components(
            place["address_components"]
        ) : {};

        if (Dash.Validate.Object(this.address_components)) {
            this.address_components["url"] = place["url"] || "";
        }
    }

    _on_submit (from_autocomplete=false) {
        if (this.formatted_address === this.last_submitted_value) {
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
        this.update_place_attrs(this.google_places_autocomplete.getPlace() || {}, value);

        return this.formatted_address;
    }

    // Overrides on_set_locked
    _on_set_locked (locked) {
        this.input.prop("disabled", locked);
    };
}
