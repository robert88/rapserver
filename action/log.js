const wakePromise = require("@/lib/rap.filesystem.promise.js");
//action
exports=module.exports={
	/**
	 * log warn danger
	* */
	"get":function(req,res,next){
		var logPath = rap.config.logPath;
		wakePromise.findFile(logPath,"log").then(function (file) {
			file.forEach(function (val,idx) {
				file[idx] = val.replace(rap.config.logPath,"")
			})
			next(file);
		});
	}
}
