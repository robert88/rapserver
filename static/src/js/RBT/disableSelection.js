	
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.dom ,RBT.each
*/

	;(function($){
		var event = ("onselectstart" in document)?"selectstart":"mousedown";
		var oldSelect = document[event];
		var empty = function(){}
		$.disableSelection=function(){
            document.on(event, empty);
		}
		$.enableSelection=function(){
            document[event]=oldSelect
		}
	})(RBT.dom);