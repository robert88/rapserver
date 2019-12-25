;(function ($,parseTeample) {
	var templateHtml = "<dl class='down-menu-wrap' style='width:[[obj.width]]px;left:[[obj.left]]px'></dl>"
	var templateData = "[[#each obj]]<dd class=' matched'><a data-href='[[$value.href]]' class='[[$value.className]]' [[$value.attrs]]>[[$value.value]]</a> <i class='fa-close'></i></dd>[[#endEach]]";
	$.fn.downMenu = function () {
	    var that = this;
		 this.each(function () {
		     var $this = $(this)
            var $parent = $this.parent();
            if($this.data("init-downmenu")){
            	return;
			}
             $this.data("init-downmenu",true);
            $parent.append(parseTeample(templateHtml,{left:$this.offset().left-$parent.offset().left,width:$this.width()}));
            var $menu = $parent.find(".down-menu-wrap");
            if( !$parent.hasClass("relative")){
                $parent.addClass("relative")
			}
			var timer
             $this.on("focus",function () {
                 clearTimeout(timer);
                $menu.addClass("active");
            });
             $this.on("blur",function () {
                 clearTimeout(timer);
                 timer = setTimeout(function () {
                     $menu.removeClass("active");
                 },200)
            });
             var inputTimer
             $this.on("keyup",function () {
                 clearTimeout(inputTimer);
                 inputTimer = setTimeout(function () {
                    var val = $this.val().trim();
                    if(val){
                        $menu.find("dd").each(function () {
                            var htmlVal = $(this).find("a").html().trim();
                            if(new RegExp(val.toReg()).test(htmlVal)){
                                $(this).addClass("matched");
                            }else{
                                $(this).removeClass("matched");
                            }
                        })
                    }else{
                        $menu.find("dd").addClass("matched");
                    }
                 },200)
             });
             $menu.on("click",">dd",function () {
                 clearTimeout(timer);
                 var $dd = $(this);
                 $menu.removeClass("active");
                 $this.val($dd.find("a").html().trim()).trigger("change");
             });
        })

        return {add:function (data) {
            var newObj = [];
            if(data&&typeof data=="object"){

                $.each(data,function (idx,val) {
                    if(typeof val=="object"&& val.value){
                        newObj.push(val);
                    }else{
                        newObj.push({value:idx,href:val,className:"downmenu-item"})
                    }
                });
            }
                that.each(function () {
                    var $parent = $(this).parent();
                    var $menu = $parent.find(".down-menu-wrap");
                    $menu.html(parseTeample(templateData,newObj));
                });
                return this;
            }}
    }
})(window.RBT.dom,RBT.parseTeample);

