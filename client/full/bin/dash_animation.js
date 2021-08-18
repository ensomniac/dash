
function DashAnimation(){

    this.Curves = new DashAnimationCurves();

    this.Eval = function(curve, t){
        return curve(t);
    };

    this.Start = function(duration_ms, callback, curve=null) {
        var animation_set = new DashAnimationSet(duration_ms, callback, curve);
        animation_set.Start();
        return animation_set;
    };

};
