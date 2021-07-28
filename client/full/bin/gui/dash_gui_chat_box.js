function DashGuiChatBox (header_text, color=Dash.Color.Light) {
    this.header_text = header_text;
    this.color = color;

    this.header = null;
    this.html = Dash.Gui.GetHTMLBoxContext();
    this.message_area = Dash.Gui.GetHTMLBoxContext();
    this.message_input = null;

    this.setup_styles = function () {
        this.SetHeaderText();

        this.html.append(this.message_area);

        this.add_message_input();
    };

    this.SetHeaderText = function (label_text) {
        if (label_text) {
            this.header_text = label_text;
        }

        if (this.header) {
            this.header.SetText(this.header_text);
        }

        else {
            this.header = new Dash.Gui.Header(this.header_text, this.color);

            this.html.append(this.header.html);
        }

        return this.header;
    };

    this.AddMessage = function () {

    };

    this.add_message = function () {
        this.AddMessage(this.message_input.Text());

        this.message_input.SetText("");
    };

    this.add_message_input = function () {
        this.message_input = new DashGuiInput("Leave a new note...",this.color);

        this.html.append(this.message_input.html);

        this.message_input.OnSubmit(this.add_message, this);
    };
 
    // this.add_chat_box = function(){
    //     this.chatbox = new Dash.Gui.PropertyBox(
    //         this,           // For binding
    //         null,  // Function to return live data
    //         null,           // Function to set saved data locally
    //         null,           // Endpoint
    //         null,           // Dash object ID
    //         null,           // Any other params to send to the server on save
    //     );
    //
    //     this.chatbox.AddHeader("Recent Chats");
    //     this.chatbox.html.append(
    //         $("<div>List of recent Chat Messages on Stream:</div>")
    //             .css({"color":"black","text-align":"left","margin-bottom":"10px"})
    //     );
    //     this.chats=$("<div></div>")
    //         .css({"color":"black","text-align":"left"});
    //
    //     this.chatbox.html.append(this.chats);
    //     this.sendmessage = new DashGuiInput("Send Message",this.performances.color);
    //     this.sendmessage.html.css({"margin-top":"10px"});
    //     this.chatbox.html.append(this.sendmessage.html);
    //     this.sendmessage.OnSubmit(function (){
    //         this.add_message(this.sendmessage.Text());
    //         this.sendmessage.input[0].value="";
    //     }.bind(this));
    //
    //     this.sidebar.append(this.chatbox.html);
    // };

    // this.add_message = function(message){
    //     Dash.Request(
    //         this,
    //         function(){},
    //         "Performance",
    //         {
    //             "f": "add_message",
    //             "asset_path": this.asset_path,
    //             "service":"twitch",
    //             "msg": message
    //         }
    //     );
    // }

    this.setup_styles();
}
