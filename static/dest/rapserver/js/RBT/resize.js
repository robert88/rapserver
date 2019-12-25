
;(function($){
	window.RBT = window.RBT || {};
    var resizeTimer;
    RBT.resizeStack = [];
    $(window).off("resize.chat").on("resize.chat",function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            for(var i=0;i<RBT.resizeStack .length;i++){
                RBT.resizeStack [i].fn.apply(RBT.resizeStack [i].context,RBT.resizeStack [i].params);
            }
        },200)
    })
})(RBT.dom);