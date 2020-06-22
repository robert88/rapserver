	require("@/rap.config.js");
	const wake = require("@/lib/rap.filesystem.js");
    var {definer:d,del,add} = require("@/core/rap.permission.js");

	const cacheControl = rap.config.CacheControl || 0;
	const fs = require("fs");
	const pt = require("path");
	rap._staticFileMap = {};
	//定义文件访问权限
    const permissionMap = {}
    // permissionMap[rap.config.staticPathMap["rapserver"].toURI()] = {
    //     value:[d.ACCESS_BY_SESSION],
    //     children:{
    //         "/rapserver/js":[],//可以共享css
    //         "/rapserver/js/RBT/socket.js":[d.ACCESS_BY_SESSION],//可以共享css
    //         "/rapserver/img":[],//可以共享css
    //         "/rapserver/css":[],//可以共享css
    //         "/rapserver/html/login.html":[],
    //         "/rapserver/html/demo.html":[],
    //         "/rapserver/html/register.html":[],
    //         "/rapserver/favicon.ico":[]
    //     }
    // }
    /**
     *
     *更新全部
     */
	function refreshAll() {
        let pathMap = rap.config.staticPathMap;
        for(let root in pathMap){
            rap._staticFileMap[root] = {};
            let allFile = wake.findFile(pathMap[root],null,true);
            allFile.forEach(function (file) {
                refreshOne(file,root);
            })
        }
    }
    /*
    * 更新组
    * */
    function refreshGroup(root) {
        rap._staticFileMap[root] = {};
        let allFile = wake.findFile(pathMap[root],null,true);
        allFile.forEach(function (file) {
            refreshOne(file,root);
        })
    }
    /**
     *
     *更新一个
     */
    function refreshOne(file,root){
        let pathMap = rap.config.staticPathMap;
        let stat = {}
        let statInfo =  fs.statSync(file);
        stat["Last-Modified"] = Math.floor(statInfo.mtimeMs/1000);
        stat["ETag"] = stat["Last-Modified"]+"-"+statInfo.size;
        stat["size"] = statInfo.size;
        var extName = pt.extname(file);
        if(extName==".html"){
            stat["Cache-Control"] = "no-cache";
        }else {
            stat["Cache-Control"] = cacheControl;
        }
        if(extName =="jpg"||extName =="png"){
            stat["Content-Length"] = statInfo.size;
        }
        if(extName == ".js"){
            stat["Access-Control-Expose-Headers"] = "X-Client-Ip";
        }
        stat["permission"] = findPermission(file.toURI(),pathMap[root].toURI());
        file = file.replace(pathMap[root],"");
        rap._staticFileMap[root] = rap._staticFileMap[root] || {};
        rap._staticFileMap[root][file] = stat;
	            return stat
    }

    function findPermission(file,rootPath){
        //没有定义子类
        if(file==rootPath ||!permissionMap[rootPath]|| !permissionMap[rootPath].children || rap.isEmptyObject(permissionMap[rootPath].children)){
            return permissionMap[rootPath]&&permissionMap[rootPath].value||[]
        }

        if(file.indexOf("/")==-1){
            return []
        }
        var childrenDir = file.replace(rootPath,"").toURI();
        if(permissionMap[rootPath].children[childrenDir]){
            return permissionMap[rootPath].children[childrenDir]
        }else{
            //推上一次目录
            return findPermission(pt.dirname(file),rootPath);
        }
    }

    refreshAll();

	exports = module.exports = {
	    refreshAll,
        refreshGroup,
        refreshOne
    };
