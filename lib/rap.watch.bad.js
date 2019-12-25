const wake = require("@/lib/rap.filesystem.js");
const fs = require("fs");
require("@/lib/rap.color.js");
require("@/lib/rap.timeout.js");
const domain = require('domain');
//全局存储，避免无法清除
 watchCache = global.watchCache||{};
/**
 *
 * 添加监听文件
 */
//新建文件会触发4次watch，其中如果是文件就会带上___jb_tmp___
//当前文件夹的变化会冒泡到上一个文件夹的变化
//监听的参数值watchReturn是变化的文件名或者是文件夹名，不是路径
//必须监听文件夹，监听文件会会监听不了删除和创建，和重命名

var timer;
var addWatchLock;//防止死循环
var changeMsg = [];
var count = 0;
function addWatch(orgDir,callback){
    if(addWatchLock){return}
    addWatchLock = true;
    orgDir = orgDir.replace(/(\/|\\)$/,"");
     if(wake.isExist(orgDir) && wake.isDir(orgDir)){
        var watchDir =  wake.findDir(orgDir,true);//必须保证这个数值不能有重复的；
         clearAllWatch();
         watchDir.forEach(function (dir) {
             dir = dir.replace(/(\/|\\)+/g,"$1").replace(/(\/|\\)$/,"");
             var subDir = dir.replace(orgDir,"");
             //"/a/b" --> ["",a,b]
             //偶数倍的子文件夹需要添加监听，
             if( subDir.split(/\/|\\/g).length%2==1){

                 bindWatch(dir,callback,orgDir);
                 //没监听的文件夹，创建和删除会触发文件夹的修改，但是修改文件内容不会触发文件夹的变化
             }else{
                 wake.findFile(dir).forEach(function (file) {
                     bindWatch(file,callback);
                 })
             }
         });
     }
    addWatchLock =false;
}
function bindWatch(dir,callback,orgDir){
    let d = domain.create();
    d.run(()=>{
        if( watchCache[dir] ){
            watchCache[dir].close();
            watchCache[dir] = null;
        }
        watchCache[dir] =  fs.watch(dir,function(type,file){
            console.log("watch:".red,dir," event:",type,file,count++);
            if(changeMsg.indexOf(dir+"/"+file)==-1){
                changeMsg.push(dir+"/"+file);
            }
            handleChange(type,file,orgDir,callback);

        });
    })
    //捕获异步异常,删除监听文件会抛出异常
    d.on('error', function (err) {
       console.log(err);
    });
}
function handleChange(type,file,orgDir,callback){
    if(addWatchLock){return}
    //每隔1s执行一下回调
    clearTimeout(timer)
    timer = setTimeout(function () {
        console.log("triggle".green,count,changeMsg.join(","));
        if(typeof callback=="function"){
            callback(changeMsg);
        }

        //如果监听的是路径就需要重新遍历
        if(orgDir){
            console.log("reAddWatch".green,count,changeMsg.join(","));
            addWatch(orgDir,callback)
        }
        changeMsg.length = 0;
    },1000);

}
function clearAllWatch(){
    for(var dir in watchCache){
        if( watchCache[dir] ){
            watchCache[dir].close();
            watchCache[dir] = null;
        }
    }
}

exports = module.exports = addWatch;