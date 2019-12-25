;(function($){
    $.cookie =RBT.cookie
    $.ajax = RBT.ajax;
/**
 * 添加根目录
 */
$("#loginForm").validForm({
    focus: function ($input,$form) {
        $input.parent(".J-validItem").removeClass("validError")
    },
    success: function ($btn, $form) {
        var formParam = {
            account:$form.find("[name='account']").val(),
            pwd:$form.find("[name='password']").val()
        };
        // getaccount(formParam)
        $.ajax({
            url: "/user/login",
            data: formParam,
            type: "post",
            dataType: "json",
            success: function (ret) {
                if(ret.code==200){
                    window.location.href = $.cookie("sessionRedirect")||"/rapserver/html/index.html";
                }else{
                    $.tips(ret.msg,"error")
                }
            },error(msg){
                $.tips(msg,"error")
            }
        })
    }
});

    // function getaccount(formParam) {
    //     var appId = "A6095986776527"
    //     var appkey = "DE903121-3DAD-A405-3257-697D57912273";
    //     function getKey(){
    //         var now = Date.now();
    //         return  $.sha1(appId+"UZ"+appkey+"UZ"+now)+"."+now;
    //     }
    //     var opts = {
    //         url:"https://d.apicloud.com/mcm/api/user/login",
    //         type:"post",
    //         data:{"username":formParam.account,"password":$.md5(formParam.pwd)}
    //     }
    //     var resfulKey = getKey();
    //     $.ajax({
    //         url: opts.url,
    //         type: opts.type,
    //         headers: {
    //             "X-APICloud-AppId": appId,
    //             "X-APICloud-AppKey": resfulKey
    //         },
    //         data: opts.data,
    //         success: opts.success,
    //         error: opts.error
    //     })
    // }




})(RBT.dom,RBT.parseTeample,RBT.socketSend);