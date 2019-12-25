
/**
* 模板解析器,不能跟服务同样的规则
*[[variable]] [[#each array]] [[$index]] [[$length]] [[$value]] ... [[#endEach]] [[#if]] ... [[#elseIf]] ... [[#endIf]]

*/
RBT.parseTeample = function (templStr,json){

         templStr = templStr.seam()
         //each
        .replace(/\[\[#each\s+([^\]]+)\s*\]\]/g,function(m,m1){
            return "\"+(function(){try{var $length ="+m1+"&&"+m1+".length; var t=\"\";RBT.each("+m1+"&&"+m1+",function($value,$index){ \n t+= \""
        })
        .replace(/\[\[#endEach\s*\]\]/g,"\"});return t;}catch(e){console.warn(e&&e.stack)}}()) +\"")
        //ifelse
        .replace(/\[\[#if\s+([^\]]+)\s*\]\]/g,function(m,m1){
            return "\"; try{if("+m1.replace(/\\/g,"")+"){ t+=\""
        }).replace(/\[\[#elseIf\s+([^\]]+)\s*\]\]/gi,function(m,m1){
            return "\"; }else if("+m1.replace(/\\/g,"")+"){ t+=\""
        }).replace(/\[\[#else\s*\]\]/g,function(m,m1){
            return "\";}else{ t+=\""
        }).replace(/\[\[#endIf\s*\]\]/gi,function(m,m1){
            return "\"}}catch(e){console.warn(e&&e.stack)} t+=\""
        })
        //表达式/变量
        .replace(/\[\[\s*([^\]]+)\s*\]\]/g,function(m,m1){
            return "\"+"+m1.replace(/\\/g,"")+"+\""
        })
        try{
            var result = "with(obj){var t =\""+templStr.replace(/\+$/,"")+"\"} return t;"
            var fn = new Function("obj",result);
        }catch (e){
            return result;
        }
        return fn(json);
}

