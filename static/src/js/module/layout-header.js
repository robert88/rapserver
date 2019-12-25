
;
;(function($,parseTeample,socketSend){

    $.floatHeight = RBT.floatHeight;
    $.ajax = RBT.ajax;
    $.cookie =RBT.cookie
  
    //手机端
    if($(window).width()<750){
        $(".top-fix-bar .nav-list").click(function () {
            $(this).toggleClass("hover")
        })
    }
    function initSize(val){
        var g = 1024*1024*1024;
        var m = 1024*1024
        var k = 1024
        if(val>g){
            return Math.floor(val/g)+"G"
        }else
        if(val>m){
            return Math.floor(val/m)+"M"
        }else if(val>k){
            return Math.floor(val/k)+"Kb"
        }else{
            return Math.floor(val)+"b"
        }
    }
    //
    function initSingle(perform) {
        var $content = $(".top-fix-extend")
        $(".top-fix-bar .signal-icon").click(function () {
            $content.toggleClass("hover")
        });
        $(document).click(function (e) {
            if($(e.target).parents(".top-fix-extend").length||$(e.target).hasClass(".top-fix-extend")){
                return;
            }
            $content.removeClass("hover")
        })
        var $bandwidh = $(".top-fix-bar .bandwidth-info")
        $bandwidh.find(".readyStart").html(perform.readyStart+"ms");
        $bandwidh.find(".initDomTreeTime").html(perform.initDomTreeTime+"ms");
        $bandwidh.find(".whitePaper").html(perform.whitePaper+"ms");
        if(perform.whitePaper>4000){
            $bandwidh.find(".whitePaper").removeClass("t-warning").addClass("t-danger")
        }
        $bandwidh.find(".loadTime").html(perform.loadTime+"ms");
        $bandwidh.find(".loadTime").html(perform.loadTime+"ms");
        $bandwidh.find(".netSpeek").html(initSize(perform.transfer[0]/perform.initDomTreeTime*1000)+"/s");
        $bandwidh.find(".requestNum").html(perform.requestNum+"个");
        var htmltransfer = ["<ul class=' col'><li class='col6'>{0}</li><li class='col6'>{1}</li></ul>".tpl("总量",initSize(perform.transfer[0])),
            "<ul class=' col'><li class='col6'>{0}</li><li class='col6'>{1}</li></ul>".tpl("当前页",initSize(perform.transfer[1])),
            "<ul class=' col'><li class='col6'>{0}</li><li class='col6'>{1}</li></ul>".tpl("资源图片",initSize(perform.transfer[2])),
            "<ul class=' col'><li class='col6'>{0}</li><li class='col6'>{1}</li></ul>".tpl("资源css",initSize(perform.transfer[3])),
            "<ul class=' col'><li class='col6'>{0}</li><li class='col6'>{1}</li></ul>".tpl("资源js",initSize(perform.transfer[4]))
        ]
            $bandwidh.find(".transfer").html(htmltransfer.join(""));
    }
    if(RBT.performance){
        initSingle(RBT.performance);
    }else{
        $("body").on("performance",function () {
            initSingle(RBT.performance)
        });
    }

    function initLogin(){
        if($.cookie("loginStatus")){
            
        }else{
            $(".J-login").click(function (e) {
                return false
            });
        }
    }
    function initSearch(){
        var timer;
        var loadparams=[];
        var perName="";
        function searchByAjax(name){
            loadparams.push(name);
            $.ajax({
                url:"/index/findFile",
                type:"get",
                dataType:"json",
                data:{data:name},
                success:function (ret) {
                    if(loadparams[loadparams.length-1]==name){
                        loadparams = [];
                    }else{
                        return;
                    }
                    if(ret=="/index/findFile"){
                        $.tips("404 not find action /index/findFile","error");
                    }else if(ret.length){
                        var menu = [];
                        var firstNameFilter = $(".J-search").val().split(":");
                        if(firstNameFilter.length>1){
                            firstNameFilter = firstNameFilter[0]
                        }else{
                            firstNameFilter = null;
                        }
                        $.each(ret,function(idx,val){
                            if(val.indexOf("build")==-1&&val.indexOf("ebg-doc")==-1){
                                var firstName = val.replace(/^\//,"");
                               var firstName =  firstName.slice(0,firstName.indexOf("/"));
                               var lastName = val.slice(val.lastIndexOf("/"),val.length);
                               if(!firstNameFilter || $.trim(firstNameFilter.toLowerCase())==$.trim(firstName).toLowerCase()){
                                menu.push({href:val,value:firstName+":"+lastName,className:"downmenu-item",attrs:"href='"+val+"' target='_blank' title='"+val+"'" })
                               }
                               
                            }else{
                                console.log(val);
                            }
                        })
                        $(".J-search").downMenu().add(menu);
                        $(".J-search").focus()
                    }
    
                }
            })
        }
        
        $(".J-search").on("keyup",function (e) {
            var name = $(this).val();
            // 相同、
            if(name==perName){
                return;
            }
            perName = name;
            //空的
            if(name==""||name==null){
                $(".J-search").downMenu().add([]);
                $(".J-search").focus()
                return 
            }
            clearTimeout(timer);
            timer = setTimeout(function(){
                searchByAjax(name);
            },180);
        });
        // $(".top-search").on("mousedown",".down-menu-wrap a",function(){
        //     var href = $(this).data("href")
        //     if(href){
        //         $(this).attr("href",href).attr("target","_blank");
        //     }
        // })
        

    }
    initLogin();
    initSearch();
})(RBT.dom,RBT.parseTeample,RBT.socketSend);


