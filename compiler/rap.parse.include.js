const {parseTag} = require("@/compiler/rap.parse.js");
const {resolve} = require("@/rap.alias.js");
const wake = require("@/lib/rap.filesystem.js");
const parseTeample = require("@/lib/rap.template.js");
 require("@/lib/rap.tool.js");
/*处理include标签*/
function handleIncludeFile(html,data,toServerPath,unique,relativePath) {
    toServerPath = toServerPath ||  resolve;
    var includeTags = parseTag("include",html);
    unique = unique || {};
    relativePath = relativePath || {};
    includeTags.forEach(function (includeInfo) {
        var includeConfigFile = toServerPath(includeInfo.attrs.config);
        var src = toServerPath(includeInfo.attrs.src );
        var includeData = {};

        if( !src || !wake.isExist(src) ){
            html = html.replace(includeInfo.template,"<!--error:not find file-->");
            return;
        }
        if( unique[src]){
            html = html.replace(includeInfo.template,"<!--error:circle include-->");
            return;
        }
        unique[src] = 1;
        relativePath[src] = 1;
        if(includeConfigFile && wake.isExist(includeConfigFile) ){
            includeData = require(includeConfigFile);
            relativePath[includeConfigFile] = 1;
        }

        includeData = rap.extend({},includeData,data);
        var includeHtml = wake.readData(src);

        includeHtml = parseTeample(includeHtml,includeData);
        //递归调用
        includeHtml =  handleIncludeFile(includeHtml,includeData,toServerPath,unique,relativePath);

        html = html.replace(includeInfo.template,includeHtml);
    });
    return html;
}

exports = module.exports ={
    handleIncludeFile:handleIncludeFile
}