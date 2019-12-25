const {resolve} = require("@/rap.alias.js");
const wake = require("@/lib/rap.filesystem.js");
const {parseTag,parseHtmlMergeTag,parseCssBackground} = require("@/compiler/rap.parse.js");
const {packJs} = require("@/compiler/rap.packJs.js");
const {packCss} = require("@/compiler/rap.packCss.js");

/*
 * 解析html
 *
 * */
function getHtmlResource(indexData,resource){
    resource.merge =  parseHtmlMergeTag("merge",indexData);
    resource.merge.forEach(function (merge) {
        indexData = indexData.replace(merge.template,"");
    })
    resource.script =  parseTag("script",indexData);
    resource.link = parseTag("link",indexData,true);
    resource.img = parseTag("img",indexData,true);
    resource.a = parseTag("a",indexData);
    resource.style = parseTag("style",indexData);
}



/*
 *
 *压缩html
 *
 * */
function compression(indexData){

    indexData = indexData.replace(/\s+/gmi," ");

    var inject = indexData.match(/<!--[\u0000-\uFFFF]*?-->/gm);

    for(var item in inject){

        //ie的预编译
        var isIEPrecompiled = /^<!--\s*\[/.test(inject[item]);

        if( !isIEPrecompiled ){

            indexData = indexData.replace( inject[item], "")

        }

    }
    return indexData;
}
/*
 *
 *处理预编译
 *
 * */
function getPrevTag(tag,indexData){
    var arr =[];

    var inject = indexData.match(/<!--[\u0000-\uFFFF]*?-->/gm);

    for(var item in inject){

        //ie的预编译
        var isIEPrecompiled = /^<!--\s*\[/.test(inject[item]);

        if( isIEPrecompiled ){
            arr =  arr.concat(parseTag(tag,inject[item].replace(/<!--([\u0000-\uFFFF]*?)-->/gm,"$1")))
        }
    }
    return arr;
}

/**
 *
 * @param indexData html 代码
 * @param toOutPath 输出转义路径函数
 * @param watchFile 监听map
 * @param toServerPath src的转义路径
 * @param actionPath  访问的根路径
 * @returns {*}
 */
function packHtml(indexData,toOutPath,watchFile,toServerPath,actionPath){
    actionPath = actionPath || function(path){return path}
    toServerPath = toServerPath || resolve;

    watchFile = watchFile || {};//依赖的文件

    var resource = {style:[],script:[],img:[],link:[],a:[],merge:[]};

    getHtmlResource(indexData,resource);

    //<!--merge src=''--><!--merge end-->
    resource.merge.forEach(function (merge) {
        var mergeCode = [];
        var mergeOutSrc = toOutPath(merge.attrs.src);

        var innerStr = merge.innerHTML;
        var files = [];
        if( /\.js$/.test(merge.attrs.src)){
            indexData =  indexData.replace(merge.template,"<script src='"+actionPath(merge.attrs.src)+"'></script>");
            files = parseTag("script",innerStr);
            files.forEach(function (a) {
                handleJsFile(a.attrs.src,mergeCode);
            });
            wake.writeData(mergeOutSrc,mergeCode.join("\n"));
        }else if( /\.css$/.test(merge.attrs.src)){
            indexData =  indexData.replace(merge.template,"<link ref='stylesheet' src='"+ actionPath(merge.attrs.src)+"' />");
            files = parseTag("link",innerStr,true);
            files.forEach(function (a) {
                handleCssFile(a.attrs.href,a.attrs.rel,a.template,mergeCode);
            });
            wake.writeData(mergeOutSrc,mergeCode.join("\n"));
        }

    });

    //<scripts></scripts>
    var scripts = getPrevTag("script",indexData);
    scripts =  resource.script.concat(scripts);
    scripts.forEach(function (script) {
        if(script.attrs.src){
            indexData = indexData.replace(script.template,script.template.replace(script.attrs.src,actionPath(script.attrs.src)));
            handleJsFile(script.attrs.src);
        }else if(!script.attrs.type||script.attrs.type=="text/javascript"){
            indexData =  indexData.replace(script.template,"<script type='text/javascript'>"+packJs(script.innerHTML,toServerPath,watchFile)+"</script>");
        }
    });

    //<style></style>
    resource.style.forEach(function (style) {
        if(!style.innerHTML){
            return;
        }
        var cssCode = packCss(style.innerHTML,toServerPath,watchFile);
        cssCode =  hanlderBackground(cssCode)
        indexData =  indexData.replace(style.template,"<style>"+cssCode+"</style>");
    });

    //<link rel="stylesheet" href="">
    resource.link.forEach(function (a) {
        indexData = indexData.replace(a.template,a.template.replace(a.attrs.href,actionPath(a.attrs.href)));
        handleCssFile(a.attrs.href,a.attrs.rel,a.template,null);
    });

    //<a href="">
    resource.a.forEach(function (a) {
        indexData =  handleStaticFile(a.attrs.href,indexData,a.template);
    });
    //<img src="">
    resource.img.forEach(function (a) {
        indexData = handleStaticFile(a.attrs.src,indexData,a.template);
    });

    //css background:url() background-image:url
    function hanlderBackground(cssCode){
        var backgroundImg = parseCssBackground(cssCode);
        backgroundImg.forEach(function (bg) {
            cssCode = handleStaticFile(bg.src,cssCode,bg.template);
        });
        return cssCode;
    }
    /**
     * 处理静态文件
     * */
    function handleStaticFile(orgSrc,code,template){

        var src = toServerPath(orgSrc);

        if(!src|| /^(http:|https:|\/\/|\\\\)/.test(src)){
            return code;
        }
        if(! /\.(png|jpg|doc|docx|ppt|excel|xlsx|ttf|svg|gif|txt|json|eot|woff|mp3|mp4|ogg|wav|flv|ico)$/.test(src)){
            if(/\.(html|htm)$/.test(src)){
                code = code.replace(template,template.replace(orgSrc,actionPath(orgSrc)));
            }
            return code;
        }

        var mergeOutSrc = toOutPath(orgSrc);
        if(src){
            if(wake.isExist(src)) {
                watchFile[src] = 1;
                wake.copy(src,mergeOutSrc);
            }else{
                console.error(src,"is not find");
            }
            code = code.replace(template,template.replace(orgSrc,actionPath(orgSrc)));
        }
        return code;
    }
    /**
     * 处理css文件
     * */
    function handleCssFile(orgSrc,rel,template,mergeCode){
        var src = toServerPath(orgSrc);
        if(rel&&rel!='stylesheet'){
            indexData =  handleStaticFile(orgSrc,indexData,template);
            return;
        }
        if(!src|| /^(http:|https:|\/\/|\\\\)/.test(src)){
            return;
        }
        if(wake.isExist(src)) {
            var code = wake.readData(src);
            code = packCss(code,toServerPath,watchFile);
            code = hanlderBackground(code)
            watchFile[src] = 1;
            if(!mergeCode){
                var mergeOutSrc = toOutPath(orgSrc);
                wake.writeData(mergeOutSrc,code);
            }else{
                mergeCode.push(code);
            }
        }else{
            console.error(src,"is not find");
        }
    }
    /**
     * 处理js文件
     * */
    function handleJsFile(orgSrc,mergeCode){
        var src = toServerPath(orgSrc);
        if(!src|| /^(http:|https:|\/\/|\\\\)/.test(src)){
            return;
        }
        if(wake.isExist(src)) {
            var code = wake.readData(src);
            code = packJs(code,toServerPath,watchFile);
            watchFile[src] = 1;
            if(!mergeCode){
                var mergeOutSrc = toOutPath(orgSrc);
                wake.writeData(mergeOutSrc,code);
            }else{
                mergeCode.push(code);
            }
        }else{
            console.error(src,"is not find");
        }
    }


    return indexData;
}


exports = module.exports ={
    packHtml:packHtml,
    compressionHtml:compression
};
