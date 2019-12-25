
    /**
     * 启动默认浏览器,重启系统不启动
     * **/
    const childProcess = require('child_process');
    const path = require("path");


/*
*执行cmd处理
*/
function exec(cmd,success){
    childProcess.exec(cmd, function (err, stdout) {
        if (err) {
            rap.error("cmd start default browser:",err);
            return;
        }
        if(typeof success=="function"){
            success(stdout);
        }
    })
}

//解析默认浏览器的路径
function parseBrowserPath(defaultBrowser){
    //有空格的路径需要加上""
    return defaultBrowser[0].replace(/^"|"$/g, "")
            //匹配路径\path
            .replace(/\\([^\\]*)/g, function (m, m1) {
                if (~m.indexOf(" ")) {
                    return "\\\"" + m1 + "\""
                } else {
                    return m
                }
            });
}

//解析本地ipv4
function parseIP(stdout){
    var ip = "localhost";
    var infos = stdout.replace(/^"|"$/g, "").split(/\n|\r/);

    infos.forEach(function(info){
        if(info.indexOf("IPv4")!=-1){
            info = info.split(":");
            if(info[1]){
                ip= info[1].trim()
                return false;
            }
        }
    });
    return ip
}

//查默认浏览器
exec('reg query "HKEY_CLASSES_ROOT\\http\\shell\\open\\command"',(stdout)=>{

    let  defaultBrowser = stdout.match(/"[^"]+\.exe"/);
     if (!defaultBrowser) {
        return
     }

    //查本地ip地址
    exec('ipconfig', function (stdout) {

        let ip = parseIP(stdout);;

        let browser = parseBrowserPath(defaultBrowser);
        let port = rap.config.serverPort;
        let dirpath = "rapserver/html";
        exec('start {0} http://{1}:{2}/{3}/index.html'.tpl(browser,ip,port,dirpath));
    });
})
