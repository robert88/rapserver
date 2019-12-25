const {getMessage} = require("@/core/rap.error.js");
const {md5} = require("@/core/rap.md5.js");
const {dbLogin} = require("@/db/action/db_user.js");
const ONEMOUTH = 30*24*60*60*1000;
exports = module.exports = {
    "login":function (req,res,next){
        if(!req.params.account || !req.params.pwd){
          return  next(getMessage("params not find account or pwd","error"));
        }
        var pwd = md5(req.params.pwd.trim());
        dbLogin(req.params.account ,pwd,function (buffer) {
            try{
                buffer = JSON.parse(buffer);
            }catch (e) {
                var id =  rap.error(e&&e.stack);
                buffer = {code:401,message:`log id:${id},请联系管理员`}
            }
            if(buffer.code==200){
                res.cookies = res.cookies || {};
                res.cookies["sessionId" ] ={
                    value:md5(req.params.account).slice(48)+pwd.slice(48),
                    HttpOnly: true,
                    Expires:ONEMOUTH//1个月
                }
                next(getMessage(buffer,"success"));
            }else{
                next(getMessage(buffer,"error"));
            }
        },function (e) {
            next(getMessage(e,"error"));
        });
    }


}