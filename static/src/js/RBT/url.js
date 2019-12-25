;(function(){
	window.RBT = window.RBT || {};
	
	function URI(uri){
		if(uri){
            this.url = uri.replace(/\s+/g, "")
                .replace(/"|'/g, "")
                .replace(/\/$/g, "")
                .replace(/\\/g, "/")
                .replace(/\/+/g, "/")
                .replace(/(^http:|^https:)/g,
                    function (m, m1) {
                        return m1 + "/"
                    })
		}else{
            this.url = "";
		}
	}
	//[key]:value
	function getKey(key,value,link){
		var ret = [];
		if(typeof value=="object"){
			for(var subkey in value){
				if(key){
					ret = ret.concat(getKey(key+"["+subkey+"]",value[subkey],link))
				}else{
                    ret = ret.concat(getKey(subkey,value[subkey],link))
				}
			}

			if(ret.length==0){
                //{b:[],c:{b:{}}}不需要解析，如需要请在这里添加
			}
			return  ret;
		}else{
			return [key+link+ encodeURIComponent(value)];
		}
	}
	//a[b][c]:1 表示a:{b:{c:1}}
	//a[]:1,a[]:2表示a:[1,2]
	URI.prototype.parse=function(obj,sp,link){
		sp=sp||"&"
		link = link||"=";
		var retStrArr = [];
		if(Object.prototype.toString.call(obj) =="[object Object]"){
            retStrArr = getKey("",obj,link);
		}else{
			throw Error("params error:params must object!");
		}
		return retStrArr.join(sp);
	}

    //添加url参数
	URI.prototype.appendParams =function(data){
		if(typeof data=="object"){
			data = this.parse(data);
		}
        var hash = this.url.split("#");
        var search = hash[0].split("?");
        this.url = search[0]+(search[1]?("?"+search[1]+(data&&("&"+data)||"")):(data&&("?"+data)||""))+(hash[1]&&("#"+hash[1])||"")
       return this;
	}

	RBT.url = function( uri){
		return new URI(uri)
	}


})();