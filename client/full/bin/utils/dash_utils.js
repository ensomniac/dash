
function DashUtils(){

    // this.timers = [];

    this.SetTimer = function(binder, callback, ms){

        var timer = {};
        timer["callback"] = callback.bind(binder);
        timer["source"] = binder;
        timer["iterations"] = 0;

        (function(self, timer){
            var iterations = 0;

            timer["timer_id"] = setInterval(function(){
                timer["iterations"] = iterations
                self.manage_timer(timer);
                iterations += 1;
            }, ms);

        })(this, timer);

        this.manage_timer(timer);

    };

    this.manage_timer = function(timer){

        var still_active = true;

        if (timer.iterations && timer.iterations >= 1) {

            if (timer.source.html && !timer.source.html.is(":visible")) {
                still_active = false;
            };

        };

        if (!still_active) {
            console.log("== CLEARING TIMER ==");
            clearInterval(timer["timer_id"])
            return;
        };

        timer["callback"]();

    };

};
