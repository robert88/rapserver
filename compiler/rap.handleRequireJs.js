const wake = require("@/lib/rap.filesystem.js");
const {parseRequire} = require("@/compiler/rap.parse.js");

/*处理require js*/
function handleRequireJs(code,toServerPath,requireCash) {
 var requireArr = parseRequire(code);
    requireCash = requireCash||{};
    requireArr.forEach(function (requireInfo) {
        var src = toServerPath(requireInfo.src);
        var index;
        if(src && wake.isExist(src)) {
            if(!requireCash[src]){
                index = recordRequireIndex(src,requireCash);
                var childCode =  wake.readData(src);
                childCode = wrapFunction(childCode,index);
                childCode = handleRequireJs(childCode,toServerPath,requireCash);
                requireCash[src].raw = childCode;
            }else{
                index = requireCash[src].index;
            }
            code = replaceInnerRequire(code,requireInfo.template,index);
        }else{
            console.error("error not find require js path",src);
        }
    });
    return code;
}
/*封装成一个函数*/
function wrapFunction(code){
    return "function(module,innerRequire,exports){\n{0}\n}".tpl(code);
}
/*替换require*/
function replaceInnerRequire(orgCode, replaceCode, index){
    return orgCode.replace(replaceCode, "innerRequire({0})".tpl(index));
}
/*
 *将require记录到一个对象上,可以防止循环require
 *
 */
function recordRequireIndex(requireUrl,requireCash) {

    //过滤重复require
    if (!requireCash[requireUrl] || requireCash[requireUrl].index==null ) {


        requireCash.count = requireCash.count||0;

        //记录模块索引
        requireCash[requireUrl] = {index: requireCash.count};

        requireCash.count++;

    }

    return requireCash[requireUrl].index;

}



exports = module.exports ={
    handleRequireJs:handleRequireJs
}