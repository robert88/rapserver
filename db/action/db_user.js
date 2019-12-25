const {fetch} = require("@/db/lib/apiclould.js")
exports = module.exports = {
    //登录
    dbLogin: function ( account, pwd, success, error) {
        fetch({
            type: "POST",
            url: "/mcm/api/user/login",
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //登出
    dbLoginOut: function () {
        fetch({
            type: "POST",
            url: "/mcm/api/user/logout",
            // success: success,
            // error: error,
            // data: {"username": account, "password": pwd}
        });
    },
    //新增用户
    dbAdd: function () {
        fetch({
            type: "POST",
            url: "/mcm/api/user/",
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //重新设置密码
    dbResetPwd: function () {
        fetch({
            type: "POST",
            url: "/mcm/api/user/",
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //发送验证邮件
    verifyEmail: function () {
        fetch({
            type: "POST",
            url: "/mcm/api/user/verifyEmail",
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //密码重置
    resetRequest: function () {
        fetch({
            type: "POST",
            url: "/mcm/api/user/resetRequest",
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //获取用户信息
    resetRequest: function (userId) {
        fetch({
            type: "POST",
            url: "/mcm/api/user/" + userId,
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //更改用户信息
    resetRequest: function (userId) {
        fetch({
            type: "PUT",
            url: "/mcm/api/user/" + userId,
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    },
    //获取用户信息
    resetRequest: function (userId) {
        fetch({
            type: "DELETE",
            url: "/mcm/api/user/" + userId,
            success: success,
            error: error,
            data: {"username": account, "password": pwd}
        });
    }
}