	
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 namespace
	RETURN : 返回对象链中最后一个对象
	DEPENDENCE : 无
*/

	;(function(){

		window.RBT = window.RBT || {};
		RBT.namespace = function(str, context){

			//去除空格
			str = str.replace(/\s+/g,"");
			var attr = str.split("."),
				len = attr.length,
				parent = context || RBT,
				illegal,
				isObj;

			//采用栈的数据结构得到对象链
			for(var i=0; (( attr.length>0 )&&( i<len )); i++){

				//命名必须遵守js命名规范\w包括英文和数字和下划线 js中$允许命名
				illegal = /[^\w\$]/g.test( attr[0] );

				//分割出来的必须不为空 这样可以排除最后多余的点
				//默认添加RBT当中
				//非法命名就会过滤，也会直接跳过并发出警告
				if( ( !attr[0] ) || ( attr[0] === "RBT" ) || illegal ){

					if( illegal ){
						alert( "error:'" + attr[0] + "' Illegal named!");
					}
					attr.shift();
					continue;
				}

				//如果对象不存在就直接赋值为对象
				//如果存在且不是对象，就会弹出警告，并赋值给新对象
				//如果存在且是对象，就会在console中发出警告
				if( parent[ attr[0] ] ){
					
					isObj = typeof parent[ attr[0] ] !== "object";
					
					if( isObj ){
						alert("warning:'" + attr[0] + "' is exsit and not object");
						parent[ attr[0] ] = {};
					}else{
						if( window.console ){
							console.log("warning:'" + attr[0] + "' is exsit");
						}						
					}
				}else{
					parent[ attr[0] ] = {};
				}

				parent = parent[ attr[0] ];
				attr.shift();
			}
			return parent;
		}

	})();