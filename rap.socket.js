const FIN =1;
const net = require('net');
const crypto = require('crypto');
const stream = require('stream');
const domain = require('domain');
const querystring = require('querystring');
const CONNECTING = 1;
const OPEN = 2;
const CLOSE = 3;
const MAXBufferSize = 2 * 1024 * 1024;//2M
const clientList = [];
const clientListMap = {}
var clientListBlacklist ={};//黑名单
var uuid = 0;
var handleResponse = require("@/core/rap.response.js");

exports = module.exports = {
    update:function (newResponse) {
        handleResponse = newResponse||require("@/core/rap.response.js");
    }
}

var chatServer = net.createServer(null,function (client) {
    try {
        hanldeSocket(client);
    }catch (e) {
        rap.error(e&&e.message);
    }
});

chatServer.listen(8001);

/**
 *
 * 服务器发送消息给客户端
 */
function sendMsg(client,msg,type,fromClient,sendId){
    try{
        fromClient = fromClient || client;
        if(!client){
            return;
        }
        if(client.writable){
            if(client.rapStatus == OPEN){
                var msgJson = toMessage({type:type,from:fromClient.rapid,message:msg,target:client.rapid,sendId:sendId});
                var payload = Buffer.from(msgJson);
               var  meta = generateMetaData(true, 1,false, payload);
               var sendData = Buffer.concat([meta, payload], meta.length + payload.length);
               client.write(sendData);
            }
        }else{
            rap.error("socket close by not writable");
        }
    }catch (e) {
        rap.error("socket can not send message by",e&&e.message,e&&e.stack);
    }
}
/**
 * Creates the meta-data portion of the frame
 * If the frame is masked, the payload is altered accordingly
 * @param {boolean} fin
 * @param {number} opcode
 * @param {boolean} masked
 * @param {Buffer} payload
 * @returns {Buffer}
 * @private
 */
function generateMetaData(fin, opcode, masked, payload) {
    var len, meta, start, mask, i

    len = payload.length

    // Creates the buffer for meta-data
    meta = Buffer.alloc(2 + (len < 126 ? 0 : (len < 65536 ? 2 : 8)) + (masked ? 4 : 0))

    // Sets fin and opcode
    meta[0] = (fin ? 128 : 0) + opcode

    // Sets the mask and length
    meta[1] = masked ? 128 : 0
    start = 2
    if (len < 126) {
        meta[1] += len
    } else if (len < 65536) {
        meta[1] += 126
        meta.writeUInt16BE(len, 2)
        start += 2
    } else {
        // Warning: JS doesn't support integers greater than 2^53
        meta[1] += 127
        meta.writeUInt32BE(Math.floor(len / Math.pow(2, 32)), 2)
        meta.writeUInt32BE(len % Math.pow(2, 32), 6)
        start += 8
    }

    // Set the mask-key
    if (masked) {
        mask = Buffer.alloc(4)
        for (i = 0; i < 4; i++) {
            meta[start + i] = mask[i] = Math.floor(Math.random() * 256)
        }
        for (i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4]
        }
        start += 4
    }

    return meta
}

/**
 *
 * 核心代码
 */
