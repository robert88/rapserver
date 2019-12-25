
;
;(function($,parseTeample,resizeStack){
    function setMinHeight(){
        var height =  $(window).height()-$(".top-fix-bar").height()-$(".footer").height()-20;
        $(".cache-content").css("min-height",height)
    }
    setMinHeight();
    resizeStack.push({fn:setMinHeight,context:this,params:[]})

    function setHtml(type,orgHtml,ret){
        var arr = [];
        $.each(ret,function (idx,file) {
            if(new RegExp("^\/"+type).test(file)){
                arr.push(file)
            }
        });
        $("."+type+"-wrap ul").html(parseTeample(orgHtml,arr));
    }
    //获取
    $.ajax({url:"/log/get",dataType:"json",success:function(ret){
            var orgHtml = '[[#each obj]]<li class=" bd-bottom bd-dashed pb10 mt10"><span class=" t-info mr10">[[$index]]</span><a href="[[$value]]" class="a-link" target="_blank">[[$value]]</a></li>[[#endEach]]';
            setHtml("log",orgHtml,ret)
            setHtml("warn",orgHtml,ret)
            setHtml("info",orgHtml,ret)
            setHtml("error",orgHtml,ret)
        },error:function (code,xhr) {
            $.tips(xhr.responseText,"error");
        }});
})(RBT.dom,RBT.parseTeample,RBT.resizeStack);