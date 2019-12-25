

/**
 * url中参数中proxy必须为true
 * *proxyHost为域名
 * proxyProtocol协议默认为http
 * */
const https = require("https");
const http = require("http");
const { URL } = require('url');
const querystring = require('querystring');
const {throwError} = require("@/core/rap.error.js")

rap.restful =function(options) {

	if(typeof options!=="object"){
        throwError("restful options must object");
	}

	if(!options.url){
        throwError("restful options must have url");
	}

	var urlOptions = new URL(options.url);

	 urlOptions.protocol = urlOptions.protocol=="https:"?"https:":"http:";
    // urlOptions.protocol = "http:"
	var opt = {
        protocol:urlOptions.protocol,
        port: urlOptions.port || (urlOptions.protocol=="https:"?443:80),
        hostname: urlOptions.hostname,
		host: urlOptions.host,
        path: urlOptions.href.replace(urlOptions.origin,"").toURI(),
        method: (options.type||"GET").toUpperCase(),//这里是发送的方法
		headers: options.headers||{},
        agent: false
    }
    var accept ={
        "*": "*/*",
        html: "text/html",
        json: "application/json, text/javascript",
        script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
        text: "text/plain",
        xml: "application/xml, text/xml"
    }
    if(options.dataType&&accept[options.dataType]){
        opt.headers['Accept']=accept[options.dataType]
    }else{
        opt.headers['Accept']='*/*';
    }
    opt.headers['Content-Type']="application/x-www-form-urlencoded; charset=UTF-8";
    opt.headers['User-Agent']="Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36/rapserver";
    opt.headers['Origin'] = urlOptions.host;
    opt.headers['Referer'] = urlOptions.host;
    opt.headers['host'] = opt.host

	var protocol = http;
	if ( urlOptions.protocol  == "https:") {
		protocol = https;
	}

	var req = protocol.request(opt, function (res) {

		var buffer = [];
		res.on('data', function (d) {
            buffer.push(d);
		}).on('end', function () {
            if(typeof options.success == "function"){
                options.success(buffer.join(""));
            }
		});
//
	}).on('error', function (e) {
	    rap.error(e&&e.stack)
        if(typeof options.error == "function"){
            options.error(e);
        }
	});

	//如何是post请求就直接将params做为请求体
	if (opt.method == "POST") {
		req.write(querystring.stringify(options.data));
	}

	req.end();
}
