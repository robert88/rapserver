//离线下载同步npm包
const wake = require("@/lib/rap.filesystem.js");
const util = require('util');
var path = require("path");
const sourceDir = "C:\\Users\\...\\AppData\\Roaming\\npm\\node_modules"
var root = "E:\\yinming\\code\\wrap\\vueProject\\npm\\node_modules"
var allPackage = []
var de = {};
 wake.findFile(root,"json",true).forEach(function (file) {
    if( path.basename(file)=="package.json"){
     var t = require(file);
        Object.assign(de,t.dependencies);
    }
})
 wake.findDir(root).forEach(function (file) {
       allPackage.push(path.basename(file))
})
for(i in de){
  if(allPackage.indexOf(i)==-1){

   if(wake.isExist(sourceDir+"/"+i)&& !wake.isExist(root+"/"+i)){
       console.log("copy",i)
       wake.copyDir(sourceDir+"/"+i,root+"/"+i)
   }
  }
}
