const wake = require("@/lib/rap.filesystem.js");
const {parseCssImport} = require("@/compiler/rap.parse.js");
const {resolve} = require("@/rap.alias.js");

/*处理require js*/
function handleImport(code,toServerPath,requireCash,unique) {
    var requireArr = parseCssImport(code);
    requireCash = requireCash||{};
    unique = unique ||"";
    requireArr.forEach(function (requireInfo) {
        var src = toServerPath(requireInfo.src);
        if(src && wake.isExist(src)) {
            if(requireCash[src]&&(unique.indexOf("->"+requireCash[src].index)!=-1)){
                console.error("circle import");
                return;
            }
            var index = recordRequireIndex(src,requireCash);

            //第一次
            if(requireCash[src].count==1){
                var childCode =  wake.readData(src);
                handleImport(childCode,toServerPath,requireCash,unique+"->"+index);
                requireCash[src].raw = childCode;
            }
        }else{
            console.error("error not find import css path",src);
        }
    });
}

function replaceImport(code,toServerPath,requireCash,recordCash){
    var requireArr = parseCssImport(code);
    recordCash = recordCash || {};
    requireArr.forEach(function (requireInfo) {

        var src = toServerPath(requireInfo.src);

        if(src && wake.isExist(src)) {
            //得到新的cash
            recordRequireIndex(src,recordCash);


            //最后一个import
            if(requireCash[src].count==recordCash[src].count){
                //处理子code
                var childCode = replaceImport(requireCash[src].raw,toServerPath,requireCash,recordCash);

                code = code.replace(requireInfo.template,childCode );
            }else{
                code = code.replace(requireInfo.template,"/*import same*/");
            }

        }else{
            code = code.replace(requireInfo.template,"/*import error*/");
        }
    });
    return code;
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
    requireCash[requireUrl].count = requireCash[requireUrl].count||0;

    requireCash[requireUrl].count++;

    return requireCash[requireUrl].index;

}

function packCss(code,toServerPath,requireCash) {
    toServerPath = toServerPath||resolve;
    requireCash = requireCash||{};
    handleImport(code,toServerPath,requireCash);
    var recordCash = {};
    code =  replaceImport(code,toServerPath,requireCash,recordCash);
    recordCash = null;
    requireCash = null;
    return code;
}

exports = module.exports ={
    packCss:packCss
};
