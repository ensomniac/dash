
function DashAnimation(){

    this.Curves = new DashAnimationCurves();

    this.Eval = function(curve, t){
        return curve(t);
    };

};
