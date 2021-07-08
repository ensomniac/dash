/**@member DashGuiLayoutDashboardModule*/

function DashGuiLayoutDashboardModuleSquare () {
    this.styles = ["tag", "radial"];
    this.label_text = "SetLabelText()";
    this.label_header_text = "SetLabelHeaderText()";
    this.label = $("<div>" + this.label_text + "</div>");
    this.label_header = $("<div>" + this.label_header_text + "</div>");

    // TODO: Update all uses of VH

    this.setup_styles = function () {
        this.html.css({
            "aspect-ratio": "1 / 1"
        });

        if (this.sub_style === "tag") {
            this.setup_tag_style();
        }

        else if (this.sub_style === "radial") {
            this.setup_radial_style();
        }

        this.html.append(this.label_header);
        this.html.append(this.label);
    };

    this.setup_tag_style = function () {
        // TODO: Should we add animation?

        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",
            "margin-top": "18%",

            // TODO
            "font-size": "1.5vh",  // TEMP
            "height": "1.5vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "95%",

            // TODO
            "font-size": "4.5vh",  // TEMP
            "height": "4.5vh",  // TEMP
            "line-height": "5vh",  // TEMP
        });
    };

    this.setup_radial_style = function () {
        this.label_header.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",
            "margin-top": "32%",

            // TODO
            "font-size": "1vh",  // TEMP
            "height": "1vh",  // TEMP
        });

        this.label.css({
            ...this.centered_text_css,
            "color": this.primary_color,
            "width": "50%",

            // TODO
            "font-size": "2.75vh",  // TEMP
            "height": "2.75vh",  // TEMP
            "line-height": "3.25vh",  // TEMP
        });

        var radial_value = this.get_radial_value();

        this.label.text(radial_value);

        this.setup_radial_gui();
    };

    this.setup_radial_gui = function () {
        var config = {
            "type": "doughnut",
            "data": {
                "labels": ["Invoiced", "Not Invoiced"],
                "datasets": [{
                    "label": "Dataset 1",
                    // "data": this.get_numbers({"count": 2, "min": 0, "max": 100}),
                    "data": [62, 38],  // TODO: This needs to come from radial value data (percent full, percent empty)
                    "backgroundColor": Object.values({
                        "invoiced": this.primary_color,
                        "not_invoiced": this.secondary_color,
                    }),
                    "borderWidth": Object.values({
                        "invoiced": 5,
                        "not_invoiced": 0,
                    }),
                    "borderColor": Object.values({
                        "invoiced": this.primary_color
                    }),
                }]
            },
            "options": {
                "cutout": "80%",
                "responsive": true,
                "aspectRatio": 1,
                "plugins": {
                    "legend": {
                        "display": false
                    },
                    "tooltip": {
                        "enabled": false
                    },
                    "title": {
                        "display": false
                    }
                }
            },
        };

        // TODO: Since the canvas has to be at document level and added dynamically for Chart objects to
        //  actually display, need to work out a way that we can programmatically determine where to position
        //  the Chart object based on the positioning of this.html (the current dashboard square module)

        var id = "canvas" + Dash.Math.RandomNumber();
        var div = document.createElement("div");

        // TODO
        div.style.width = "10.5vh";  // TEMP
        div.style.height = "10.5vh";  // TEMP
        div.style.top = "88vh";  // TEMP
        div.style.left = "16.25vh";  // TEMP

        var canvas = document.createElement("canvas");
        canvas.id = id;

        div.appendChild(canvas);
        document.body.appendChild(div);

        var ctx = document.getElementById(id).getContext("2d");
        ctx.canvas.width = 10;
        ctx.canvas.height = 10;

        var text = "new Chart(document.getElementById('" + id + "').getContext('2d')," + JSON.stringify(config) + ");";
        var script = $("<script type='text/javascript'></script>");
        script.text(text);

        this.html.append(script);
    };

    this.get_radial_value = function () {
        // TODO: Need to do some sort of calculation here based on provided
        //  data that gets the percentage fill value of the radial gui

        return "62%";  // PLACEHOLDER
    };

    // Works for both "tag" and "radial" sub-styles
    this.SetLabelHeaderText = function (text) {
        this.label_header_text = text.toString().toUpperCase();
        
        this.label_header.text(this.label_header_text);
    };

    this.SetLabelText = function (text) {
        if (this.sub_style !== "tag") {
            console.log("ERROR: SetMainText() can only be used for Square Tag Modules, not", this.sub_style.Title());

            return;
        }

        this.label_text = text.toString().toUpperCase();

        if (this.label_text.length > 4) {
            console.log("WARNING: Square Module SetMainText is intended to be four characters or less - any more may introduce cut-off.");
        }

        if (this.label_text.length <= 3) {
            this.label.css({
                // TODO
                "font-size": "5.5vh",  // TEMP
                "height": "5.5vh",  // TEMP
                "line-height": "6vh",  // TEMP
            });
        }

        this.label.text(this.label_text);
    };
}
