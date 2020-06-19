const wake = require("@/lib/rap.filesystem.js");
const {clearRequireCache} = require("@/lib/rap.clearRequireCache.js");

/**
 *
 * @param file
 * action中存在对应的的字符串匹配
 * unique保证不会循环引用
 */
function handleActionToAction(key,value,actionMap,unique){

    if(typeof value=="string"&&actionMap[value.toLowerCase()]&& !unique[key]){
        unique[key] = true;
        return handleActionToAction(value.toLowerCase(),actionMap[value.toLowerCase()],actionMap,unique);
    }else{
        return value;
    }
}
/**
 *
 * @param file
 * 将action下的js注入到action map当中
 */
function fileToAction(file,consoleStack,actionMap,actionPath){

        //清除缓存
        clearRequireCache(file,module,true);

        //提取对象
        var subMap = require(file);

        //提取action前缀
        var action = file.replace(actionPath, "").replace(/\.js$/i, "");

        //得到完整的action是当前文件,全部小写，当模块是一个function表示当前模块名称为action
        if (typeof subMap == "function") {
            actionMap[action.toLowerCase()] = subMap;
            consoleStack.push(action.toLowerCase());
        }else if(typeof subMap=="object"){
            //得到完整的action
            for (var key in subMap) {

                var actionKey = key.toLowerCase();

                //不以“/”开头就得合并文件名作为action的一部分；“/”开头的action不会拼接文件路径
                if(!key.indexOf("/")==0){
                    actionKey = (action + "/" + key).toLowerCase();
                }

                actionMap[actionKey] = subMap[key];

                consoleStack.push(actionKey)
            }
        }

}

/**
 * /获取指定action目录
 */
exports = module.exports = {
    init (actionPath) {

        console.log("开始扫描action",actionPath)
        if(!actionPath){
            return;
        }
        var files = wake.findFile(actionPath, "js", true);

        var actionMap = {};

        var consleStack = [];

        files.forEach(function (file) {
            fileToAction(file, consleStack, actionMap,actionPath);
        });

        //处理action之间的映射
        var unique = {};
        for (let key in actionMap) {
            actionMap[key] =  handleActionToAction(key, actionMap[key], actionMap, unique);
        }

        rap.info("action map：", consleStack);

        consleStack = null;
        console.log("结束扫描action")
        return actionMap
    }
};


rap.actionMap = exports.init(rap.config.actionPath);
rap.actionPermissionMap = exports.init(rap.config.actionPermissionPath);