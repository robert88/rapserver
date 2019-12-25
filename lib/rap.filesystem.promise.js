var fs = require('fs');
var pt = require('path');

function join(a,b){
	return (a+"/"+b).replace(/\/+/g,"/")
}
/**
 * 获得文件大小
 * */
function getFileSize(file, create) {

	return new Promise(function (resolve, reject) {

		fs.stat(file, function (err, fileInfo) {
			if (err) {
				//如果没有找到文件就直接创建
				if (create) {
					writeData(file, "").then(function () {
						resolve();
					});
				} else {
					throw err;
				}

			} else {
				resolve(fileInfo.size);
			}
		});
	});
}

/**
 * 实例
 * dirpath="/foo/bar/baz/asdf/quux.jpg";
 * dirname="/foo/bar/baz/asdf";
 * */
var mkdir_resursion_in = function (resolve, reject, dirpath, dirname) {

	//判断是否是第一次调用
	if (typeof dirname === "undefined") {
		fs.exists(dirpath, function (existFlag) {
			if (existFlag) {
				//如果存在的话就不需要创建了
				resolve();
			} else {
				mkdir_resursion_in(resolve, reject, dirpath, pt.dirname(dirpath));
			}
		});
	} else {
		//判断第二个参数是否正常，避免第一次调用时传入错误参数
		if (dirname !== pt.dirname(dirpath)) {
			mkdir_resursion_in(resolve, reject, dirpath);
			return;
		}

		fs.exists(dirname, function (existFlag) {
			if (existFlag) {

				//上一层目录存在，就直接创建dirpath
				fs.mkdir(dirpath, function (err) {
					if (err) {
						throw err;
					}
					if (resolve) {
						resolve();
					}
				})

			} else {
				//上一层目录不存在，先创建dirname，
				mkdir_resursion_in(null, null, dirname, pt.dirname(dirname));
				//再创建dirpath
				fs.mkdir(dirpath, function (err) {
					if (err) {
						throw err;
					}
					if (resolve) {
						resolve();
					}
				})

			}
		});
	}
}
/**
 * 创建目录
 * */
var mkdir = function (dirpath) {
	return new Promise(function (resolve, reject) {
		mkdir_resursion_in(resolve, reject, dirpath)
	});
}

/**
 * 写文件
 * */
function writeData(path, data, append,encode) {

	function promiseWriteData(){
		return new Promise(function (resolve) {

			// appendFile，如果文件不存在，会自动创建新文件
			// 如果用writeFile，那么会删除旧文件，直接写新文件
			if (append) {
				fs.appendFile(path, data, {encoding: encode||'utf8', mode: 438 /*=0666*/, flag: 'a'}, function (err) {
					if (err) {
						throw err;
					} else {
						resolve();
					}
				});
			} else {
				//flag:"a"表示追加
				fs.writeFile(path, data, {encoding:  encode||'utf8', mode: 438 /*=0666*/, flag: 'w'}, function (err) {
					if (err) {
						throw err;
					} else {
						resolve();
					}
				});
			}
		})
	}
	//目录必须存在
	return mkdir(pt.dirname(path)).then(promiseWriteData);
}
/**
 * 延时
 * */
function delay(time) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, time)
	})
}

/*对外接口*/
exports = module.exports = function () {
	return this;
};
//遍历文件
async function findFile(dir, type, deep){
    return getFileList(dir, type, deep);
}

async function isExist(path) {
	var isFlag = false;
    //是否存在目录
    await  new Promise((resolve) => {
        fs.exists(path,function (flag) {
            isFlag = flag;
            resolve(flag)
        });
    })
	return isFlag;
}

//删除文件
async function unlink(path) {
    var isFlag = false;
    //是否存在目录
    await  new Promise((resolve) => {
        fs.unlink(path,function (flag) {
            isFlag = flag;
            resolve(flag)
        });
    })
    return isFlag;
}

//删除文件夹
async function rmdir(path) {
    var isFlag = false;
    //是否存在目录
    await  new Promise((resolve) => {
        fs.rmdir(path,function (flag) {
            isFlag = flag;
            resolve(flag)
        });
    })
    return isFlag;
}

async function getChildrenName(path) {
    var isFlag = [];
    //是否存在目录
    await  new Promise((resolve) => {
        fs.readdir(path,function (e,dirArr) {
            if(e){
                resolve();
                return;
            }
            isFlag = dirArr;
            resolve()
        });
    })
    return isFlag;
}

async function isFile(path) {
    var isFlag = false;
    //是否存在目录
    await  new Promise((resolve) => {
        fs.stat(path,function (e,stat) {
            if(e){
                resolve();
                return;
            }
            isFlag = stat.isFile();;
            resolve()
        });
    })
    return isFlag;
}

async function isDir(path) {
    var isFlag = false;
    //是否存在目录
    await  new Promise((resolve) => {
        fs.stat(path,function (e,stat) {
        	if(e){
                resolve();
                return;
			}
            isFlag = stat.isDirectory();;
            resolve()
        });
    })
    return isFlag;
}
/*
 获取目前下的文件名称
 * */
async function getFileList(dir, type, deep) {
    var files = [];

    if(typeof type == "boolean") {
        deep = type;
        type = "";
    }
    //是否存在目录
    if(await isExist(dir) && await isDir(dir)) {

        if(deep) {
            files = await wakeFile(dir, []);
        } else {
            var childFiles = await getChildrenName(dir);
            childFiles.forEach(function(filename){
                var newDir = join(dir, filename);
                if( isFile(newDir) ){
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

async function wakeFile(dir, ret) {
    if(await isExist(dir)) {
        if(await isDir(dir)) {

            var wakeFilesName = await getChildrenName(dir);
            for(var i = 0; i < wakeFilesName.length; i++) {
                //直接连接的话路径和文件中间不需要“/”，路径和路径需要“/”，path.join可以解决这个问题
                var newDir = join(dir, wakeFilesName[i]);

                if(await isDir(newDir)) {
					await wakeFile(newDir, ret);
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

async function deleteFolder(dir) {

    if(await isExist(dir)) {
        if(await isDir(dir)) {

            var wakeFilesName = await getChildrenName(dir);
            for(var i = 0; i < wakeFilesName.length; i++) {
                //直接连接的话路径和文件中间不需要“/”，路径和路径需要“/”，path.join可以解决这个问题
                var newDir = join(dir, wakeFilesName[i]);

                if(await isDir(newDir)) {
                    await deleteFolder(newDir);
                } else {
                    await unlink(newDir);
                }
            }
            await rmdir(dir);
        } else {
            await unlink(dir);
        }
    }

}
// 读文件
async function readData(path) {
	var ret;
	//是否存在目录
	await  new Promise((resolve,inject) => {
		fs.readFile(path, "utf8",function (e,data) {
		    if(e){
                inject(e);
                return;
            }
			ret = data;
			resolve();
		})
	})
	return ret;
}


exports.mkdir = mkdir;
exports.writeData = writeData;
exports.delay = delay;
exports.getFileSize = getFileSize;
exports.findFile = findFile;
exports.isExist = isExist;
exports.deleteFile = deleteFolder;
exports.readData = readData;
