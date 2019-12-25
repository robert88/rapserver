require("@/lib/rap.prototype.js");
/**
* 模板解析器
*{{variable}} {{#each array}} {{$index}} {{$length}} {{$value}} ... {{#endEach}} {{#if}} ... {{#elseIf}} ... {{#endIf}}
 * <!--#if--><!--#elseif--><!--#else--><!--#endIf--><!--#each--><!--#endeach-->辅助反编译
*/
function parseTeample (templStr,json,notHelp){
        var help
        if(notHelp){
            help = ["","","","","","",""];
        }else{
            help = ["<!--#each-->","<!--#eachItem-->","<!--#endeach-->","<!--#if-->","<!--#elseIf-->","<!--#else-->","<!--#endIf-->"]
        }
         templStr = templStr.seam()
         //each
        .replace(/\{\{#each\s+([^}]+)\s*\}\}/g,function(m,m1){
            return "\"+(function(){try{var $length ="+m1+"&&"+m1+".length; var t=\""+help[0]+"\";"+m1+"&&"+m1+".forEach(function($value,$index){ \n t+= \""+help[1]
        })
        .replace(/\{\{#endEach\s*\}\}/g,help[2]+"\"});return t;}catch(e){console.warn(e&&e.stack)}}()) +\"")
        //ifelse
        .replace(/\{\{#if\s+([^}]+)\s*\}\}/g,function(m,m1){
            return "\"; try{if("+m1.replace(/\\/g,"")+"){ t+=\""+help[3]
        }).replace(/\{\{#elseIf\s+([^}]+)\s*\}\}/gi,function(m,m1){
            return "\"; }else if("+m1.replace(/\\/g,"")+"){ t+=\""+help[4]
        }).replace(/\{\{#else\s*\}\}/g,function(m,m1){
            return "\";}else{ t+=\""+help[5]
        }).replace(/\{\{#endIf\s*\}\}/gi,function(m,m1){
            return "\"}}catch(e){console.warn(e&&e.stack)} t+="+help[6]+"\""
        })
        //表达式/变量
        .replace(/\{\{\s*([^}]+)\s*\}\}/g,function(m,m1){
            return "\"+"+m1.replace(/\\/g,"")+"+\""
        })
        try{
            var result = "with(obj){var t =\""+templStr.replace(/\+$/,"")+"\"} return t;"
            var fn = new Function("obj",result);
            result = null;
        }catch (e){
            return result;
        }
        return fn(json);
}


exports = module.exports = parseTeample;
