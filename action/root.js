const wakePromise = require("@/lib/rap.filesystem.promise.js");
const wake = require("@/lib//rap.filesystem.js");
const {throwError,MESSAGE} = require("@/core//rap.error.js");
const {refreshAll} = require("@/core/rap.file.stat.js");
var cacheFile = rap.config.rootCache;

/*
* 同步中异步获取文件
* */
async function asyncFindFile(absolutePath,type)
{
	return wakePromise.findFile(absolutePath,type||"html",true)
}
async function asyncFindAllFile(req)
{
	var paramsPath = req.params.path;

	if(! await wakePromise.isExist(cacheFile )){
		var path = {};
		for(var rootId in rap.config.staticPathMap){
			await asyncRecordFile(rootId,rap.config.staticPathMap[rootId],path,paramsPath);
		}
		await wakePromise.writeData(cacheFile ,JSON.stringify(path));
		 path = null;
	}

	return cacheFile;
}
/**
 *
 * @param rootId
 * @param absolutePath
 * @param path
 * @param paramsPath
 * 得到一个html的map
 */
async function asyncRecordFile(rootId,absolutePath,path,paramsPath){

	//如果有path表示获取单独路径的html
	if(paramsPath) {
		absolutePath =( absolutePath + "/" + paramsPath).toURI();
	}

	if (!absolutePath||!wake.isExist(absolutePath)) {
		return;
	}

	var htmlArr =await asyncFindFile(absolutePath,"html");
	htmlArr.forEach(function (val,idx) {
		htmlArr[idx] = val.replace(absolutePath,"");
	});
	path[rootId]=htmlArr;
}

async function asyncFindAllFileByType(req,type)
{


		var absolutePath =  req.params.path;
		var type = req.params.fileType;
		var filterReg = req.params.filterReg;
		var replaceFun = req.params.replaceFun;
   		 // replaceFun must是replace函数
		replaceFun = new Function("file","return file."+replaceFun);
		if (!absolutePath||!wake.isExist(absolutePath)) {
			return false
		}

		var htmlArr =await asyncFindFile(absolutePath,type);

		if(filterReg){
            htmlArr = htmlArr.filter(function (file) {
                var reg = new RegExp(filterReg);
                return reg.test(file)
            });
		}


		for(var i=0;i<htmlArr.length;i++){
			var newFile = replaceFun(htmlArr[i]);
			var data = await wakePromise.readData(htmlArr[i] );
			await wakePromise.writeData(newFile ,data);
		}

		return true;
}
/***
 *更新静态html
 */

 function updateStaticPathMapCache(){
    // refreshAll();
	if(wake.isExist(cacheFile)){
		wake.remove();
	}
	rap.config.cacheUpdate.forEach(handler=>handler());
 }


//action
exports=module.exports={
	/**
	 * 添加path
	* */
	"add":function(req,res,next){
		var params = req.params;
        if(!params.path || !params.rootId){
            throwError("params error",MESSAGE);
            return;
        }else if(params.rootId=="rapserver"){
            throwError("can not change rapserver",MESSAGE);
            return;
        }
        rap.config.staticPathMap[params.rootId]=params.path;
        updateStaticPathMapCache();
        next(rap.config.staticPathMap);
	},
	/**
	删除path
	*/
	"del":function(req,res,next){
		var params = req.params;
		if(!params.rootId){
            throwError("params error",MESSAGE);
            return;
		}else if(params.rootId=="rapserver"){
            throwError("can not del rapserver",MESSAGE);
            return;
		}
        delete rap.config.staticPathMap[params.rootId];
        updateStaticPathMapCache();
        next(rap.config.staticPathMap);
	},
    /**
     获取 path
     */
	"get":function(req,res,next){
		next(Object.assign({},rap.config.staticPathMap));
	},
    /**
     获取 全部html
     */
	"allHtml":function (req,res,next) {
		asyncFindAllFile(req).then(function (map) {
			next(map);
		})
    }
}
