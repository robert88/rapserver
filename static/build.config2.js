require("@/lib/rap.prototype.js");
const {resolve} = require("@/rap.alias.js");
const {handleUseTemplate} = require("@/compiler/rap.parse.useTemplate.js");
const {sortCss,sortJs} = require("@/compiler/rap.sort.cssAndJs.js");
const {packHtml} = require("@/compiler/rap.packHtml.js");
const wake = require("@/lib/rap.filesystem.js");
const watch = require("@/lib/rap.watch.js");
require("@/lib/rap.tool.js");
require("@/lib/rap.color.js");
const pt =require("path");
//1、将src/html遍历一遍，得到访问的action
//2、对单个html解析
//解析useTemplate标签，如果没有的话就使用/src/template/index.html作为模板
//解析include标签，正对include标签提取js和css，并且开启合并打包，已打包过的不用打包了，根据json来解析html
//合并html根据兼容表生成不同版本的html（iOS，android，chrome，ie，ie10）
var config ={
	entry:"@/static/src/html/",
	data:"@/static/src/html/json/",
	outpath:"@/static/dest/{0}/html/"
};


var toServerPath =function (file) {
	return toPath(resolve("@/static/src/"+file));
};
function toPath(path){
    if(!path|| /^(http:|https:|\/\/|\\\\)/.test(path)){
        return path;
    }
	return path.replace(/(\/|\\)+/g,"/").replace(/(\/|\\)$/,"");
}
/*
* 遍历src/html得到单个html的路径
* */
function parseHtmls(){

	var htmlArr = wake.findFile(resolve(config.entry),"html");
    var relativeFile = {};
	htmlArr.forEach(function (file) {
        file =  toPath(file);
		hanlderHtml(file,relativeFile);
	})
    watch(resolve("@/static/src"),function (changeFiles) {
    	var handleChangeFile = {};
        changeFiles.forEach(function (file) {
        	file = toPath(file);
            if(wake.isExist(file)&&wake.isFile(file)){
                for(var orgHtmlFile in relativeFile){
                    orgHtmlFile = toPath(orgHtmlFile);
                	if(relativeFile[orgHtmlFile][file]){
                        handleChangeFile[orgHtmlFile] = 1;
					}
				}
             }
        })

		for(var file in handleChangeFile){
            console.log("watch file pack:".green,file);
        	file =  toPath(file);
            hanlderHtml(file,relativeFile);
        }
    });
}

/*
 * 处理单个html，输出多个或者一个html
 * */
function hanlderHtml(entryFile,relativeFile){
    relativeFile[entryFile] = {};
    var fileName = pt.basename(entryFile);
    var outFile = config.outpath+"/"+fileName;
    var jsonFile = toPath(config.data+"/"+fileName.replace(/\.html$/,".js"));
    var entryConfigData = {};
    if(wake.isExist(resolve(jsonFile))){
        entryConfigData = require(jsonFile);
        relativeFile[entryFile][resolve(jsonFile)] = 1;
    }
	var entryHtml = wake.readData(entryFile);
    relativeFile[entryFile][entryFile] = 1;
    var outs = handleUseTemplate(entryHtml,entryConfigData,toServerPath,relativeFile[entryFile]);
    outs.forEach(function (out) {
        out.id = out.id || "rapserver";
        outFileByEnv(out ,outFile,entryFile, relativeFile[entryFile] );
    })
}


/*根据不同的兼容性输出（iOS，android，chrome，ie，ie10）*/
function outFileByEnv(out,outFile,entryFile,relative){
	var htmlData = out.html;
	var id = out.id;
    var outFileById = outFile.tpl(id);
    outFileById = toPath(resolve(outFileById))

	var toOutPath = function (file) {
		return toPath(resolve("@/static/dest/{0}/".tpl(id)+file));
	};
    var actionPath = function(file){
        return toPath("/{0}/".tpl(id)+file);
    };
	htmlData = packHtml(htmlData,toOutPath,relative,toServerPath,actionPath);
	htmlData = sortJs(sortCss(htmlData));
	wake.writeData(outFileById,htmlData);
}

parseHtmls();
