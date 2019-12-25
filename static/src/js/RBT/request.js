
window.RBT = window.RBT ||{};

;(function(){
	RBT.request = function (url){
		var file,
			head=document.getElementsByTagName('head').item(0);
			isJs = /\.js$/.test( url );
			isCss = /\.css/.test( url );
		if(isCss){
			file = document.createElement('link')
			file.href = url;
			file.rel = "stylesheet";
			file.type = type;
			head.appendChild( file );
		}else if(isJs){
			file = document.createElement('script')
			file.src = url;
			file.type = "text/javascript";
			head.appendChild( file );
		}else{
			alert("路径不合法！");
		}
		return file;
}());