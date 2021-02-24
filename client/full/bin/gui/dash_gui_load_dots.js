
function DashGuiLoadDots(size){

    this.size = size;
    this.html = $("<div></div>");

    this.layout = "horizontal";
    this.num_dots = 3;
    this.dots = [];

    this.iteration = 0;
    this.t = 0;
    this.cycle_duration = 1000;
    this.is_active = false;
    this.show_t = 0;

    this.IsActive = function(){
        return this.is_active;
    };

    this.Start = function(){
        if (this.is_active) {return;}

        this.is_active = true;
        this.activation_t = this.t;
        this.show_t = 0;

        for (var x in this.dots) {
            this.dots[x].Start();
        };

    };

    this.Stop = function(){
        if (!this.is_active) {return;}

        this.is_active = false;

        for (var x in this.dots) {
            this.dots[x].Stop();
        };

    };

    this.SetOrientation = function(horizontal_or_vertical){
        this.layout = horizontal_or_vertical;

        for (var x in this.dots) {
            this.dots[x].SetOrientation();
        };

    };

    this.SetColor = function(color){

        for (var x in this.dots) {
            this.dots[x].SetColor(color);
        };

    };

    this.setup_styles = function(){

        var i = 0;
        for (i = 0; i < this.num_dots; i++) {
            this.dots.push(new LoadDot(this));
        };

        this.html.css({
            "width": this.size,
            "height": this.size,
        });
    };

    this.update = function(t){
        (function(self){requestAnimationFrame(function(t){self.update(t);});})(this);

        if (this.t >= 1) {
            this.iteration += 1;
        };

        this.t = this.inverse_lerp(0, this.cycle_duration, t-(this.iteration*this.cycle_duration));
        if (this.t > 1) {this.t = 1};

        if (!this.is_active) {
            return;
        };

        this.show_t += 0.05;
        if (this.show_t > 1) {
            this.show_t = 1;
        };

        for (var x in this.dots) {
            this.dots[x].Update(this.t);
        };

    };

    this.inverse_lerp = function(min, max, val){
        return (val - min) / (max - min);
    };

    this.lerp = function(a, b, t){
        return a + Math.min(Math.max(t, 0), 1) * (b - a);
    };

    this.setup_styles();
    this.update(0);

};

function LoadDot(dots){

    this.dots = dots;
    this.html = $("<div></div>");
    this.index = this.dots.dots.length;

    this.hold_t = 0.25;

    this.Update = function(cycle_t){

        var t = 0;
        var cycle_offset = this.dots.lerp(0, 0.5, 1-this.dots.inverse_lerp(0, this.dots.dots.length, this.index));

        cycle_t += cycle_offset;
        if (cycle_t > 1) {cycle_t = cycle_t-1;};

        if (cycle_t < this.hold_t) {
            t = this.dots.inverse_lerp(0, this.hold_t, cycle_t);
        }
        else if (cycle_t > 1-this.hold_t) {
            t = 1-this.dots.inverse_lerp(1-this.hold_t, 1, cycle_t);
        }
        else {
            t = 1;
        }

        t = t*this.dots.show_t;

        this.html.css({
            "opacity": t
        });

    };

    this.Start = function(cycle_t){

        this.html.stop().css({
            "left": (this.dots.size*0.5)-(this.size*0.5),
            "top": (this.dots.size*0.5)-(this.size*0.5),
        });

        this.html.animate({
            "left": this.left,
            "top": this.top,
        }, 300);

    };

    this.Stop = function(cycle_t){

        this.html.stop().animate({
            "left": (this.dots.size*0.5)-(this.size*0.5),
            "top": (this.dots.size*0.5)-(this.size*0.5),
            "opacity": 0,
        }, 300);

    };

    this.SetOrientation = function(){
        this.size = this.dots.size/(this.dots.num_dots+1.5);
        this.padding = (this.dots.size-((this.size*this.dots.num_dots)))/((this.dots.num_dots-1)+1);
        this.left = (this.padding*0.5) + (this.index*this.size) + (this.index*this.padding);
        this.top = (this.dots.size*0.5)-(this.size*0.5);

        if (this.dots.layout != "horizontal") {
            this.left = (this.dots.size*0.5)-(this.size*0.5);
            this.top = (this.padding*0.5) + (this.index*this.size) + (this.index*this.padding);
        };
    };

    this.SetColor = function(color){

        this.html.css({
            "background": color,
        });

    };

    this.setup_styles = function(){

        this.SetOrientation();

        this.html.css({
            "position": "absolute",
            "left": this.left,
            "top": this.top,
            "background": "rgba(255, 255, 255, 0.9)",
            "width": this.size,
            "height": this.size,
            "border-radius": this.size*0.5,
            "opacity": 0,
        });

        this.dots.html.append(this.html);

    };

    this.setup_styles();

};
