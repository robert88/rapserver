
;
;(function($,resizeStack){
    //最小高度
    function setMinHeight(){
        var height =  $(window).height()-$(".top-fix-bar").height()-$(".footer").height()-20;
        $(".staticReport-wrap").css("min-height",height)
    }
    setMinHeight();
    resizeStack.push({fn:setMinHeight,context:this,params:[]})
    //添加文件
    $(".upload_file_background").getFile()

})(RBT.dom,RBT.resizeStack);