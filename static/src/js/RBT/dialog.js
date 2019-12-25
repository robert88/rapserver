/* dialog 0.0.1 (Custom Build) | MIT & BSD
 * Build: 
 */
(function($) {



	//功能参数
	var settings = {
		title: "", //无标题
		mask: true, //非模态（无遮罩）
		maskClose:true,
		time: 0, //不自动关闭
		draggable: false,
		draggableTrigger:"",
		draggableResize:false,
		close:true,
		// button:[{text:"确定",click:function(){},type:"warn",style:""}],
		animateType:"fadeTop",
		closeStyle:"",
		headerStyle:"",
		// dialogClass:"",为dialog添加样式
		zindex:1000,
		frameType:"dialog",
		frame:null,
		width:"auto",//兼容之前代码
		height:"auto",//兼容之前代码
		closeAfter:null,//关闭之前
		closeBefore:null,//关闭之后
		changeSize:false,//调节宽高
		structureReady:null,//根结构渲染了
		minTop:20,
		ready:null//dialog的dom已经初始化
		//headerStyle,titleStyle,closeStyle,bodyStyle,maskStyle
		//renderAfter
	}
if(!$.i18n){
	$.i18n = function (key) {
		return key;
	}
}
	//dialog初始化程序入口
	// dialog($(".data"))-->弹出一个默认窗口
	//dialog("msg",opts)
	function Dialog(content,opts) {

		//默认html结构
		var $dialog = get$("dl-"+ opts.frameType);
		var $header = get$("dl-header");
		var $title = get$("dl-title");
		var $close = get$("dl-close").html("×");
		var $body = get$("dl-body");
		var $footer = get$("dl-footer");
		// var $loading = get$("dl-load");
		var $mask = get$("dl-mask");//创建一次 dl-mask全局
		var $css = get$("dl-css");//创建一次 dl-mask全局
		var $js = get$("dl-js");//创建一次 dl-mask全局

		//dialog 避免id
		if ( /\s+id\s*=\s*"?'?\s*(\w+)\s*'?"?(\s|>)/.test(content.replace(/\s+/mg," ")) ){
				console.log("warn dialog has id=",RegExp["$1"]);
		}

		//添加dialog标识
		if(opts.id){
			$dialog.attr("id",opts.id)
		}

		renderStructure($mask,$dialog,opts);

		if (content.match(/^url:(.*)$/ig)) {
			var action = $.trim(RegExp.$1);

			$dialog.addClass("loading");

			$body.load(action,function(){

				PAGE.loadFile(action.replace(".html",".css?ver="+PAGE.version),"link",function () {

					$dialog.removeClass("loading");

					initDialog($dialog,$header,$title,$close,$body,$footer,$mask,opts);

					if(window.PAGE.STATICDEBUG){
						var s = document.createElement("script");

						s.type="text/javascript";

						$body.append(s);

						//应该在append之后赋值
						s.src =action.replace(".html",".js?ver="+PAGE.version);

					}
				},$dialog,$dialog);
			});

		}else{
			
			$body.html(content);
			
			initDialog($dialog,$header,$title,$close,$body,$footer,$mask,opts);
			
		}
		return $dialog;
	}

	function initDialog($dialog,$header,$title,$close,$body,$footer,$mask,opts){
		
		//渲染dialog
		renderDialog($dialog,$header,$title,$close,$body,$footer,$mask,opts);

		//初始化dialog功能
		runDialog($dialog, opts);

		opts.frame = $dialog[0];

		$dialog.data("opts",opts);

		$.dialog.dlOpts.push(opts);
		
		if(typeof opts.ready=="function"){
			opts.ready($dialog,opts);
		}
		
	}
	//渲染结构
	function renderStructure($mask,$dialog,opts){
		if(opts.mask){
			$mask.appendTo('body').show();
		}

		$dialog.appendTo('body');
		if(typeof opts.structureReady=="function"){
			opts.structureReady($dialog)
		}
	}
	//渲染dialog
	function renderDialog($dialog,$header,$title,$close,$body,$footer,$mask,opts){

		var dialogIndex = ";z-index:"+ (opts.zindex*1 + ($.dialog.dlOpts.length*2+1))+";";

		//--dl-mask----------------------
		if(opts.mask){

			//层次问题,dl-mask紧跟最上面的dialog,zindex基点
			var maskIndex = ";z-index:"+ (opts.zindex*1 + ($.dialog.dlOpts.length*2) )+";";

			renderStyle($mask,""+ maskIndex +(opts.maskStyle||"") );

			opts.$mask = $mask
		}

		//标题--dl-header----------------------
		if(opts.title){

			$header.append($title.html($.i18n(opts.title)));

			//头部样式
			renderStyle($header,""+(opts.headerStyle||"") );

			renderStyle($title,""+(opts.titleStyle||"") );
			//已title为最小宽度
			
			var $test = $("<div style='position:absolute;left:-1000px;'></div>").html($header[0].outerHTML).appendTo('body');
			$header.css("min-width",$test.width());
			$test.remove();
			$header.appendTo($dialog);

		}

		//--dl-dialog 样式------------------
		if(opts.dialogClass){
			$dialog.addClass(opts.dialogClass);
		}
		renderStyle($dialog,"position:absolute;" + dialogIndex + (opts.dialogStyle||"") );

		//--dl-body 样式------------------
		//兼容之前代码
		if(opts.width!="auto"){
			var w = parseFloat($.trim(opts.width),10)+"px";
		}
		if(opts.height!="auto"){
			var h = parseFloat($.trim(opts.height),10)+"px";
		}
		var oldBodyCode = "width:"+(w?w:opts.width)+";"+"height:"+(h?h:opts.height)+";padding:15px;";
	
		renderStyle($body, oldBodyCode+ (opts.bodyStyle||"") );

		$dialog.append($body)

		//标题--dl-close----------------------

		if(opts.close){
			//关闭样式
			var titleHasClose;
			if(opts.title){
				titleHasClose = "right:-1px;top:0;color: #cb0101;font-size:28px;line-height:38px;width:42px;height:42px;"
			}else{

				 titleHasClose = "background-color:#fff;right: 10px;top: 4px;width: 24px;line-height: 20px;height: 24px;font-size: 24px;"
			}
			if(typeof opts.close=="string" && $(opts.close).length ){
				$close = $dialog.find(opts.close).addClass('dl-close');
			}else{
				renderStyle($close,"position:absolute;left:auto;cursor:pointer;text-align:center;"+titleHasClose + (opts.closeStyle||"") );
				$dialog.append($close);
			}
		}
        //console.log( $close)
		//--dl-footer 样式-------------------
		if(opts.button && opts.button.length){

			renderStyle($footer,(opts.footerStyle||"") );

			for(var i=0; i<opts.button.length;i++){

				var $btn = $("<a class='btn btn-primary btn-m dl-bottom'>"+opts.button[i].text+"</a>");
				if(opts.button[i].className){
					$btn.addClass(opts.button[i].className);
				}
				renderStyle($btn,(opts.button[i].buttonStyle||""));
				
				opts.button[i].btn = $btn;

				$footer.append($btn);

			}

			$footer.appendTo($dialog);
		}

		setCenter($dialog,opts);

		if(typeof opts.renderAfter=="function"){
			opts.renderAfter($dialog,opts,$header,$title,$close,$body,$footer,$mask);
		}
	}

	//dialog执行，添加功能
	function runDialog($dialog, opts){
		var close = function(e) {
			$.dialog.close($dialog,e);
		};
		//公用mask必须每次都重新绑定或者去绑定
		if(opts.maskClose&&opts.$mask){
			opts.$mask.on("click",function(e){
				close(e);
			});
		}
		if(opts.changeSize&&$.fn.changeSize){
			$dialog.changeSize("enable");
		}
		//按钮
		if(opts.button&&opts.button.length){
			for(var i=0;i<opts.button.length;i++){
				;(function(idx){
					opts.button[idx].btn.click(function(e){
						if(typeof opts.button[idx].click=="function"){
							if(opts.button[idx].click(e,$dialog)===false){
								return;
							}
						}
						close(e);
					})
				})(i);
			}
		}

		$dialog.on("click",".dl-close,.dl-btn",close);

		$dialog.on("setcenter",function () {
			setCenter($dialog,opts);
		});

		if (opts.draggable) {
			if(typeof opts.draggableTrigger=="string" && $dialog.find(opts.draggableTrigger).length){
				initDraggable($dialog.find(opts.draggableTrigger),$dialog);
			}else if(opts.title){
				initDraggable($dialog.find(".dl-header"),$dialog);
			}else{
				initDraggable($dialog,$dialog);
			}
			if(!opts.draggableResize){
				$dialog.addClass('dl-noresize');
			}
		}
		if (opts.time) {
			$.dialog.timeout($dialog, opts.time);
		}

		if(opts.animateType&& $.dialog[opts.animateType]){
			$.dialog[opts.animateType]($dialog);
		}else{
			$dialog.show()
		}
	}

	//对外提供接口$.tips $.alert $.comfirm
	$.extend($,{
		dialog:function(content,opts){

			if( $.type(content)=="object") {

				//匹配jq对象
				if( typeof content.html == "function"){
					content = content.html();

				//匹配设置项
				}else{
					opts = content;
					content = $.i18n(opts.msg) || "";
				}
			}

			//确保opts是个对象
			opts = $.extend(true,{},settings,opts);

			return new Dialog(content,opts);
		},
		tips: function(msg, type,time,callback) {
			var opts = {};

			if(typeof time=="function"){
				callback=time;
				time = 3000;
			}
			if(typeof type=="object"){
				opts = type;
			}else{
				opts = {type:type,time:time,closeAfter:callback}
			}


            opts = $.extend(true,{type:"warn",time:3000,zindex:2000,frameType:"tips",maskClose:true},opts);

			if(opts.reload===true){
				opts.reload = function(){window.location.reload();}
			}

            var content = '<div class="dl-tips-{0}"><i class="dl-tips-img"></i><span class="dl-tips-text">{1}</span></div>'.tpl(opts.type,msg);

			return new Dialog(content,opts);

		}
	});


	/*自己调用只能调用一次，不然会出现死循环*/
	function destroyDialog(obj){

		var newDestroy = [];

		for(var i=0;i<obj.destroy.length;i++){
			if(typeof obj.destroy[i]=="function"){
				//注意顺序，相同的destroy是不会被执行的
				if(  newDestroy.indexOf(obj.destroy[i])==-1 && obj.destroy[i]()!=true){
					newDestroy.push(obj.destroy[i])
				}
			}
		}

		obj.destroy = newDestroy;
	}

	//dialog默认全局属性和方法
	$.extend($.dialog,{
		dlOpts: [],
		timeout:function($target,time){
			var that = this;
			setTimeout(function() {
				that.close($target);
			}, time);
		},
		//删除一个触发
		closeOnebefore:function(idx,e){
			//外部定义closebefore
			if(this.dlOpts[idx] && typeof this.dlOpts[idx].closeBefore == "function"){
				//返回flase不关闭 this指向当前参数
				return this.dlOpts[idx].closeBefore($(this.dlOpts[idx].frame),e);
			}

		},
		//删除一个触发
		closeOneAfter:function(idx){
			if(this.dlOpts[idx]){
				if(typeof this.dlOpts[idx].closeAfter  == "function"){
					this.dlOpts[idx].closeAfter($(this.dlOpts[idx].frame));
				}
				if(typeof this.dlOpts[idx].reload =="function"){
					this.dlOpts[idx].reload($(this.dlOpts[idx].frame))
				}
			}

		},
		//始终会触发
		before:function(e){

			if(typeof this.closebefore == "function"){
				return this.closebefore(e);
			}
		},
		//始终会触发
		after:function(e){
			if(typeof this.closeCallBack == "function"){
				this.closeCallBack(e);
			}
			$(".err-tips").remove();

		},
		//获得dialog的索引
		getOptsIndex:function($dialog){
			for (var i = 0; i < this.dlOpts.length; i++) {
				if(this.dlOpts[i].frame==$dialog[0]){
					return i;
				}
			}
			return -1;
		},
		/*全部统一处理*/
		destroy:[],

		//type ==all 时只要idx在其中就可以删除，否则匹配到type类型就删除 type="all,dialog,alert,tips,confirm"
		delDl:function(type, idx,e){

				if( ( idx > -1 && idx < this.dlOpts.length ) && ( this.dlOpts[idx].frameType == type || type == "all" ) ){
					//参数上关闭
					if(this.closeOnebefore(idx,e)===false){
						return false;
					}

					/*dom 删除时调用*/
					var $self = $(this.dlOpts[idx].frame);

					//dom上的关闭
					if(typeof $self[0].destroy == "function" ){
						if($(this.dlOpts[idx].frame)[0].destroy()===false){
							return false;
						}
					}

					var $mask = this.dlOpts[idx].$mask;
					if($mask&&$mask.length){
						$mask.remove();
					}

					$(this.dlOpts[idx].frame).remove();
					this.closeOneAfter(idx);
					this.dlOpts.splice(idx,1);
					return true;
				}
				return false;
		},

		close: function($dialog,e) {

			//返回flase不关闭
			if(this.before(e)===false){
				return ;
			}

			destroyDialog($.dialog);

			this.delDl( "all", this.getOptsIndex($dialog),e );

			this.after(e);
		},

		closeAll: function(type) {
			//返回flase不关闭
			if(this.before()===false){
				return ;
			};
			type = type||"dialog";
			for (var i = 0; i < this.dlOpts.length; i++) {
				if( this.delDl( type, i )== true){
					i--;//指针回游
				}
			}

			this.after();
		},
		closeLast: function(type) {

			//返回flase不关闭
			if(this.before()===false){
				return ;
			};
			type = type||"dialog";

			for (var i = this.dlOpts.length-1; i >=0; i--) {

				//如果是关闭类型为type或者全部删除
				if( this.delDl( type, i )== true){
					break;//删除一次指针不用回
				}

			}

			this.after();
		},

		closeFrist: function(type) {
			//返回flase不关闭
			if(this.before()===false){
				return ;
			};
			type = type||"dialog";

			for (var i = 0; i <this.dlOpts.length; i++) {

				//如果是关闭类型为type或者全部删除
				if( this.delDl( type, i )== true){
					break;//删除一次指针不用回
				}


			}
			this.after();
		},
		getCenter:function($target) {
			var w = $target.width(),   h = $target.height();
			var innerH = getInnerHeight(),    innerW = getInnerWidth();
			var left = $target.parent().offset().left,    top = $target.parent().offset().top;
			var x = getFloat($target.css("left")),    y = getFloat($target.css("top"));
			var scrollTop = $(window).scrollTop();
			var scrollLeft = $(window).scrollLeft();
			var dw =(innerW - w);
			var dh = (innerH - h);
			dw = dw<0?0:dw;
			dh = dh<0?0:dh;
			if ($target.css("position") == "absolute") {
				x =dw/ 2 +scrollLeft -left;
				y = dh / 2+scrollTop -top;

			} else {
				x = dw / 2;
				y = dh/ 2;
			}
			return {
				x: x,
				y: y,
				isoverY:dh==0?true:false,
				isoverX:dw==0?true:false,
				isTop:y==scrollTop?true:false,
				isLeft:x==scrollLeft?true:false
			};
		},
		fadeTop:function($target){
			var top = $target.css("top");
			$target.css("top",0)
			$target.animate({top:top},200);
		}
	});

		//获取窗口内部高度
	function getInnerHeight() {
		return (window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight)
	}

	//获取窗口内部宽度
	function getInnerWidth() {
		return (window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth)
	}

	//使用call设置居中
	function setCenter($target,opts) {
		$target.each(function(){
			var $this = $(this);
			opts = opts||$this.data("opts");
			var center = $.dialog.getCenter($target);
			if(center.isTop&&opts&& opts.minTop){
				center.y = center.y+opts.minTop;
			}
			$target.stop(true,true);
			if((center.isoverY||center.isoverX) && $target.data("setcenter")){

				if(center.y<parseFloat($this.css("top"),10)){
					$this.css({top: center.y});
				}
				if(center.x<parseFloat($this.css("left"),10)){
					$this.css({left: center.x});
				}
			}else{
				if(opts.frameType=="dialog"){
					$this.css({top: (PAGE&&PAGE.dialogTop)?($(window).scrollTop()+opts.minTop):center.y,left: center.x});
				}else{
					$this.css({top: center.y,left: center.x});
				}
			}

			$target.data("setcenter",true);


		});
	}

	//获得浮点数
   function getFloat(str){
   	return parseFloat($.trim(str),10)||0;
   }

	//窗口大小改变时始终保持居中
	var initResize = function(){
		var perHeight = 0;
		var timer;
		$(window).resize(function() {
			if (Math.abs(getInnerHeight() - perHeight) > 10) {
				$(".dl-dialog").add(".dl-confirm").add(".dl-tips").add(".dl-alert").not(".dl-noresize").each(function(){
						setCenter($(this));
				});
				preHeight = getInnerHeight();
			}
		}).scroll(function () {
			clearTimeout(timer);
			setTimeout(function () {
				$(".dl-dialog").add(".dl-confirm").add(".dl-tips").add(".dl-alert").not(".dl-noresize").each(function(){
					setCenter($(this));
				});
			},200);
		})
	}.call();

	// 将font-size:12px;text-align:center;解析为对象
	function getStyleObject(str){
		var obj = {};
		var str = str.split(";");
		var temp;
		for(var i=0;i<str.length;i++){
			if(str[i]){
				temp = str[i].split(":");
				if(temp.length==2){
					obj[$.trim(temp[0])] = temp[1];
				}
			}
		}
		return obj;
	}

	//创建一个指定className的div
	function get$(className) {
		return $("<div></div>").addClass(className);
	}

	//dialog窗口实体样式
	function renderStyle($target,style){
		$target.css( getStyleObject( style ) );
	}
	//初始化拖动功能
	function initDraggable($trigger,$target) {
		
		if( $trigger.length==0 && $target.length==0 ){
			return console.log("draggable false by not find trigger or target");
		}
		
		var Jmove = {};
		
		//处理移动
		function handleMouseup(e){
			Jmove.down = false;
			$(document).off("selectstart").on('mousemove', handleDraggable).off("mouseup",handleMouseup);
		}
	
		//处理移动
		function handleDraggable(e){
				var x = event.pageX;
				var y = event.pageY;
				$(".dl-drag").each(function(){
					var $this = $(this);
					if(Jmove.down){
						$this.css({
							left: x - Jmove.dx +Jmove.px,// $this.data("dx") + $this.data("px"),
							top: y - Jmove.dy+Jmove.py// $this.data("dy") + $this.data("py")
						});
					}
				});
		}
		
		

		$target.addClass('dl-drag');
		
		$trigger.css("cursor","move").on('mousedown', function(event) {
			Jmove = {
				dx:event.pageX,
				dy:event.pageY,
				px:(parseInt($target.css("left")) || 0),
				py:(parseInt($target.css("top")) || 0),
				down:true
			};
			$(document).on('mousemove', handleDraggable).on("mouseup",handleMouseup).on("selectstart",function(){return false;});
		});


	}


})(RBT.dom);