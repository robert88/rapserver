try{
	window.RBT = window.RBT ||{};

	;(function(){
	/*start*/
		RBT.sytle = function(str){
			var head = document.getElementsByTagName("head")[0];
			if(head){
				var style = document.getElementsByTagName("style")[0];
				if(!style){
					style = document.createElement("style");
					head.appendChild( style );
				}
				//ie 不能直接插入css样式
				try{
					style.innerHTML += str;
				}catch(e){
					style.styleSheet.cssText += str;
				}
				
			}else{
				alert("网页未加载完成！")
			}
		}
	/*end*/
	}());
}catch(e){
	alert("RBT.style.js:"+e);
}