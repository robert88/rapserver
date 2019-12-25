/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */
const {resolve} = require("./rap.alias");
require("@/rap.config.js");
require("@/lib/rap.color.js");
require('@/lib/rap.prototype.js');
require("@/lib/rap.process.cmd.js");
require('@/lib/rap.tool.js');
require('@/lib/rap.module.js');
require("@/lib/rap.timeout.js");
require("@/core/rap.log.js");
require("@/core/rap.restful.js");

// const wake = require("@/lib/rap.filesystem.js");
const {UNKNOWN,errorParse} = require("@/core/rap.error.js");
const http = require("http");
const https = require("https");
const domain = require('domain');
const path = require("path");
var requestFilter = require("@/core/rap.request.js");
var handleResponse = require("@/core/rap.response.js");

if(process.env["NODE_ENV"]=="dev"){
    require("@/static/build.config.js");
}
/**
 * 清除response;防止内存泄漏
 * 报错的时候要清除掉
 * */
var responseCache = [];

function clearNullorEndResponse(filter) {
    var newResponseCache = [];
	responseCache.forEach(function(response){
		if (response && response.finished == false) {
			//filter can return false aways responseCache will empty
            if (typeof filter == "function" && filter(response) === false) {
                return;
            }
            newResponseCache.push(response);
        }
	})

    responseCache = newResponseCache;
	newResponseCache = null;
}

/**
 * 处理错误
 * */
function handlerErr(err, response, from) {
    var parseErr;

    if (typeof err != "object") {
        parseErr = err;
    }else{
        parseErr = err.message;
    }

    try{
        parseErr =  errorParse(parseErr);
        parseErr.stack =  err&&err.stack;
    }catch (e) {
        parseErr = {
            msg: parseErr,
            stack: err&&err.stack,
            code:UNKNOWN
        };
        e = null;
    }

    rap.error(from, ":(", parseErr.msg,")",parseErr.stack); // log the error

    parseErr.code = Math.floor(parseInt(parseErr.code))||UNKNOWN;

    if(response){
        response.writeHead(parseErr.code,{"Content-Type":"text/plain;;charset=utf-8"});
        response.end(parseErr.msg);
    }

    err = null;
    parseErr = null;
    rap.config.delRequireCache = false;
}

/**
 * http和https处理
 * */

function handleAction(req, response){

    clearNullorEndResponse();

    responseCache.push(response);

    let d = domain.create();

    d.run(()=>{
        //捕获同步异常
        try {

            requestFilter(req, function (request) {

                handleResponse(request, response);

            });

        } catch (err) {
            handlerErr(err, response, "trycatch");
            err = null;
        }
    });

    //捕获异步异常
    d.on('error', function (err) {
        handlerErr(err, response, "domainErrorEvent");
        d = null;
    });
}


/**
 * 捕获系统异常
 * */

process.on('uncaughtException', function (err) {
    err.status = 505;
    clearNullorEndResponse(function (response) {
        handlerErr(err, response, "uncaughtException");
        response = null;
        return false;
    });
});

/**
 * 启动
 */
// rap.config.serverPort = 2000
http.createServer(handleAction).listen(rap.config.serverPort);
https.createServer(handleAction).listen(443);
const {update:socketUpdate} = require("@/rap.socket.js");

/**
* 更新服务器
* */
function updateServer(){
    if(rap.config.delRequireCache){
        return;
    }
    console.log("update Server");
    rap.config.delRequireCache = true;
    try{
        require("@/lib/rap.color.js");
        require('@/lib/rap.prototype.js');
        require("@/lib/rap.process.cmd.js");
        require('@/lib/rap.tool.js');
        require('@/lib/rap.module.js');
        require("@/lib/rap.timeout.js");
        require("@/core/rap.log.js");
        require("@/core/rap.restful.js");
        requestFilter = require("@/core/rap.request.js");
        handleResponse = require("@/core/rap.response.js");
        socketUpdate(handleResponse);
    }catch (e) {
        handlerErr(e, null, "trycatch By update");
    }
    rap.config.delRequireCache = false;
}

/**
 * 是否需要更新
 */
function checkNeedUpdate(changeFiles){
    changeFiles.forEach(function (file) {
        if(path.extname(file)==".js"){
            updateServer();
            return false;
        }
    })
}

/**
*开发环境和当前第一次启动
*/
if(process.env.NODE_ENV=="dev" && rap.masterStatus!="restart"){

    require("@/rap.browser.js");

    var addWatch = require("@/lib/rap.watch.js");

    addWatch(resolve("@/lib"),function (changeFiles) {
        checkNeedUpdate(changeFiles);
    });

    addWatch(resolve("@/core"),function (changeFiles) {
        checkNeedUpdate(changeFiles);
    });

    addWatch(rap.config.actionPath,function (changeFiles) {
        checkNeedUpdate(changeFiles);
    });

    addWatch(rap.config.actionPermissionPath,function (changeFiles) {
        checkNeedUpdate(changeFiles);
    });


}
