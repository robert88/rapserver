
;(function($,resizeStack){
	window.RBT = window.RBT || {};
	//设置等高，必须是开始在同一水平线上
	function setHeight($item,start,end,height,level){
		for(var i=start;i<end;i++){
			$item.eq(i).addClass("height-row-"+level).height(height);
		}
	}
    function floatHeight(obj,item){
        $(obj).each(function () {
            var $that = $(this);
            var $item = $that.find(item);
            if($item.length<2){
                return;
            }
            var level = 0;//层数
            var start = 0;
            var perOffsetTop = $item.offset().top;
            var maxHeight = 0;
            $item.each(function (val,idx) {
                var $this = $(this).css("height",null);
                var top = $this.offset().top;
                if(top!=perOffsetTop){
                    setHeight($item,start,idx,maxHeight,level);
                    level++;
                    start = idx;
                    maxHeight = $this.height()
                }else{
                    maxHeight = Math.max(maxHeight,$this.height());
                }
            });
            if(start!=$item.length-1){
                setHeight($item,start,$item.length,maxHeight,level);
            }
        });
    }
//依赖dom.js prototype.js
	RBT.floatHeight = function (obj,item) {
        floatHeight(obj,item);
        resizeStack.push({fn:floatHeight,context:null,params:[obj,item]});
	}

})(RBT.dom,RBT.resizeStack);