function hanldeSocket(client){
    client.rapStatus = CONNECTING;
    var totalBuffer =  Buffer.alloc(0);
    var dataBuffer = Buffer.alloc(0);
    client.rapid = uuid++;
    client.rapTime = new Date().getTime();
    chatServer.emit("rapBroadcast",client.rapid,"create");
    //握手、通信
    client.on("readable",function () {
        try{
            var buffer = client.read();
            totalBuffer = Buffer.concat([totalBuffer, buffer], totalBuffer.length + buffer.length);
            if( !isEndBuffer(client,totalBuffer) ){
                return
            }
            if(client.rapStatus==CONNECTING && waitConnection(client,totalBuffer)){
                client.rapStatus = OPEN;
                totalBuffer = null;
                totalBuffer = Buffer.alloc(0);
                clientList.push(client);
                clientListMap[client.rapid] = clientList.length-1;
                chatServer.emit("rapConnection",client.rapid);
            }else if(client.rapStatus == OPEN && waitMessage(client,totalBuffer,dataBuffer)) {
                dataBuffer = null;
                totalBuffer = null;
                totalBuffer = Buffer.alloc(0);
            }
        }catch (e) {
            rap.error("socket readable",e&&e.message,e&&e.stack);
        }
    })
    client.on("text",function (text) {
        try{
            var clientMsg =  JSON.parse(text);
            switch(clientMsg.type){
                case "broadcast":
                    chatServer.emit("rapBroadcast",client.rapid,"broadcast",clientMsg.msg);
                    break;
                case "action":

                    var request = {params:clientMsg.data||{},url:clientMsg.url,headers:{},isSocket:true,cookies:querystring.parse(client.cookies,";")};
                    var response = {
                        socket:client,
                        writeHead:function () {

                        },
                        end:function (ret) {
                            //可以异步输出

                                if(typeof ret=="string"){
                                    try {
                                        ret = JSON.parse(ret);
                                    }catch (e) {
                                        //ret是普通的字符串不需要报错
                                    }
                                }
                                sendMsg(client,ret,"action",client,clientMsg.sendId);
                        }
                    }
                    handleResponse(request, response);
                    break;
                    //个人聊天
                case "chat":
                    if(clientListMap[clientMsg.id]){
                        sendMsg(clientListMap[clientMsg.id],clientMsg.data,"chat",client);
                        sendMsg(client,"success","chat",client,clientMsg.sendId);//给自己发一个确认信
                    }
                    break;
                    //添加黑名单
                case "blacklist":
                    if(clientMsg.id){
                        clientListBlacklist[client.rapid] = clientListBlacklist[client.rapid]  || {};
                        clientListBlacklist[client.rapid][clientMsg.id] =1;
                        sendMsg(client,"sucesss","text",client,clientMsg.sendId);
                    }else{
                        sendMsg(client,"not find id","error",client,clientMsg.sendId);
                    }
                    break;
                    //删除黑名单
                case "removeBlacklist":
                    if(clientMsg.id){
                        clientListBlacklist[client.rapid] = clientListBlacklist[client.rapid]  || {};
                        clientListBlacklist[client.rapid][clientMsg.id] =0;
                        sendMsg(client,"sucesss","text");
                    }else{
                        sendMsg(client,"not find id","error");
                    }
                    break;
            }
        }catch (e) {
            sendMsg(client,e&&e.message,"error",client,clientMsg.sendId);
            rap.error("socket message error",e&&e.message,e&&e.stack);
        }

    });
    client.on("close",function (code,text) {
        if(client==null){
            return;
        }
        var index = clientList.indexOf(client);
        if(index!=-1){
            client.rapStatus = CLOSE;
            sendMsg(client,text,"error",client);
            clientList.splice(index,1);
            for(var i=index;i<clientList.length;i++){
                clientListMap[clientList[i].rapid] = i;
            }
        }
        client.removeAllListeners();
        client.end()
        clientListMap[client.rapid] = null;
        client = null;
    });
}

/**
 *
 * 广播
 */
chatServer.emit("rapBroadcast",function (rapid,type,msg) {

   clientList.filter(function (client) {
        return !clientListBlacklist[client.rapid] || !clientListBlacklist[client.rapid][rapid];
    }).forEach(function (client) {
        if(client.writable){
            client.sendText(toMessage({type:type,from:rapid,message:msg,target:client.rapid}));
        }else{
            client.emit("close",2000,"not writeable");
        }
    });
});

/**
 *
 * 统一message
 */
function toMessage(opts) {
    var defaultMsgOpts = {
        total:clientList.length,
        message:"",
        type:"text",
        target:null,
        from:null
    };
   var str =  rap.extend({},defaultMsgOpts,opts);
return  JSON.stringify(str);
}
/**
 *
 * 判断是否结束
 */
function isEndBuffer(client,buffer) {
    var len = buffer.length;
    if(len>MAXBufferSize){
        client.emit("error","out limit buffer size");
    }
    var bufferString = buffer.toString();
    if(bufferString.indexOf("\r\n\r\n")){
        return true;
    }
    return false;
}
/**
 *
 * 解析文本
 */
function waitMessage(client,buffer,dataBuffer){
    var len = buffer.length;
    if(len<2){
        client.emit("error","out limit buffer size");
        return false;
    }

   var {fin,type} = parseFirstBuffer(client,buffer[0]);
   var {hasMask,dataLen,start} = parseSecondBuffer(client,buffer[1],buffer,len);
    var payload = parsePayload(hasMask,dataLen,start,buffer);
    if(payload){
        return  parsePayloadType(client,fin,type,payload,dataBuffer);
    }
}



/**
 *
 * 第一个参数包含是不是fin包，包的类型
 */
