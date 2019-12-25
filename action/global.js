var os = require("os");
var wake = require("@/lib/rap.fileSystem.js")
var pt =require("path")
var tempCpuInfo = os.cpus();
const OPEN = 2;
var g_cpuInfo = {
	stack:{timeStack:[],valueStack:[],memoryStack:[]},
	model:tempCpuInfo[0].model,
	count:tempCpuInfo.length,
	freeMem:os.freemem(),
	totalMem:os.totalmem(),
	speed:tempCpuInfo[0].speed,
	idle:1,
	total:1
}

//每隔1s更新一次cpu数据
function loopGetCpuInfo(){
	var perInfo = getCpuInfo();
	setTimeout(function () {
        var {idle,total} = getCpuInfo();
        g_cpuInfo.idle = idle - perInfo.idle;
        g_cpuInfo.total = total - perInfo.total;
        g_cpuInfo.freeMem = os.freemem()
        g_cpuInfo.totalMem = os.totalmem()
        g_cpuInfo.processMemory = process.memoryUsage();
        g_cpuInfo.heapTotal = process.heapTotal;
        g_cpuInfo.heapUsed = process.heapUsed;
        g_cpuInfo.processUsage = process.uptime()- perInfo.processUsage
        loopGetCpuInfo();
    },1000)
}

loopGetCpuInfo();

/**
 *  实时更新
* */
function getCpuInfo(){
	var total = 0;
	var idle = 0;
    os.cpus().forEach(function (info) {
        for(var key in info.times){
            total +=  info.times[key];
            if(key=="idle"){
                idle+= info.times[key];
            }
        }
    });

    return {
        'idle': idle,
        'total': total,
        "processUsage":process.uptime()
    };
}

/**
 * socket 实时更新,只记录当天的cpu情况
 * */
var responseList = [];
function handleLoopResponse(){
	var timeStack = g_cpuInfo.stack.timeStack;
	var valueStack = g_cpuInfo.stack.valueStack;
	var memoryStack =  g_cpuInfo.stack.memoryStack;
	var cpuUseage =Math.floor( (1-g_cpuInfo.idle/g_cpuInfo.total) * 10000)/100;
	var currentTime = Math.floor((new Date().getTime() - new Date().setHours(0, 0, 0, 0))/1000);
	var memoryUseage = Math.floor( (1-g_cpuInfo.freeMem/g_cpuInfo.totalMem) * 10000)/100;
	if(timeStack.length>43200){//43200 为12小时
        timeStack.shift();
        valueStack.shift();
	}

    timeStack.push(currentTime);
    valueStack.push(cpuUseage);
    memoryStack.push(memoryUseage);

	var stackLen = timeStack.length;

	var newArr = []
    responseList.forEach(function (val) {
		if(val&&val.socket&&val.socket.writable&&val.socket.rapStatus==OPEN){
			if(val.limit){
			    var endJson = {};
			   for(var endKey in g_cpuInfo){
			       if(endKey=="stack"){
                       endJson[endKey] = {
                           timeStack:timeStack.slice(stackLen-val.limit,stackLen),
                           valueStack:valueStack.slice(stackLen-val.limit,stackLen),
                           memoryStack:memoryStack.slice(stackLen-val.limit,stackLen)
                       }
                   }else{
                       endJson[endKey] = g_cpuInfo[endKey];
                   }
               }
                val.end(endJson);
			}else{
				val.end(g_cpuInfo);
			}
            newArr.push(val)
		}
    })
    responseList = newArr;
    setTimeout(handleLoopResponse,1000);
}
handleLoopResponse();


exports=module.exports={
	/**
	* 1、动态更新action
	*/
	"rapServerRefreshAction":function(req,res,next){
       let map = require("@/core/rap.action.js").init(rap.config.actionPath);
        if(map){
            rap.actionMap = map;
            next("refresh action ok","text/text");
        }else{
            next("refresh action fail","text/text");
        }
	
	},


    /**
	 * 2、重启服务,必须多线程
     */
	"rapServerRestart":function(req,res,next){
		if(rap.masterStatus){
            process.exit(200);
        }else if(req.params.cmd){
			rap.exec(req.params.cmd);
            next("run cmd","text/text");
		}else{
            next("error:need cmd","text/text");
        }
	},
   /**
     * 2、停止服务器
     */
    "rapServerStop":function(req,res,next){
         process.exit(200);
    },
   /**
     * 2、重启服务,必须多线程
     */
    "getCmd":function(req,res,next){
        next(wake.findFile(pt.resolve(__dirname,"../"),"bat").map(file=>pt.basename(file)));
    },
	"rapserverCpuInfo":function (req,res,next) {
		if(req.isSocket){
			res.limit = req.params.limit;
            responseList.push(res);
		}
		return g_cpuInfo
	}
}
