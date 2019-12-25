/*开发要求路径统一*/

;(function(){
    window.requireModule = {};
    window.module = {};
    var head = document.getElementsByTagName("head")[0];
    window.require = function(url,id){
        $.ajax({
            url:url,
            dataType:"text",
            async: false,
            success:function(jsString){
                var script = document.createElement("script");
                //返回对象必须是module.exports
                jsString = jsString.replace(/module\.exports/g,"csModule[moduleId]")
                script.innerHTML = ";(function(csModule,moduleId,moduleParam){{3}})({0},'{1}','{2}');".tpl("requireModule",url,id,jsString);
                head.appendChild(script);
                if(!requireModule[url]){
                    requireModule[url]=1;
                }
            },
            error:function(){console.error("require error:",arguments,url)}
        });
        return requireModule[url];
    }

})()