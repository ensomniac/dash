class DashGuiAddress extends DashGuiInputType {
    constructor(
        label_text = "",
        binder = null,
        on_submit_cb = null,
        color = null,
        international=false,
        placeholder_text="Start typing an address to search..."
    ) {
        super(
            $("<input placeholder='" + placeholder_text + "'>"),
            label_text,
            null,
            (components) => {
                this._on_submit(components);

                if (on_submit_cb) {
                    (on_submit_cb && binder ? on_submit_cb.bind(binder) : on_submit_cb)(components);
                }
            },
            null,
            null,
            color,
            false
        );

        this.international = international;

        this.map_link_url = "";
        this.map_link_button = null;
        this.google_places_autocomplete = null;

        this._setup_styles();
    }

    _setup_styles () {
        this.input.css({
            "padding-left": Dash.Size.Padding * 0.5,
            "padding-right": Dash.Size.Padding * 0.5,
            "border": "1px solid " + this.color.Stroke
        });

        this.setup_autocomplete();
        this.add_map_link_button();
    }

    GetAsString (components=null) {
        if (!components) {
            components = this.parse_value();
        }

        var text = "";

        // TODO

        return text;
    }

    // SetValue () {
    //     this.SetText();
    // }

    // Override the parse_value method
    parse_value () {
        var place = this.google_places_autocomplete.getPlace() || {};

        this.map_link_url = place["url"] || "";

        return this.parse_address_components(place["address_components"]);
    }

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
                "url"
            ]
        };

        if (!this.international) {
            options["componentRestrictions"] = {"country": "us"};
        }

        else {
            // TODO: A few things need to be worked out first, such as parsing of the address components
            console.warn("Warning: International address support has not yet been implemented.");

            return;
        }

        this.google_places_autocomplete = new google.maps.places.Autocomplete(this.input[0], options);

        this.google_places_autocomplete.addListener("place_changed", () => {
            var components = this.parse_value();

            this._on_submit(components);
        });
    }

    add_map_link_button () {
        // TODO
    }

    // Ref: https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
    parse_address_components (components) {
        var parsed = {};

        if (!components) {
            return parsed;
        }

        // TODO
        if (this.international) {
            console.error("Error: International address component parsing has not yet been implemented");
        }

        else {
            // TODO
        }

        return parsed;
    }

    _on_submit (components) {
        var text = this.GetAsString(components);

        // TODO: format text and update input with it to display it in the desired format
    }
}
