

var d = {
    UNACCESS:1001,
    UNACCESS_ACTION:1002,
    UNACCESS_FILE:1003,
    ACCESS_BY_SESSION:1004,
};
//校验权限
function has(permission,value){
   return  permission.indexOf(value)!=-1
}
//校验权限
function restore(permission){

    permission = permission || [];

    var type = rap.type(permission);

    if(type=="string"){
        permission = permission.split(",");
    }else if(type!="array"){
        permission = [permission.toString()];
    }
    permission.forEach(function (val,index) {
        permission[index] = parseFloat(val,10);
    })
    return permission;
}
//添加权限
function add(permission,value){
    if( !has(permission,value)){
        permission.push(value);
    }
}
//删除权限
function del(permission,value){
    var index =  permission.indexOf(value);
    if(index!=-1){
        permission.splice(index,1);
    }
}
//
exports = module.exports ={
	//过滤action
    filterAction(request,actionPermission){
        actionPermission =  restore(actionPermission);
        if(!actionPermission.length){
            return;
        }
        if(has(actionPermission,d.UNACCESS)){
            return false;
        }
        if(has(actionPermission,d.UNACCESS_ACTION)){
            return false;
        }
    	if(has(actionPermission,d.ACCESS_BY_SESSION)){
            if(!request.cookies&&request.cookies.sessionId){//需要有session才可以访问
                return false;
            }
		}
    },
    //过滤action
    filterFile(request,fileStatInfo){

        var filePermission =  restore(fileStatInfo.permission);

        if(!filePermission.length){
            return
        }

        if(has(filePermission,d.UNACCESS)){
            return false;
        }
        if(has(filePermission,d.UNACCESS_FILE)){
            return false;
        }
        if(has(fileStatInfo.permission,d.ACCESS_BY_SESSION)){
            if(!request.cookies&&request.cookies.sessionId){//需要有session才可以访问
                return false;
            }
        }

    },
	definer:d,
    has:has,
    add:add,
    del:del,
    restore:restore
};

