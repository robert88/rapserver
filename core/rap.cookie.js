const qs =require("querystring");
const ONEYEAR = 1000*60*60*24*365;
/**
 * 支持{name:{value:"",HttpOnly:true ... }}
 *  *支持["name=value;",]
* */
function serializationCookie(cookies) {
    var ret = [];
    for(var name in cookies){
    	var cookie = cookies[name];
    	if(typeof cookie=="object"){
            ret.push(getCookie(name,cookie.value,cookie.HttpOnly,cookie.path,cookie.Expires));
        }else{
            ret.push(getCookie(name,cookie.value));
		}
    }
	if(ret.length){
		return ret.join(";").replace(/\s+/g,"");
	}
   return "";
}

//设置统一的cookie模式
function getCookie (name,value,HttpOnly,path,Expires) {
        if(!name){
            return "";
        }
        value = value==null?"null":value;
        HttpOnly = HttpOnly?"HttpOnly;":"";
        path = path||"/";

        if(Expires instanceof Date){
            Expires = Expires.toGMTString();
        }else if(typeof Expires=="number"){
            if(Expires<ONEYEAR){
                Expires = new Date(new Date().getTime()+Expires).toGMTString();
            }else{
                Expires = new Date(Expires).toGMTString();
            }
        }
        Expires = Expires&&(`Expires=${Expires};`)|| ""
        return `${name}=${value};${Expires} path=${path};${HttpOnly}`;
}

exports = module.exports = {
	addCookie:serializationCookie
};
