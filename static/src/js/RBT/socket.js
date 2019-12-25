;(function($){
    var host = window.location.host.split(":")[0]
	var defaultUrl = "ws://"+host+":8001";
	var rapSendQueue = [];
    var rapSendQueueMap = {};
    var socketSendUUid = 0;
    var ws

    function initSocket(){
         ws = {};
        if(window.WebSocket){
            ws = new WebSocket(defaultUrl);
        }
        ws.onopen = function(e){
            ws.rapStatus = "open";
            ws.rapsendMsg();
        };

        ws.onclose = function(e){
            var len = rapSendQueue.length;
            while (len--){
                var currQueue = rapSendQueue[len];
                currQueue.error("web socket close");
            }
        };

        ws.onerror = function(){
            console.log("web socket error");
            var len = rapSendQueue.length;
            while (len--){
                var currQueue = rapSendQueue[len];
                currQueue.error("web socket error");
            }
        };

        ws.onmessage = function(e){
            if(e.data){
                try {
                    var data = JSON.parse(e.data);

                    if(data.sendId!=null&&rapSendQueueMap[data.sendId]){
                        if(data.type!=="error"){
                            rapSendQueueMap[data.sendId].success(data.message);
                        }else{
                            rapSendQueueMap[data.sendId].error(data.message);
                        }
                    }else if(data.type!=="error"){
                        $.each(rapSendQueue,function (idx,val) {
                            val.error(data.message);
                        })
                    }else{
                        $.each(rapSendQueue,function (idx,val) {
                            val.success(data.message);
                        })
                    }
                }catch (e) {
                    console.log("socket error return");
                }
            }

        }
        ws.rapsendMsg = function () {
            var len = rapSendQueue.length;
            while (len--){
                var currQueue = rapSendQueue[len];
                if(currQueue.status=="ready"){
                    var message = {type: currQueue.type,data:currQueue.data,id:currQueue.id,sendId:currQueue.sendId,url:currQueue.url };
                    if(currQueue.type=="action"){
                        if(!currQueue.url ){
                            currQueue.error("not find url");
                        }
                    }else if(currQueue.type=="chat"){
                        if(!currQueue.id ){
                            currQueue.error("chat no body");
                        }
                    }
                    currQueue.status = "sending"
                    ws.send(JSON.stringify(message));

                }
            }
        }
    }




    RBT.socketSend = function(opts,uuid) {
        if(!ws){
            initSocket();
        }
        var queue
        if(uuid!=null && (queue =  rapSendQueueMap[uuid]) && queue.url==opts.url ){
            queue.data = opts.data;
            queue.id = opts.id;
            queue.status ="ready"
        }else{
            queue = {
                success : opts.success||function(e){console.log("success",e)},
                error : opts.error||function(msg){console.log(msg)},
                type : opts.type,
                sendId : socketSendUUid++,
                status:"ready",
                id:opts.id,
                data:opts.data,
                url:opts.url,
            }
            rapSendQueue.push(queue);
            rapSendQueueMap[queue.sendId] = queue;
        }
        if(ws.rapStatus=="open"){
            ws.rapsendMsg();
        }

        return queue.sendId;
    }



})(RBT.dom);
