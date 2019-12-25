const {parseTag} = require("@/compiler/rap.parse.js");
require("@/lib/rap.tool.js");

/**
 * 解析将js添加到body后面
* */
function sortJs(html){
    var jsArr = [];
   var scripts = parseTag("script",html);
    scripts.forEach(function (scriptFile) {
        var notMove = scriptFile.attrs["data-not-move"];
        var src = scriptFile.attrs["src"];
        if(src&&!notMove){
            jsArr.push("<script src='"+src+"'></script>");
            html = html.replace(scriptFile.template,"");
        }
    });

    jsArr = rap.unique(jsArr);

    if(~html.indexOf("</body>")){
        html = html.replace(/<\/body>/i,function () {return (jsArr.join("\n")+"</body>") })
    }else{
        console.log("error:html is not has </body>");
    }
    return html;
}
/**
 * 解析将css添加到head后面
 * */
function sortCss(html){
    var cssArr = [];
    var scripts = parseTag("link",html,true);
    scripts.forEach(function (scriptFile) {
        var notMove = scriptFile.attrs["data-not-move"];
        var src = scriptFile.attrs["href"];
        var rel = scriptFile.attrs["rel"];
        if(src&&!notMove&&rel=="stylesheet"){
            cssArr.push(src.split("?")[0]);
            html = html.replace(scriptFile.template,"");
        }
    });

    cssArr = rap.unique(cssArr);
    var cssSrc = [];
    cssArr.forEach(function (src) {
        cssSrc.push("<link href='"+src+"' rel='stylesheet'/>");
    });

    if(~html.indexOf("</head>")){
        html = html.replace(/<\/head>/i,function () {return (cssSrc.join("\n")+"</head>") })
    }else{
        console.log("error:html is not has </head>");
    }
    return html;
}

exports = module.exports ={
    sortCss:sortCss,
    sortJs:sortJs
}
