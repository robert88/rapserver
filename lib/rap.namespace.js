	
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 namespace
	RETURN : 返回对象链中最后一个对象
	DEPENDENCE : 无
*/

exports = module.exports = {
    namespace(str,value, context){

        //去除空格
        str = str.replace(/\s+/g,"");
        var attr = str.split("."),
            len = attr.length,
            parent = context || {}

        //采用栈的数据结构得到对象链
        for(var i=0;  i<len; i++){
        	if( attr[i] ){
        		if(i!=len-1){
        		    //保证父类是个对象，如果不是对象将覆盖转换为对象
                    parent[ attr[i] ] =  typeof parent[ attr[i] ]=="object"?parent[ attr[i] ]:{};
                    parent = parent[ attr[i] ];
				}else{
                    parent[ attr[i] ] = value;
                }
            }
        }
        return parent;
    }

}
