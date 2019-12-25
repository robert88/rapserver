const wake = require("@/lib/rap.filesystem.js");//同步

 require("@/lib/rap.tool.js");//同步

require("@/core/rap.action.js");

const permission = require("@/core/rap.permission");


const matchUserAgent = require("@/core/rap.useAge.js");

const{addCookie}  = require("@/core/rap.cookie.js");

const {refreshOne} = require("@/core/rap.file.stat.js");

const mine = require("@/core/rap.response.types.js");

const zlib = require("zlib");

const fs = require("fs");

const path = require("path");

const qs = require('querystring');

const zlibMap = {
	"gzip": zlib.createGzip,
	"gunzip": zlib.createGunzip,
	"deflate": zlib.createInflate
};
const zipType = zlibMap["gzip"];

const {FILENOTFIND,FILESTATERROR,TIMEOUT,NOPERMISSION,throwError,} = require("@/core/rap.error.js");//同步

/**
 * 写流文件
 * */
function createWriteFileStream(file, response, zip) {

	return new Promise(function (resolve) {

        //response本身是output流，不需要调用
		// let out = fs.createWriteStream(response, {encoding: 'utf-8', bufferSize: 11});

        let inp = fs.createReadStream(file);

		if (zip) {
			inp.pipe(zip).pipe(response);
		} else {
			inp.pipe(response);
		}

		inp.on("end", function () {
			resolve();
		});
	});
}
/**
 *如果存在就返回一个真实的地址
 * */
