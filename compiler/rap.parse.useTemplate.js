const {parseTag} = require("@/compiler/rap.parse.js");
const wake = require("@/lib/rap.filesystem.js");
const parseTeample = require("@/lib/rap.template.js");
const {handleIncludeFile} = require("@/compiler/rap.parse.include.js");
const {resolve} = require("@/rap.alias.js");
/*处理模板，解析useTemplate
* */
function handleUseTemplate(orgHtml,orgConfigData,toServerPath,relativePath) {
    var toServerPath = toServerPath||resolve;
    orgHtml = parseTeample(orgHtml,orgConfigData);
    orgHtml = handleIncludeFile(orgHtml,orgConfigData,toServerPath,{},relativePath);
    relativePath = relativePath ||{};

    var useTemplateArr = parseTag("useTemplate",orgHtml);
    var retHtml = [];
    //清除掉useTemplate

    useTemplateArr.forEach(function (useTemplateInfo) {
        orgHtml =  orgHtml.replace(useTemplateInfo.template,"")
    })
    useTemplateArr.forEach(function (useTemplateInfo) {
        var templFile = toServerPath(useTemplateInfo.attrs.src);
        var templConfigFile = toServerPath(useTemplateInfo.attrs.config);


        var id = useTemplateInfo.attrs.id;
        var replaceWith = useTemplateInfo.attrs.replaceWith;

        var templConfigData = {};

        if( templConfigFile && wake.isExist(templConfigFile)){
            templConfigData = require(templConfigFile);
            relativePath[templConfigFile] = 1
        }

        if(templFile && wake.isExist(templFile)){
            relativePath[templFile] = 1
            templConfigData = rap.extend({},templConfigData,orgConfigData);
            var templHtml = wake.readData(templFile);
            templHtml = parseTeample(templHtml,templConfigData);
            templHtml = handleIncludeFile(templHtml,templConfigData,toServerPath,{},relativePath);
            var replaceTags = parseTag("replaceWith",templHtml);

            //插入到body里面
            if(!replaceWith||replaceWith=="body"||replaceTags.length==0){
                var templHtmlBody = parseTag("body",templHtml)[0];
                if(templHtmlBody){
                    templHtml = templHtml.replace(templHtmlBody.template,templHtmlBody.startTag+templHtmlBody.innerHTML+orgHtml+templHtmlBody.endTag);
                }else{
                    console.error("parse template not find body error");
                }
                //插入到指定位置
            }else if(replaceWith&&replaceTags.length>0){
                replaceTags.forEach(function (tag) {
                    if(replaceWith==tag.attrs.id){
                        templHtml = templHtml.replace(tag.template,orgHtml);
                    }
                })
            }else{
                console.error("parse template replaceWith error");
            }
            retHtml.push({id:id,html:templHtml});
        }

    });
    if(retHtml.length==0){
        retHtml.push({id:null,html:orgHtml});
    }
    return retHtml;
}

exports = module.exports ={
    handleUseTemplate:handleUseTemplate
}