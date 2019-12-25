/**
 * 浏览器解析不了
 */
function unSupportType(obj){
	let unSupportMap={
		"md":[]
	}
	//
	for(var key in unSupportMap){
		if(obj[key]){
            obj[key] = unSupportMap[key];
		}
	}
}
function getMineTypeMap(){
	var mine = require("@/core/response.types.json");
		var mineType = {};
	// 'image/x-freehand' : ['fh,fhc,fh4,fh5,fh7']
	//key --> 'image/x-freehand'
	//mine[key] --> ['fh,fhc,fh4,fh5,fh7']
	//types --> ['fh,fhc,fh4,fh5,fh7']
	var consoleType = [];
	for(var key in mine){

		var types = rap.toArray(mine[key]);
		var splitTypes = [];

		for(var i=0;i<types.length;i++){
			var sameTypes = types[i].split(",");
			splitTypes = splitTypes.concat(sameTypes);
		}
		//splitTypes --> ["fh","fhc","fh4","fh5","fh7"]
		for( i=0;i<splitTypes.length;i++){
			mineType[splitTypes[i]] = (mineType[splitTypes[i]]||[]);
			mineType[splitTypes[i]].push(key);
		}
        consoleType = consoleType.concat(splitTypes);
	}

	// rap.log("服务器支持的类型有：",consoleType);
    consoleType = null;
	//最终的结果："mp3:":["application/media"]

    unSupportType(mineType);

	return mineType;
}
exports = module.exports = getMineTypeMap();
