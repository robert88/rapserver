const sha1 = require("@/core/rap.sha1.js");
const appId = "A6095986776527"
const appkey = "DE903121-3DAD-A405-3257-697D57912273";
//获取key
// var appKey = SHA1（应用ID + 'UZ' + 应用KEY +'UZ' + 当前时间毫秒数）+ '.' +当前时间毫秒数
function getKey(){
    var now = Date.now();
    return  sha1(appId+"UZ"+appkey+"UZ"+now)+"."+now;
}

exports = module.exports = {

    fetch:function (opts) {
        var resfulKey = getKey();
        var url = opts.url||"";
        if(url.indexOf("https://d.apicloud.com")==-1){
            url =("https://d.apicloud.com"+"/"+url).toURI()
        }
        rap.restful({
            url: url,
            type: opts.type,
            headers: {
                "X-APICloud-AppId": appId,
                "X-APICloud-AppKey": resfulKey
            },
            data: opts.data,
            success: opts.success,
            error: opts.error
        })
    }
}