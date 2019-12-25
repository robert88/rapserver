/*
*
* @title：rap框架
* @author：尹明
*
* */


const rootPath = __dirname.replace(/\\/g,"/");

const config =  {
        cacheUpdate:[],
	timeout:30000,//处理action30s超时
        serverPort:3000, //服务启动端口
        rootPath:rootPath,
        sqlFilePath:rootPath+"/db/sql",//sql脚本
        actionPath:rootPath +"/action",//导入接口文件路径ou
        actionPermissionPath:rootPath+"/aPermission",//permission权限map
        actionCache:rootPath+"/cache/action",
        logPath:rootPath+"/log",
        rootCache:rootPath+"/cache/root/map.js",
        defaultRoot:rootPath+"/static/dest",
        templ:rootPath+"/templ",
        staticPathMap:{},
        CacheControl:0,//
        resartCmd:"start run.www4.bat",
        delRequireCache:false//清除require cache
}




config.staticPathMap["rapserver"] = config.defaultRoot;
// config.staticPathMap["enterprise"] = "E:/yinming/code/wrap/enterpriseV2";

global.rap  = global.rap || {}

rap.config = config;

rap.actionPermissionMap = rap.actionPermissionMap||{} //权限map
rap.actionMap = rap.actionMap || {} //路由map
rap.session = rap.session || {} //session

console.log("启动程序所在路径:",rootPath);
console.log("action文件路径为：", config.actionPath);
console.log("服务器根路径：",config.staticPathMap);
