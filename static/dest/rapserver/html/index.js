
;
;(function($,parseTeample){

	$.floatHeight = RBT.floatHeight;
	$.ajax = RBT.ajax;

	//同行等高
	$.floatHeight(".index-content",".index-static-item");


    /**
     * 根目录
     */
	function initRootInfo(){
        var $rootInfo = $("#rootInfo");
        var orgHtml = 	'[[#each obj]]<li class="col4 t-info">[[$index]]</li><li class="col8 relative">[[$value]][[#if ($index!=\'rapserver\')]]<a class="fa-times" title="可删除"></a>[[#endIf]]</li>[[#endEach]]';
        //更新显示的ui
        function updateRootInfo(ret){
            $rootInfo.html(parseTeample(orgHtml,ret));
            for(var key in ret){
                setCache(key,ret[key]);
            }
        }
        //获取
        $.ajax({url:"/root/get",dataType:"json",success:function(ret){
            updateRootInfo(ret)
        },error:function (code,xhr) {
                $.tips(xhr.responseText,"error");
        }});

        // 删除
        $rootInfo.on("click",".fa-times",function(){
            $.ajax({url:"/root/del",data:{path:$(this).data("id")},dataType:"json",success:function(ret){
                    updateRootInfo(ret)
             },error:function (code,xhr) {
                    $.tips(xhr.responseText,"error");
              }})
        });

        //添加
        $("#addRootForm").validForm({
            focus: function ($form) {
                $form.find(".form-tips-error").hide();
            },
            success: function ($btn, $form) {
                var formParam = {
                    path:$form.find("[name='path']").val(),
                    rootId:$form.find("[name='rootId']").val()
                }
                $.ajax({
                    url: "/root/add",
                    data: formParam,
                    type: "post",
                    dataType: "json",
                    success: function (ret) {
                        updateRootInfo(ret)
                        formParam = null;
                    },error:function (code,xhr) {
                        $.tips(xhr.responseText,"error");
                    }
                })
            }
        });
	}

	/**
	 * 可以访问的html
	 *
	 */
	function join2(ret){
		var $rootInfo = $("#rootInfo");
		// var temp =
		$.each(ret,function(idx,val){
			var $rootInfoSingle = $rootInfo.find("."+idx);
			if($rootInfoSingle.length==0){
				$rootInfoSingle = $rootInfo.append(rootInfoTempl.tpl(idx,"",val));
			}else{
				$rootInfoSingle.find(".rootHtml").html("{{#each data}}<p><a href='{{$value}}' class='a-link'>{{$value}}</a></p>{{#endEach}}".templ({data:val}))
			}
		})
	}


	/**
	 * 设置更新cookie
	 */
	var setLocalStorageTimer
	function setCache(key,value){
		var staticPathMap =  parseStaticMap();
        staticPathMap[key] = value;
        localStorage.setItem("staticPathMap",JSON.stringify(staticPathMap));
        clearTimeout(setLocalStorageTimer);
        setLocalStorageTimer =  setTimeout(function () {
            initFormCache();
        },200);
	}
	/**
	 * 导入cookie
	 */
	function initFormCache(){
        var staticPathMap =  parseStaticMap();
        $("#staticRootId").downMenu().add(staticPathMap);
        $("#staticRootId").off("change").on("change",function () {
            var key = $(this).val();
            if(staticPathMap[key]){
                $("#staticRootPath").val(staticPathMap[key])
            }
        })
	}
    /**
     * 解析cookie里面的值
     */
	function parseStaticMap(){
        var staticPathMap =  localStorage.getItem("staticPathMap");
        if(!staticPathMap){
            staticPathMap = {};
        }else{
            try{
                staticPathMap = JSON.parse(staticPathMap);
            }catch (e) {

            }
        }
        return staticPathMap;
	}

    /**
     * 更新action
     */
    $(".clearAction").on("click",function(){
        $.ajax({url:"/global/refreshAction",type:"post",success:function(ret){
                $.tips("Refresh Action Success!","success");
            }})
    });
    /**
     * 重启服务
     */
    $(".restartServer").on("click",function(){
        $.ajax({url:"/global/restartRapserver",type:"post",error:function(ret){
				$.tips("Restart server Success!","success");
        }})
    });


	function initCpuChart(){
		var currentM = new Date().getTime();
		var xaxis = [];
		for(i=0;i<12;i++){
			xaxis.push(currentM-(12-i)*60*60*1000);
		}
		$.ajax({
			url:"/global/rapserverCpuInfo",
			success:function (ret) {
				console.log(ret);
			}
		});
		var dataMap={
			x:[currentM-60*60*1000,currentM-2*60*60*1000,currentM-3*60*60*1000,currentM-4*60*60*1000],
			y:[10,11,32,35]
		};
		$(".module-cpu-wrap").chart({
			axis:{
				style:"border-left:1px solid #999;border-bottom:1px solid #999;left:30px;bottom:30px;right:30px;top:30px",
				xstyle:"left:30px;bottom:10px;right:30px;",
				yformat:function (val) {
					return val+"%"
				},
				xformat:function (val) {
					return val.toString().toDate().format("hh:mm")
				},
				ystyle:"left:10px;top:30px;bottom:30px;",
				x:xaxis,
				y:[0,10,20,30,40,50,60,70,80,90,100],
			},
			data:dataMap
		},function(chart){

		})
	}
    /**
     * 填充表单数据
     */
    initFormCache();
    initRootInfo();
	initCpuChart();
	var ws = new WebSocket("ws://192.168.43.227:8081");
		ws.onopen = function()
		{
			console.log("open");
			ws.send("hello");
		};
	ws.onmessage = function(evt)
	{
		console.log(evt.data)
	};
	ws.onclose = function(evt)
	{
		console.log("WebSocketClosed!");
	};
	ws.onerror = function(evt)
	{
		console.log("WebSocketError!");
	};
    /**
     * 添加根目录
     */
    // $("#modifyFileName").validForm({
    //     focus: function ($form) {
    //         $form.find(".form-tips-error").hide();
    //     },
    //     success: function ($btn, $form) {
    //         var formParam = {
    //             path:$form.find("[name='path']").val(),
    //             filterReg:$form.find("[name='filterReg']").val(),
    //             fileType:$form.find("[name='fileType']").val(),
    //             replaceFun:$form.find("[name='replaceFun']").val()
    //         };
    //         setCache("#modifyFileName",formParam);
    //         $.ajax({
    //             url: "/index/modifyFileName",
    //             data: formParam,
    //             type: "post",
    //             dataType: "json",
    //             success: function (ret) {
    //                 join(ret)
    //             }
    //         })
    //     }
    // });

})(RBT.dom,RBT.parseTeample);


