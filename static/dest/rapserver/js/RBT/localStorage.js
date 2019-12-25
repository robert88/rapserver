try{
	window.RBT = window.RBT||{};

/*
** rbt 封装cookie
*/
    RBT.cookie=function(name,value,opts){
        if(arguments.length==0){
			return document.cookie;
        }else if(arguments.length==1){
			return fn.getItem(name);
		}else if(arguments.length>=2){
            fn.setItem(name,value);
		}
	}
    var fn = {
        getItem: function (sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        },
        key: function (nKeyId) {
            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
        },
        setItem: function (sKey, sValue) {
            if(!sKey) { return; }
            //必须设置为过期时间，不然就删不掉
            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            this.length = document.cookie.match(/\=/g).length;
        },
        length: 0,
        removeItem: function (sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) { return; }
            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            this.length--;
        },
        hasOwnProperty: function (sKey) {
            return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        }
    }
    RBT.cookie.prototype = fn

/*
** localStorage window.parent cookie 整合为离线存储
*/
	;(function(){
		 var localStorage = window.localStorage,
		 	 isWriteLocalStorage = false,
		 	 isWriteCookie = false;

		 function checkWrite(obj){
		 	var isWrite = false;
		 	try{
			 	if( typeof obj === "object"){
		 			obj.removeItem("local_test_temp");
				 	obj.setItem( "local_test_temp", true );
					isWrite = obj.getItem( "local_test_temp" );
					if( isWrite ){
						obj.removeItem( "local_test_temp" );
					}		
				}
		 	}catch(e){
		 		;//no alert
		 	}
			return isWrite;
		 }
		
		isWriteLocalStorage = checkWrite( localStorage );
		isWriteCookie = checkWrite( RBT.cookie );


		//ios7   ie8以下兼容
		if ( !isWriteLocalStorage ) {

			if( isWriteCookie ){
				RBT.localStorage = RBT.cookie;
			}else{
				if(!RBT.localStorage){
					RBT.localStorage = {
						getItem: function (sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
							return this[sKey];
						},
						setItem: function (sKey, sValue) {
							if(!sKey) { return; }
							window.parent.RBT = window.parent.RBT||{};
							window.parent.RBT.localStorage[sKey] = sValue;
							this[sKey] = sValue;
						}
					}
				}
			}

		/*chrome 不支持本地cookie*/
		}else{
			RBT.localStorage = localStorage;
		}

	}());

}catch(e){
	alert("RBT.localStorage.js:"+e);
}
