const exec = require('child_process').exec;
const path = require('path');
const os   = require('os');
const fs   = require('fs');
const cmdWorkDir  = process.cwd();
const {resolve} = require("@/rap.alias.js");
const exeTemplDir = resolve("@/templ");
const iconvFile = resolve("@/exe/iconv.exe");

global.rap = global.rap ||{config:{}};
// HACK: to make our calls to exec() testable,
// support using a mock shell instead of a real shell
var shell = process.env.SHELL || 'sh';

// support for Win32 outside Cygwin/command.exe
if (os.platform() === 'win32' && process.env.SHELL === undefined) { 
  shell = process.env.COMSPEC || 'cmd.exe';
}

/**
 * / 合并当前的env
 */
function createEnv(params) {
    var env = {};
    var item;

    for (item in process.env) {
        env[item] = process.env[item];
    }

    for(item in params) {
        env[item] = params[item];
    }

    return env;
}

/**
 *
 * @param file
 * @param callback
 * 将文件转换为GBK
 */
var uuid = 0;
function converFileUTF8toGBK(file,callback){
    uuid++;
    var converTempPack = exeTemplDir+"/converCmd"+uuid+".bat";
    exec(iconvFile + " -f UTF-8 -t GBK " + file + " > " + converTempPack,
        {
            cwd: cmdWorkDir,
            env: createEnv({})
        },
        function (error) {
            uuid--;
            // TODO any optional processing before invoking the callback
            callback(error, converTempPack);

        }
    )
}


/**
 *
 * @param file
 * @param callback
 * 执行批处理
 */
var caches = {};//保证一个命令执行一次
rap.exec = async function(scriptFile,callback,workingDirectory,environment) {

    workingDirectory = workingDirectory || cmdWorkDir;

    if(typeof callback!="function"){
        callback = function(e, stdout, stderr){if(e){console.log("cmd:",e,stdout, stderr)}}
    }

    if (!workingDirectory) {
        callback(new Error('workingDirectory cannot be null'), null, null);
    }

    if (!fs.existsSync(workingDirectory)) {
        callback(new Error('workingDirectory path not found - "' + workingDirectory + '"'), null, null);
    }

    if (scriptFile === null) {
        callback(new Error('scriptFile cannot be null'), null, null);
    }



    var existScriptFile = false;

    //等待异步执行

    await  new Promise((resolve) => {
        fs.exists(scriptFile,function (flag) {
                existScriptFile = flag;
                resolve(flag)
        });
    })

    //如果执行的是文件
    var cmd;
    if (existScriptFile) {
        // TODO: consider building the command line using a shell with the -c argument to run a command and exit
        //防止中文乱码
        await new Promise((resolve,reject) => {
            converFileUTF8toGBK(scriptFile,function(e,newScriptFile){
                if(e){
                    reject(e);
                }else{
                    cmd =newScriptFile;
                    resolve();
                }
            });
        })
    }else{
        cmd = scriptFile;
    }

    // transform windows backslashes to forward slashes for use in cygwin on windows
    if (path.sep === '\\') {
        cmd = cmd.replace(/\\/g, '/');
    }

    console.log("当前cmd目录：",cmdWorkDir,"下");
    console.log("cmd执行：",cmd);
    //如果存在当前命令
    if(caches[cmd]){
        console.log("cmd执行太频繁",cmd)
        return;
    }else{
        caches[cmd] = true;
    }
     await new Promise((resolve,reject) => {
         exec(cmd,
             {  shell:shell,
                 cwd: workingDirectory,
                 env: createEnv(environment||{})
             },
             function (error, stdout, stderr) {
                delete caches[cmd];
                 // TODO any optional processing before invoking the callback
                 if(error){
                     reject(error)
                 }else{
                     callback();
                     resolve( stdout, stderr)
                 }
             }
         )
    });

}
