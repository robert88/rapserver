var fs = require('fs');
var pt = require('path');
// var images = require("images");
/*
 获取目前下的文件名称
 * */
function getFileList(dir, type, deep) {
	var files = [];

	if(typeof type == "boolean") {
		deep = type;
		type = "";
	}
	//是否存在目录
	if(isExist(dir) && isDir(dir)) {

		if(deep) {
			files = wakeFile(dir, []);
		} else {
			getChildrenName(dir).forEach(function(filename){
				var newDir = join(dir, filename);
				if(isFile(newDir)){
					files.push(newDir);
				}
			})
		}

		if(type) {
			files = files.filter(function(file) {
				return new RegExp('\\.' + type + '$').test(file);
			});
		}

		/*del mac pc has .DS_Store file*/
        files = files.filter(function(file) {
            return file.indexOf(".DS_Store")==-1
        });

	}
	//console.log("getFileList:".green,files,"is find".green);
	return files;
}

function wakeFile(dir, ret) {
	if(isExist(dir)) {
		if(isDir(dir)) {

			var wakeFilesName = getChildrenName(dir);
			for(var i = 0; i < wakeFilesName.length; i++) {
				//直接连接的话路径和文件中间不需要“/”，路径和路径需要“/”，path.join可以解决这个问题
				var newDir = join(dir, wakeFilesName[i]);

				if(isDir(newDir)) {
					wakeFile(newDir, ret);
				} else {
					ret.push(newDir);
				}
			}
		} else {
			ret.push(dir);
		}
	}
	return ret;
}

function getDirList(dir, deep) {
	var files = [];

	if(typeof type == "boolean") {
		deep = type;
	}
	if(deep) {
		files = wakeDir(dir, []);
	} else {
		//是否存在目录
		if(isExist(dir) && isDir(dir)) {
			getChildrenName(dir).forEach(function(filename){
				var newDir = join(dir, filename);
				if( isDir(newDir) ){
					files.push(newDir);
				}
			})
		}
	}
	//console.log("getDirList:".green,files,"is find".green);
	return files;
}

function wakeDir(dir, ret) {
	if(isExist(dir) && isDir(dir)) {
		ret.push(dir);
		var wakeFilesName = getChildrenName(dir);
		for(var i = 0; i < wakeFilesName.length; i++) {
			//直接连接的话路径和文件中间不需要“/”，路径和路径需要“/”，path.join可以解决这个问题
			var newDir = join(dir, wakeFilesName[i]);
			if(isDir(newDir)) {
				wakeDir(newDir, ret);
			}
		}
	}
	return ret;
}

function getChildrenName(dir) {
	return fs.readdirSync(dir);
}

function isDir(dir) {
	return fs.statSync(dir).isDirectory();
}

function isExist(path) {
	return fs.existsSync(path);
}

function isFile(file) {
	return fs.statSync(file).isFile();
}
function join(a,b){
	return (a+"/"+b).replace(/\/+/g,"/")
}
/*删除已知文件名的文件*/
function delFile(paths) {
	paths = toArray(paths)
	paths.forEach(function(file, index) {
		if(isExist(file) && isFile(file)) {
			fs.unlinkSync(file); // 删除文件
			//console.log("delFile:".red,file,"is deleded".red);
		}
	})
}
/*删除已知文件夹名的文件夹*/
function delDir(paths) {
	paths = toArray(paths)
	paths.forEach(function(file, index) {
		if(isExist(file) && isDir(file)) {
			delDirDeep(file);
		}
	})
}

function delDirDeep(dir) {
	var paths = getChildrenName(dir);

	paths.forEach(function(file, index) {
		var newDir = join(dir, file);
		if(isFile(newDir)) {
			fs.unlinkSync(newDir); // 删除文件
			//console.log("delDirDeep:".red,newDir,"is deleded".red);
		}else{
			delDirDeep(newDir);
		}
	});
	fs.rmdirSync(dir); // 删除空文件夹
	//console.log("delDirDeep:".red,dir,"is deleded".red);
}

/*删除已知的文件夹和文件*/
function remove(paths) {
	if(!paths){
		//console.log("remove:".red,paths,"paths is not valid path".red)
		return ;
	}
	paths = toArray(paths)
	paths.forEach(function(file, index) {
		if(isExist(file)) {
			if(isDir(file)) {
				delDir(file)
			} else {
				fs.unlinkSync(file); // 删除文件
				//console.log("remove:".red,file,"is deleded".red);
			}
		}

	})
}