function parseFirstBuffer(client,bit){

    var FINFlag = bit >> 4;
    if (FINFlag % 8) {
        client.emit("error","fin flag error");
        return null
    }
    var fin = FINFlag === 8;
    var msgType = bit % 16;

    if (msgType !== 0 && msgType !== 1 && msgType !== 2 &&
        msgType !== 8 && msgType !== 9 && msgType !== 10) {
        client.emit("error","invalid msg");
        return false
    }
    //这个是个流
    if (msgType >= 8 && !fin) {
        client.emit("error","Control frames must not be fragmented");
        return false
    }
    return   {fin:fin,type:msgType}
}
/**
 *
 * 如果bit位在最高两位，那么格式采用方式就不一样
 */
function parseSecondBuffer(client,bit,buffer,totalLen){

    var hasMask = bit >> 7;
    if (!hasMask) {
        client.emit("error","Frames sent by clients must be masked");
        return false
    }
    var dataLen = bit % 128;
    var start = 6;

// Get the actual payload length
    if (dataLen === 126) {
        dataLen = buffer.readUInt16BE(2)
        start += 2
    } else if (dataLen === 127) {
        // Warning: JS can only store up to 2^53 in its number format
        dataLen = buffer.readUInt32BE(2) * Math.pow(2, 32) + buffer.readUInt32BE(6)
        start += 8
    }

    if (totalLen < dataLen + start) {
        client.emit("error","Not enough data in the buffer");
        return
    }

    return  {hasMask:hasMask,dataLen:dataLen,start:start};
}
/**
 *
 * 解析负载
 */
function parsePayload(hasMask,dataLen,start,buffer){
    //解析真实的数据，通过异或加密
    var payload = buffer.slice(start, start + dataLen);
    if (hasMask) {
        // Decode with the given mask
        var mask = buffer.slice(start - 4, start);
        for (var i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
        }
    }
    return payload;
}
/**
 *
 * 解析负载类型
 */
function parsePayloadType(client,fin,type,payload,dataBuffer) {
    if (type === 1) {
        // Save text frame
        payload = payload.toString()
        dataBuffer = dataBuffer ? dataBuffer + payload : payload;

        if (fin) {
            // Emits 'text' event
            client.emit('text', dataBuffer);
            return true;
        }
    } else if(type < 8 ) {

        if (!dataBuffer) {
            // Emits the 'binary' event
            dataBuffer = new stream.Readable();
            client.emit('binarystart', dataBuffer);
        }

        dataBuffer.push(payload);

        if (fin) {
            client.emit('binaryend', dataBuffer);
            dataBuffer.push(null);
            return true;
        }
    }else if (type === 8){
        var code, reason
        if (payload.length >= 2) {
            code = payload.readUInt16BE(0)
            reason = payload.slice(2).toString()
        } else {
            code = 1005
            reason = ''
        }
        client.emit('close', code, reason)
    }
// 9 Ping frame
//10 Pong frame

}


/**
 *
 * 解析头部
 */
 function readHeaders (lines) {
     var headers = {};
    var i, match;
    for (i = 1; i < lines.length; i++) {
        if ((match = lines[i].match(/^([a-z-]+): (.+)$/i))) {
            headers[match[1].toLowerCase()] = match[2];
        }
    }
    return headers;
}
/**
 *
 * @param client
 * @param buffer
 * @decoration 处理连接
 */
function waitConnection(client,buffer){

    var len = buffer.length;
    if(len<6){
        client.emit("error","out limit buffer size");
        return false;
    }
    var bufferString = buffer.toString();
    var clientHeader = readHeaders( bufferString.replace("\r\n\r\n","").split('\r\n') );
    client.cookies = clientHeader["Cookie"]
    var clientKey = clientHeader['sec-websocket-key'];
    if(!clientKey){
        client.emit("error","client websocket key invalid");
        return false;
    }
    var sha1 = crypto.createHash('sha1');
    sha1.end(clientKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    var key = sha1.read().toString('base64');
    var headers = {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
        'Sec-WebSocket-Accept': key
    }
    client.write(buildRequest("HTTP/1.1 101 Switching Protocols",headers));
    return true;
}
/**
 *
 * 写入客户端信息
 */
function buildRequest (httpLine, headers) {
    var headerString = httpLine + '\r\n',
        headerName

    for (headerName in headers) {
        headerString += headerName + ': ' + headers[headerName] + '\r\n'
    }

    return headerString + '\r\n'
}