function checkFileExist(ret,staticPathMap,id){
 	 let  absolutePathTemp = (staticPathMap[id] + "/" + ret).toURI();
    //地址是ip地址
    if(staticPathMap[id].indexOf("\\\\")==0){
        absolutePathTemp = absolutePathTemp.replace(/^\\|^\//,"\\\\");
    }
    if (wake.isExist(absolutePathTemp)) {
        return absolutePathTemp;
    }
}
/**
 *获取真实的文件路径
 * */
function getFileRealPath(url,responseRootId){

    let staticPathMap = rap.config.staticPathMap;
	//在rap.file.stat定义
	//如果不是生成环境每次都更新最新文件


    let statInfo = {};

    //找到对应的包文件
    var absolutePath = "";

    if(responseRootId){
        checkFileExist(url,staticPathMap,responseRootId);
    }else{
        for(var id in staticPathMap){
            absolutePath = checkFileExist(url,staticPathMap,id);
        	if(absolutePath){
                if(process.env["NODE_ENV"]=="dev"){
                    refreshOne(absolutePath,id,url);
                }
                let staticFileMap = rap._staticFileMap;
                if(staticFileMap[id]&&staticFileMap[id][url]){
                    statInfo = staticFileMap[id][url];
				}else{
                    refreshOne(absolutePath,id,url);
				}
                statInfo.realPath = absolutePath;
				statInfo.rootId = id;
                break;
			}
        }
    }

    if (!absolutePath) {
        throwError(url,FILENOTFIND)
    }
    return statInfo;
}


/**
 * 处理response
 * */
function responseData(ret, request, response, type,isFile) {

    type = type || ["text/plain"];

    var contentEncoding;
    let fileStatInfo;

    if (isFile) {
        let responseRootId= request.params.responseRootId || request.cookie["responseRootId"];//参数或者是cookie中记录
		//如果没有找到会抛异常
        fileStatInfo = getFileRealPath(ret,responseRootId);
    }else if(type=="text/text"){
        ret = ret.toString();
        type = ["text/plain"];
    } else if (Buffer.isBuffer(ret)) {
        // type = "text/plain";
    } else if (typeof ret == "object") {
        rap.log("请求结果application/json");
        type = ["application/json"];
        ret = JSON.stringify(ret)
    }

    var acceptEncoding = request.headers["accept-encoding"] || "";

    if (acceptEncoding.match(new RegExp("gzip","i")) ) {
        contentEncoding =  "gzip"
    }else{
        contentEncoding =  null
	}

	var headerOption = {
		"Content-Type": type,
        "X-Powered-By": "robert-rap-server",
        "X-Client-Ip":"",
		"X-root-id":fileStatInfo&&fileStatInfo.rootId||""

		// "Set-Cookie": request.cookie
		//"Access-Control-Allow-Headers": "x-requested-with"
		// accept-ranges: bytes
		// access-control-allow-origin: *

		// content-length: 3265
		// content-type: image/jpeg
		// date: Wed, 10 Oct 2018 14:44:47 GMT
		// age: 1920427
		// cache-control: max-age=2628000
		// etag: 2a4ead0189e1dbd13490adeba966e661
		// expires: Thu, 18 Oct 2018 19:17:42 GMT
		// last-modified: Thu, 01 Jan 1970 00:00:00 GMT
		// ohc-response-time: 1 0 0 0 0 0
		// server: JSP3/2.0.14
		// status: 200
	};

	//只要有cookie就使用text/plain
	if(!request.cookies.RAPID){
		response.cookies = response.cookies||{};
		var userAgent = request.headers["user-agent"]||"";
		if(userAgent){
			response.cookies["RAPID"] = {
				value:encodeURIComponent(matchUserAgent(userAgent)+"/"+request.ip+"/"+new Date().getTime()),
				HttpOnly:true
			}
        }
    }

	if(response.cookies){
		headerOption["Set-Cookie"] = addCookie(response.cookies);
	}


    var zip;


	if(isFile){
		//如果文件有权限设置，这个针对全部请求，或者如果session里面有控制

		if( permission.filterFile(request,fileStatInfo)===false ){
			return throwError("no permission",NOPERMISSION);
		}


		let filePath = fileStatInfo.realPath;
		rap.log("请求结果为静态文件：", filePath);
		//这些文件已经经过了高度压缩
		if ( /(jpg)|(ppt)|(doc)|(ico)|(gif)|(png)|(mp3)|(mp4)|(wav)/.test(path.extname(filePath)) ) {
			zip = null;
		}else{
			//只有文件才可以使用压缩
			zip = zipType();
			headerOption["Content-Encoding"]=contentEncoding;
		}

		if(fileStatInfo["Last-Modified"]){
            headerOption["Last-Modified"]=fileStatInfo["Last-Modified"];
		}
        if(fileStatInfo["ETag"]){
            headerOption["ETag"]=fileStatInfo["ETag"];
        }
        if(fileStatInfo["Cache-Control"]){
            headerOption["Cache-Control"]=fileStatInfo["Cache-Control"];
        }
		//Content-Encoding互斥的
        if(!headerOption["Content-Encoding"]){
            if(fileStatInfo["size"]){
                headerOption["Content-Length"]=fileStatInfo["size"];
            }
		}

		var requestLastModify = request.headers["if-modified-since"];
		var requestEtag = request.headers["if-none-match"];
        var eTagCheck = requestLastModify&&requestEtag==fileStatInfo["ETag"];
        var lastModifyCheck = requestLastModify&&requestLastModify==fileStatInfo["Last-Modified"];
		// if(request.headers.range && /(mp3)|(mp4)|(wav)/.test(path.extname(filePath)) && fileStatInfo.size ){
		// 	let rangeSize = (1*(request.headers.range.replace(/bytes=/,"")&&request.headers.range.replace("-","")));
		// 	if(rangeSize<fileStatInfo.size){
         //        let splitFile = 204800;
         //        headerOption["Content-Length"]=splitFile;
         //        headerOption["Content-Range"]="bytes {0}-{1}/{2}".tpl(rangeSize,rangeSize+splitFile,fileStatInfo.size);
         //        response.writeHead(206, headerOption);
        //
		// 	}else{
         //        response.writeHead(406, headerOption);
         //        response.end();
		// 	}
        //
		// }
        if(eTagCheck||lastModifyCheck){
            response.writeHead(304, headerOption);
            response.end();
        }else{
            response.writeHead(200, headerOption);
            createWriteFileStream(filePath, response, zip);
        }
        //单位是s
        // request.headers["cache-control"] = "max-age=20"
	}else{
		response.writeHead(200, headerOption);
		response.end(ret);
	}


}

/**
 * url中参数中proxy必须为true
 * *proxyHost为域名
 * proxyProtocol协议默认为http
 * */
var https = require("https");
var http = require('http');
function proxyResponse(url, request, response) {

	var body = '';
	var protocol = http;
	var opt = {
		port: '80',
		host: request.params.proxyHost,
		method: request.method,//这里是发送的方法
		path: url,
		headers: request.headers,
		ip: request.params.proxyIP || ""
	}

	//得到一个真实的参数
	if (request.method == "GET" && request.params && !rap.isEmptyObject(request.params)) {
		var paramsStr = []
		for (var i in request.params) {
			if (i != "proxy" && i != "proxyHost" && i != "proxyIP" && i != "proxyProtocol") {
				paramsStr.push(i + "=" + encodeURIComponent(request.params[i]));
			}
		}
		opt.path = opt.path + "?" + paramsStr.join("&");
	}


	if (request.params.proxyProtocol == "https") {
		protocol = https;
		opt.port = 443
	}
    opt.headers.host = opt.host;
    opt.headers.referer = request.params.proxyProtocol+"://"+opt.host;

	var req = protocol.request(opt, function (res) {
		//如果是图片不需要过滤掉cookie的话就直接使用这个方法
		if (res.headers["set-cookie"]) {
			res.headers["set-cookie"].forEach(function (val, idx) {
				//cookie跨域
				if (request.params.proxyCookiesDomain) {
					val = val.replace("domain=" + request.params.proxyCookiesDomain + ";", "")
				}
				res.headers["set-cookie"][idx] = val;
			});
		}

		response.writeHead(res.statusCode, res.headers);

		//如果是图片就直接使用通道流
		if (res.headers["content-type"] && ~res.headers["content-type"].indexOf("image")) {
			res.pipe(response);
			return
		}
		var buffer = [];
		res.on('data', function (d) {
            buffer.push(d);
		}).on('end', function () {
			response.end(buffer.join(""));
		});

	}).on('error', function (e) {
		response.end(e);
	});
	//如何是post请求就直接将params做为请求体
	if (request.method == "POST") {
		req.write(qs.stringify(request.params));
	}
	req.end();
}

/**
 * 判断后缀名，来决定是否是文件路径
 */
function handleFileAction(url, request, response,type){
	
	var extname = (typeof url=="string") &&  path.extname(url).replace(".", "");

	//指定了处理方式
	//1如果指定的type和系统支持的type相同，表示静态文件，如果
	if(extname ){
		if(type&&mine[extname]==type){
			responseData(url, request, response,type,true);
		}else if(!type && (type=mine[extname])){
			responseData(url, request, response,type,true);
		}else{
			responseData(url, request, response,type);
		}
		
	}else{
		responseData(url, request, response,type);
	}
	
}

/**
 * 处理action路由
 * unique保证不死循环
 * action二次匹配
 * next callback用于异步
 */
function followResponseByAction(url,request, response,actionValue,timer,mapInfo){

	var once= false;

	var setFinish = function (data,type) {
		if(once){
			return true;
		}
		once = true;

		//如果data是个新的action，而且没有重复进入，标记url已经经过了action，否则认为这个data已经结束了
		if(typeof data=="string" && !mapInfo.stack[data.toLowerCase()]){
			mapInfo.stack[url.toLowerCase()] = true;
		}else{
			mapInfo.status = "finished";
		}
		followResponse(data,request, response,timer,mapInfo,type,url);
	};



   var ret =  actionValue(request, response,setFinish);

	if(ret==null){
		return;
	}

	setFinish(ret,null);

}
/*
* status:finished表示需要立即输出，不再进入action
* mapInfo.stack[mapUrl]表示已经进入过的action不需要重复进入action
* oldUrl方式url==oldUrl
* */
function followResponse(url,request, response,timer,mapInfo,type,oldUrl){

	//如果当前是路径或者action时
	if(typeof url=="string"){

		//权限拦截
		var actionPermission = rap.actionPermissionMap[url.toLowerCase()];

        if(typeof actionPermission == "function"){
            actionPermission = actionPermission(request);
        }

        if(actionPermission){
			if(permission.filterAction(request,actionPermission)===false){
                clearTimeout(timer);
                return throwError("no permission",NOPERMISSION);
			}
		}
        var actionMap = rap.actionMap;

        var mapUrl = url.toLowerCase();

        var actionValue = actionMap[mapUrl];
		//如果指定了type=="text/text"表示是文本
        if (typeof actionValue == "function" && mapInfo.status!="finished" && !mapInfo.stack[mapUrl] && type!="text/text" && oldUrl!=url) {

            followResponseByAction(url,request, response,actionValue,timer,mapInfo,type);

        }else{

            clearTimeout(timer);

            mapInfo = null;

            //actionMap匹配字符串或者是空
            url = (actionValue==null||type=="text/text" || oldUrl==url) ? url : actionValue;

            handleFileAction(url, request, response,type);
        }
	}else{

        clearTimeout(timer);

        handleFileAction(url, request, response,type);
	}

}
/**
 * 做一些响应处理函数
 * response路由功能
 */
exports = module.exports = function (request, response) {

    request.params = request.params || {};
    request.cookie = request.cookie || {};

	var url = request.url;


	//请求超时处理
	var timer = setTimeout(function () { throwError("response timeout",TIMEOUT);}, rap.config.timeout||60000);//默认1分钟

	//匹配代理爬虫功能
	if (request.params.proxy) {

		proxyResponse(url,request, response,timer);

		//匹配action为function
	} else {

		followResponse(url,request, response,timer,{status:"init",stack:[]});

	}

}