//console.info("%c aaa","color:red"["#ff00ff"])
function toArray(paths) {
	return Object.prototype.toString.call(paths) == "[object Array]" ? paths : [paths];
}

function toMap(arr,type){
	   var obj={};
   for(var i=0;i<arr.length;i++){
   		obj[ arr[i].slice(arr[i].lastIndexOf("\\")+1,arr[i].length ).replace("."+type,"") ]=arr[i].replace(/\\/g,"/").replace("."+type,"");
   }
   return obj;
}


// 写文件
 function writeData(path,data,append){  
	//目录必须存在
	mkdir(pt.dirname(path));
	
    // appendFile，如果文件不存在，会自动创建新文件  
    // 如果用writeFile，那么会删除旧文件，直接写新文件  
	if(append){
		 fs.appendFileSync(path, data, { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'a' });  
	}else{
		//flag:"a"表示追加
		fs.writeFileSync(path, data, { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' }); 
	}
   
}

// 读文件
function readData(file){  
    return fs.readFileSync(file, "utf8");  
}

//使用时第二个参数可以忽略  dirname是上一层目录dirpath全部分隔符都会当成目录即
///index.html会生成index.html

var mkdir =function(dirpath,dirname){  
        //判断是否是第一次调用  
        if(typeof dirname === "undefined"){   
            if(fs.existsSync(dirpath)){  
                return;  
            }else{  
            	//dirname会窃取最后一个路径名
                mkdir(dirpath,pt.dirname(dirpath));  
            }  
        }else{  
            //判断第二个参数是否正常，避免调用时传入错误参数  
            if(dirname !== pt.dirname(dirpath)){   
                mkdir(dirpath);  
                return;  
            } 
            //最外层肯定要存在
            if(fs.existsSync(dirname)){  
                fs.mkdirSync(dirpath)  
            }else{  
                mkdir(dirname,pt.dirname(dirname));  
                fs.mkdirSync(dirpath);  
            }  
        }  
}
/*拷贝文件*/
var copyFile=function(infile,outfile){
             

            if(isExist(infile)){
				if(!isExist(outfile)){
					mkdir(pt.dirname(outfile));
				}

				if(!isExist(outfile)||readData(infile)!=readData(outfile)){
					//console.log("copy file:".green,infile,"to".green,outfile)
					fs.createReadStream(infile,{encoding:"binary"}).pipe( fs.createWriteStream(outfile,{encoding:"binary"}) );
				}

            }

}
/*拷贝目录*/
var copyDir=function(srcDir, workdir,callback){

 var files = getFileList(srcDir, true);

	 for(var i=0;files&&i<files.length;i++){
	 	var tempSrc = files[i].replace(srcDir,"")
	 	var tempWork = (workdir+"/"+tempSrc).replace(/\/+/g,"/")
		copyFile(files[i],tempWork)
	 }
}
//遍历文件
function findFile(dir, type, deep){
	return getFileList(dir, type, deep);
}
//遍历目录
function findDir(dir, deep){
	return getDirList(dir, deep);
}
//删除所有文件和文件夹
function removeALL(dir,removeSelf){

	if(dir){
		if(removeSelf===false){
			getChildrenName(dir).forEach(function(filename){
				var newDir = join(dir, filename);
				remove(newDir);
			});
			
		}else{
			remove(dir);
		}
		
	}else{
		remove(this.files);
	}
	return this;
};

/*
 *
 *获取文件更新时间
 *
 * */
function getFileModify(file){
//console.log(file)
	var fileStat = fs.statSync(file);

	var modify = fileStat.mtimeMs;

	return modify;
}
function removeEmptyDir(dirPath){
	var dirs = findDir(dirPath,true)
	for(var i=0;i<dirs.length;i++){
		if(findFile(dirs[i],true).length==0){
			removeALL(dirs[i]);
		}
	}
}
/*对外接口*/
exports = module.exports = function () { return this; };
exports.copy = copyFile;
exports.copyDir = copyDir;
exports.mkdir = mkdir;
exports.isExist = isExist;
exports.isDir = isDir;
exports.isFile = isFile;
exports.readData = readData;
exports.writeData = writeData;
exports.findFile = findFile;
exports.findDir = findDir;
exports.toMap = toMap;
exports.removeList = remove;
exports.remove = removeALL;
exports.removeEmptyDir = removeEmptyDir;
exports.getModify = getFileModify;
