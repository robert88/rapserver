require("./rap.alias");
require("@/rap.config.js");
require("@/lib/rap.prototype.js");
require("@/lib/rap.color.js");
rap.config.serverPort = 1025;
const http = require("http");
var name = process.argv[process.argv.length-1];
function handleAction(req,res) {
    if(req.url=="/favicon.ico"){
        res.end("200");
        return;
    }
	try{
      const init =   require(name);
      if(typeof init=="function"){
          init(req,res)
      }else{
		  res.end("200")
	  }
	}catch (e) {
        res.end(e.stack)
    }
}
if(name){
	http.createServer(handleAction).listen(rap.config.serverPort);
	require("@/rap.browser.js");
}




