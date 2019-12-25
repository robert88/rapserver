let wake = require("@/lib/rap.filesystem.js");
let {resolve}= require("@/rap.alias.js");
const { clearRequireCache } = require("@/lib/rap.clearRequireCache.js");
let cache = false;
rap.config.cacheUpdate.push(function(){
    cache = false;
})
exports = module.exports = {
    "/":function (req,res,next) {
        var params = req.params;
        var staticPathMap = rap.config.staticPathMap;
        var ret ="index.html"
        var rootMap = {
            "rapserver":"rapserver/html/index.html",
            "lockpc":"index.html"
        }
        if(params.responseRootId){
            ret= rootMap[params.responseRootId];
        }else{
            for(var pathType in staticPathMap){
                if(rootMap[pathType]){
                    ret = rootMap[pathType];
                    break;
                }
            }
        }
        next(ret);
    },
    "upload":function (req,res,next) {
        req.params;
        next("success");
    },
    "/tracking/TacticCode":function (req,res,next) {
        next([{name:"测试Events平台创建活动提示",value:"deEF0123"},{name:"测试Events平台创建活动提示",value:"cEF0123"}]);
    },
    "findFile":function(req,res,next){
        var params = req.params.data;
        if(!params){
            return [];
        }
        var allHtmlFile = []
        if(!cache){
            process.nextTick(function(){
                var staticPathMap = rap.config.staticPathMap;

                for(var pathType in staticPathMap){
                    var htmlFile = wake.findFile(staticPathMap[pathType],"html",true);
                    htmlFile= htmlFile.map(element => {
                        return element.replace(staticPathMap[pathType],"")
                    });
                    allHtmlFile = allHtmlFile.concat(htmlFile);
                }
                clearRequireCache(resolve("@/cache/allHtml.json"))
                wake.writeData(resolve("@/cache/allHtml.json"),JSON.stringify(allHtmlFile));
            })
            cache = true;
        }
        if(wake.isExist(resolve("@/cache/allHtml.json"))){
            allHtmlFile = require("@/cache/allHtml.json");
        }
        var spiltP = params.split(":");
        if(spiltP.length<=1){
            allHtmlFile= allHtmlFile.filter(item=>item.toLowerCase().indexOf(params.toLowerCase())!=-1)
        }else{
           
            allHtmlFile= allHtmlFile.filter(item=>{
                var ret = true;
                spiltP.forEach(function(i){
                    if(i&& item.toLowerCase().indexOf(i.toLowerCase())==-1){
                        ret =false;
                        return false;
                    }
                });

               return ret;
            })
        }
      
        return allHtmlFile;
    }
}
