
function Dash(){
    this.html = $("<div></div>");
    this.IsMobile = false;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        this.IsMobile = true;
    };

    this.Context = DASH_CONTEXT;
    this.Local = new DashLocal();
    this.Color = new DashColor();
    this.Size = new DashSize();
    this.User = new DashUser();
    this.Gui = new DashGui();
    this.View = new DashView();
    this.Requests = new DashRequest();
    this.Request = this.Requests.Request.bind(this.Requests);

    //window.history.pushState({"html":"html","pageTitle":"some page"},"title", "https://...");



    // window.RowHeight = 32;
    // window.ColumnWidth = window.RowHeight*5;
    // window.Padding = 10;
    // window.BarWidth = 6;
    // window.ButtonColor = "#4d505f";
    // window.ButtonBarBackingColor = "#3b3c42";
    // window.ButtonHoverColor = "#565e83";
    // window.DarkPanelColor = "#202229";
    // window.DarkPanelColorAlt = "#25282f";
    // window.LightestBackgroundColor = "rgb(240, 240, 240)";
    // window.LightBackgroundColor = "rgb(230, 230, 230)";
    // window.GrayBackgroundColor = "rgb(200, 200, 200)";
    // window.GoodColor = "#95ae6c";
    // window.GoodColorBlue = "#a8b6bd";
    // window.GoodColorYellow = "rgb(255, 230, 141)";
    // window.GoodColorPurple = "#8f79b1";
    // window.BadColor = "#dabd62";
    // window.ErrorColor = "#c56645";
    // window.TextColor = "rgba(0, 0, 0, 0.9)";
    // window.ContainerColor = "#ebebeb";
    // window.ThinFontSize = "90%";

    // window.MindtwinStripHeight = window.RowHeight;
    // window.MindtwinStripWidth = window.ColumnWidth*1.25;

    this.width = 0;
    this.height = 0;

    window.FormatTime = function(server_iso_string){
        var server_offset_hours = 5; // The server's time is 3 hours different
        var date = new Date(Date.parse(server_iso_string));
        date = date.setHours(date.getHours()-server_offset_hours);
        var time_ago = timeago.format(date);
        return time_ago;
    };

    this.ValidateResponse = function(response){
        // TODO: doc

        if (!response) {
            console.log("Dash.ValidateResponse(1)");
            console.log(response);
            alert("There was a server problem with this request");
            return null;
        };

        if (response["error"]) {
            console.log("Dash.ValidateResponse(2)");
            console.log(response);
            alert(response["error"]);
            return null;
        };

        return response;

    };

    this.GetFormContainer = function(){

        var container = $("<div></div>");

        container.css({
            "background": ContainerColor,
            "margin": Padding,
            "padding": Padding,
            "box-shadow": "0px 0px 15px 1px rgba(0, 0, 0, 0.2)",
            "color": "rgba(0, 0, 0, 0.8)",
            "border-radius": 6,
        });

        return container;

    };

    this.setup_styles = function(){

        $("body").css({
            "overflow": "hidden",
        });

        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "background": Dash.Color.GetVerticalGradient("#444", "#111", "#111"),
        });

        (function(self){

            requestAnimationFrame(function(){
                self.draw();
            });

            $(window).resize(function(){
                self.draw();
            });

        })(this);

    };

    this.draw = function(){

        this.width = $(window).width();
        this.height = $(window).height();

        this.html.css({
            "width": this.width,
            "height": this.height,
        });

    };

    this.Initialize = function(){
        // Called once when document ready
        this.setup_styles();
    };

};

$(document).ready(function() {

    $.fn.extend({
        animateStep: function(options) {
            return this.each(function() {
                var elementOptions = $.extend({}, options, {step: options.step.bind($(this))});
                $({x: options.from}).animate({x: options.to}, elementOptions);
            });
        },
        rotate: function(value) {
            return this.css("transform", "rotate(" + value + "deg)");
        }
    });

    if (window.location.href.includes("https://www.") && !window.location.href.includes("file://")) {
        console.log("Warning: URL Loaded with www -> Redirecting");
        window.location.href = window.location.href.replace("https://www.", "https://");
    };

    window.InverseLerp = function(min, max, val){
        var t = (val - min) / (max - min)
        return t;
    };

    window.Lerp = function(valA, valB, t){
        if (t > 1) {t = 1;}
        if (t < 0) {t = 0;}

        var x = valA + t * (valB - valA);
        return x;
    };

    window.Dash = new Dash();
    window.d = window.Dash;
    window.Dash.Initialize();
    $("body").empty().append(window.Dash.html);

    if (!window.RunDash) {
        console.log("Dash is initialized, but there is no window.RunDash() function. Create one and reload.");
    }
    else {

        var html = window.RunDash();

        if (!html) {
            console.log("Dash Warning: The window.RunDash() must return an html element to anchor this app.");
        }
        else {
            window.Dash.html.append(html);
        };

    };

});
