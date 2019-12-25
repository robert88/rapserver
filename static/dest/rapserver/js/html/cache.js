;(function($,resizeStack){
    function setMinHeight(){
        var height =  $(window).height()-$(".top-fix-bar").height()-$(".footer").height()-20;
        $(".cache-content").css("min-height",height)
    }
    setMinHeight();
    resizeStack.push({fn:setMinHeight,context:this,params:[]})
        /**
     * 更新action
     */
    $(".clearAction").on("click",function(){
        $.ajax({url:"/global/rapServerRefreshAction",type:"post",success:function(ret){
                $.tips("Refresh Action Success!","success");
            }})
    });
    /**
     * 重启服务
     */
    $(".restartServer").on("click",function(){
        $.ajax({url:"/global/rapServerRestart",data:{cmd:"start "+$("#cmdPath").val()},type:"post",success:function(ret){
				$.tips("Restart server Success!","success");
        },error:function(){

        }})
    });
   /**
     * 获得可执行文件
     */
        $.ajax({url:"/global/getCmd",dataType:"json",type:"post",success:function(ret){
            var staticPathMap =  ret.map(function(val){return {value:val}});
            $("#cmdPath").downMenu().add(staticPathMap);
        },error:function(){

        }})
    

})(RBT.dom,RBT.resizeStack);