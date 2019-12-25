	
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.dom ,RBT.each
*/

	;(function($){
		$(window).on("load",function () {
			var timing = window.performance.timing;
			var entries = window.performance.getEntries();

			var readyStart = timing.fetchStart - timing.navigationStart;
			var redirectTime = timing.redirectEnd  - timing.redirectStart;
			var appcacheTime = timing.domainLookupStart  - timing.fetchStart;
			var unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
			var lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
			var connectTime = timing.connectEnd - timing.domainLookupEnd;
			var requestTime = timing.responseEnd - timing.connectEnd;
			var initDomTreeTime = timing.domInteractive - timing.responseEnd;
			var initContentLoad = timing.domInteractive - timing.navigationStart;
			var domReadyTime = timing.domComplete - timing.domInteractive;
			var whitePaper = timing.domComplete- timing.navigationStart;
			var loadEventEnd = timing.loadEventEnd || new Date().getTime()
			var loadEventTime = loadEventEnd- timing.loadEventStart;//过早获取时,domComplete有时会是0
			var loadTime = loadEventEnd - timing.navigationStart;//过早获取时,loadEventEnd有时会是0
			var transfer = 0;
			var jsTransfer = 0;
            var cssTransfer = 0;
            var imgTransfer = 0;
            var htmlTransfer = 0;
			$.each(entries,function (idx,val) {
				if(val.entryType=="navigation"){
                    htmlTransfer+=val.transferSize;
				}
                if(val.entryType=="resource"&&/\.css$/.test(val.name)){
                    cssTransfer+=val.transferSize;
                }
                if(val.entryType=="resource"&&/\.js$/.test(val.name)){
                    jsTransfer+=val.transferSize;
                }
                if(val.entryType=="resource"&&/\.(png|gif|svg|jpg|webp)$/.test(val.name)){
                    imgTransfer+=val.transferSize;
                }
                if(val.transferSize){
                    transfer += val.transferSize;
                }
            });
			RBT.performance = {
				readyStart:readyStart,//浏览器反应的时间
				redirectTime:redirectTime,
				appcacheTime:appcacheTime,
				unloadEventTime:unloadEventTime,
				lookupDomainTime:lookupDomainTime,
				connectTime:connectTime,
				requestTime:requestTime,
				initDomTreeTime:initDomTreeTime,
				domReadyTime:domReadyTime,
				loadEventTime:loadEventTime,
				initContentLoad:initContentLoad,
				whitePaper:whitePaper,
				loadTime:loadTime,
				requestNum:entries.length,
                transfer:[transfer,htmlTransfer,imgTransfer,cssTransfer,jsTransfer]

			}
			console.log('准备新页面时间耗时: ' + readyStart);
			console.log('redirect 重定向耗时: ' + redirectTime);
			console.log('Appcache 耗时: ' + appcacheTime);
			console.log('unload 前文档耗时: ' + unloadEventTime);
			console.log('DNS 查询耗时: ' + lookupDomainTime);
			console.log('TCP连接耗时: ' + connectTime);
			console.log('request请求耗时: ' + requestTime);
			console.log('请求完毕至DOM加载: ' + initDomTreeTime);
			console.log('解释dom树耗时: ' + domReadyTime);
			console.log('load事件耗时: ' + loadEventTime);
			console.log('contentLoad事件时间: ' + initContentLoad);
			console.log('用户空白时间: ' + whitePaper);
			console.log('从开始至load总耗时: ' + loadTime);
			$("body").trigger("performance");
		})
	})(RBT.dom);