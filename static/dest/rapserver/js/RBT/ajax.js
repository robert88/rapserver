
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.each，RBT.extend
*/

;(function(){
	window.RBT = window.RBT || {};
	var accept ={
            "*": "*/*",
            html: "text/html",
            json: "application/json, text/javascript",
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
            text: "text/plain",
            xml: "application/xml, text/xml"
		}

    var contentType= "application/x-www-form-urlencoded; charset=UTF-8";

	RBT.ajax=function(opts){
		
		var xhr =	new XMLHttpRequest();
		
		if(opts.returnType){
			opts.async = true
		}
		
		if(opts.async!==false){
			opts.async = true;
		}
		var type = (opts.type&&opts.type.toUpperCase())||"GET"
        var data = opts.data
        if(typeof opts.data=="object"){
            data = RBT.url().parse(data);
        }
        if(type=="GET"){
            var newUrl = RBT.url(opts.url).appendParams(data);
            xhr.open(type,newUrl.url,opts.async);
		}else{
            xhr.open(type,opts.url,opts.async);
		}

		
		if(opts.returnType){
			xhr.responseType = opts.returnType
		}

		 if ( !opts.crossDomain ) {
			xhr.setRequestHeader("X-Requested-With" ,"XMLHttpRequest");
         }
		if(opts.headers){
			for(var headerKey in opts.headers){
				xhr.setRequestHeader(headerKey ,opts.headers[headerKey]);
			}
		}

		xhr.onload = function(ret){
			if(this.status=="200"){
				if(opts.dataType=="json"){
					try{
						(typeof opts.success=="function")&&opts.success(JSON.parse(xhr.response));
					}catch(e){
						console.error(e);
						(typeof opts.error=="function")&&opts.error(this.status,xhr,e);
					}
				}else{
					(typeof opts.success=="function")&&opts.success(xhr.response);
				}
				
			}else{
				(typeof opts.error=="function")&&opts.error(this.status,xhr);
			}
			(typeof opts.complete=="function")&&opts.complete(xhr);
			
			xhr = null;
			opts = null;
		}
		xhr.onerror=function () {
			(typeof opts.error=="function")&&opts.error(this.status,xhr);
		}

        xhr.setRequestHeader('Content-Type',contentType);

        if(opts.dataType&&accept[opts.dataType]){
            xhr.setRequestHeader('Accept',accept[opts.dataType]);
        }else{
            xhr.setRequestHeader('Accept','*/*');
        }

		if(data&&type=="POST"){
            xhr.send(data);
		}else{
            xhr.send();
        }

	}


})();