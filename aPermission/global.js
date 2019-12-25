var globalAction = require("@/action/global.js");
var {definer:d,del,add} = require("@/core/rap.permission.js");
var promission = {};
// for(var key in globalAction) {
//     promission[key] = [d.ACCESS_BY_SESSION];//全部需要登录才可以访问
// }
// exports  = module.exports = promission
