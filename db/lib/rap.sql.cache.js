
var wake = require("../rap.filesystem.js");

/*
 * 数据库对象
 * */

/**
 * 缓冲数据库表结构
 * 根据创建表的结构来得到表的数据结构
 *
 * cache:{
 *   t-user:{
 * 		qq:{
 * 			type:'varchar',
 * 			limit:32
 	* 	}
 *   }
 * }
 *
 * */
rap.sql = rap.sql||{};
rap.sql.cache =(function () {

	var obj = {};

	var files = wake.findFile(rap.sqlFile.path,"sql");

	rap.info("找到sql文件",files);

	files.forEach(function (file,idx) {

		//读取文件
		var fileText = wake.readData(file);

		//每一行分割
		var fileTextArr = fileText.split(/\n|\r/);

		//去掉注释
		fileTextArr.forEach(function (val,idx) {
			fileTextArr[idx] = val.replace(/--.*/,"");
		});

		//统一性空格
		fileTextArr = fileTextArr.join(" ").replace(/\s+/g, " ");

		//获取表名和属性
		var reg = /\s*create\s*table\s*(\S+)\s*\((.*)\);?/g;
		var regMatch = reg.exec(fileTextArr);

		if(regMatch){
			var tempTable = obj[regMatch[1]] = {};
			var attrs=regMatch[2].split(",");
			attrs.forEach(function (val) {
				var arr = val.trim().split(/\s+/);
				var tempAttr = tempTable[arr[0]] = {};
				tempAttr.type = arr[1].replace(/\(.*\)/,"");
				tempAttr.limit = arr[1].match(/\(.*\)/g)?arr[1].match(/\(.*\)/g)[0].trim().replace(/\(|\)/g,""):arr[2]?arr.slice(2).join(" "):"";
			});
			rap.info("当前文件",file,"解析出来表为",regMatch[1],"成员有",tempTable );
		}else{
			rap.error("can not match file:",file)
		}
	});

	return obj;
})();