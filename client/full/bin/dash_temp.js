function DashTemp () {
    this.last_combo_changed = null;
    this.last_input_submitted = null;

    this.SetLastComboChanged = function (combo) {
        this.last_combo_changed = combo;
    };

    this.SetLastInputSubmitted = function (input) {
        this.last_input_submitted = input;
    };

    this.GetLastComboChanged = function () {
        return this.last_combo_changed;
    };

    this.GetLastInputSubmitted = function () {
        return this.last_input_submitted;
    };

    // This is useful as a quick "undo" on the last modified input in cases like
    // when the server returns a response that says that input value is invalid etc
    this.RevertLastInputText = function (temp_last_input=null, allow_empty_string=false) {
        if (!temp_last_input) {
            temp_last_input = this.last_input_submitted;
        }

        if (!temp_last_input) {
            return;
        }

        var previous = temp_last_input.previous_submitted_text || "";

        if (!allow_empty_string && !previous) {
            return;
        }

        if (previous !== temp_last_input.last_submitted_text) {
            temp_last_input.SetText(previous);
        }

        else if (allow_empty_string && !previous && !temp_last_input.last_submitted_text) {
            temp_last_input.SetText("");
        }
    };

    // This is useful as a quick "undo" on the last modified combo in cases like
    // when the server returns a response that says that combo change is invalid etc
    this.RevertLastComboSelection = function (temp_last_combo=null) {
        if (!temp_last_combo) {
            temp_last_combo = this.last_combo_changed;
        }

        if (!temp_last_combo) {
            return;
        }

        var previous = temp_last_combo.previous_selected_option;

        if (!Dash.Validate.Object(previous)) {
            // Instead of returning, might make sense to set 'previous' to
            // the first combo option in the combo's list of options?
            return;
        }

        if (JSON.stringify(previous) !== JSON.stringify(temp_last_combo.selected_option)) {
            temp_last_combo.Update(null, previous, true);
        }
    };
}
