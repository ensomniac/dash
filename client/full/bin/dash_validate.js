function DashValidate () {
    this.Response = function (response, show_alert=true) {
        // Setting show_alert to false is best utilized for interval functions that may not need
        // to alert when a single interval fails (from server updates, or any other reason) -
        // in addition, you can track those interval failures in Dash.Requests (see TrackRequestFailureForID docstring)

        if (response && !response["error"]) {
            return response;
        }

        // This stops duplicate callbacks from being triggered after an alert window pops up
        this.handle_duplicate_callbacks_on_invalid_input();

        if (!response) {
            if (show_alert) {
                console.error("(Dash.Validate.Response) No response received:", response);

                alert("There was a server problem with this request:\nNo response received");
            }

            else {
                console.warn("(Dash.Validate.Response) No response received:", response);
            }
        }

        else if (response["error"]) {
            if (show_alert) {
                console.error("There was a server problem with this request:", response);

                alert(response["error"]);
            }

            else {
                console.warn("There was a server problem with this request:", response);
            }
        }

        return null;
    };

    this.Object = function (data_object) {
        return (data_object && typeof data_object === "object" && !jQuery.isEmptyObject(data_object));
    };

    this.Email = function (str) {
        if (typeof str !== "string") {
            return false;
        }

        var username = str.split("@")[0];
        var domain = str.split("@").Last();
        var domain_split = domain.split(".");
        var domain_start = domain_split[0];
        var domain_end = domain_split.Last();
        var at_sign_count = (str.match(/@/g) || []).length;

        if (str.length > 0 && (at_sign_count !== 1 || !(domain.includes(".")))) {
            return false;
        }

        return !(domain_start.length < 1 || domain_end.length < 1 || username.length < 1);
    };

    this.handle_duplicate_callbacks_on_invalid_input = function () {
        var temp_last_input = Dash.Temp.GetLastInputSubmitted();

        if (!temp_last_input || !(temp_last_input instanceof DashGuiInput)) {
            return;
        }

        temp_last_input.SkipNextBlur();

        if (!temp_last_input.submit_called_from_autosave) {
            temp_last_input.SkipNextAutosave();
        }

        Dash.Temp.RevertLastInputText(temp_last_input);
    };
}
