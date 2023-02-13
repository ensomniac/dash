/**@member DashGuiContext2DPrimitive*/

function DashGuiContext2DPrimitiveText () {
    this.text_area = null;

    this._setup_styles = function () {
        this.text_area = new Dash.Gui.TextArea(this.color, "", this, this.on_text_change, true);

        // TODO:
        //  - possible to get rid of resize gui and stop it from being able to be resized? maybe an attribute? otherwise prevent default on resize event
        //  - figure out what size it should be by default (small) and make sure it will resize automatically as text is typed into it
        this.text_area.textarea.css({
            "color": this.data["font_color"] || this.color.Text,
            "border": "none"
        });

        this.html.append(this.text_area.html);

        this.update_font();
    };

    this.on_text_change = function (value) {
        console.debug("TEST on text change", value);

        // TODO
    };

    this.update_font = function () {
        var font_option = this.get_font_option();

        if (!font_option || !font_option["url"] || !font_option["filename"]) {
            return;
        }

        Dash.Utils.SetDynamicFont(
            this.textarea.textarea,
            font_option["url"],
            font_option["label_text"],
            font_option["filename"]
        );
    };

    this.get_font_option = function () {
        if (!this.data["font_id"] || !this.editor.ComboOptions["fonts"]) {
            return null;
        }

        for (var option of this.editor.ComboOptions["fonts"]) {
            if (option["id"] === this.data["font_id"]) {
                return option;
            }
        }

        return null;
    };

    this._setup_styles();
}
