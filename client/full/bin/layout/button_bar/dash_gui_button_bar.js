function DashGuiButtonBar(binder, color){

    this.html = $("<div></div>");
    this.binder = binder;
    this.color = color || Dash.Color.Light;
    this.buttons = [];

    this.setup_styles = function(){

        this.html.css({
            "display": "flex",
            "height": Dash.Size.ButtonHeight,
        });

    };

    this.AddButton = function(label_text, callback){

        callback = callback.bind(this.binder);

        (function(self, callback){

            var button = new d.Gui.Button(label_text, function(){
                callback(button);
            }, self, self.color);

            self.buttons.push(button);

            button.html.css({
                "margin": 0,
                "flex-grow": 1,
            });

            self.html.append(button.html);

        })(this, callback);

        this.update_spacing();

        return this.buttons[this.buttons.length-1];

    };

    this.update_spacing = function(){
        // TODO: Make this more efficient - we don't need to hit
        // this multiple times on the same frame

        for (var i in this.buttons) {
            var button = this.buttons[i];
            var right_padding = Dash.Size.Padding;

            if (i == this.buttons.length-1) {
                right_padding = 0;
            };

            button.html.css({
                "margin": 0,
                "flex-grow": 1,
                "margin-right": right_padding,
            });

        };

    };

    this.setup_styles();

};
