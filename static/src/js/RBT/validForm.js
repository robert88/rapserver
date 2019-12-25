    ;(function($, undefined){
        window.console = window.console||{error:function(){}}
        /**
         * 模板
         * */
        function tpl() {
            var arg = arguments;
            var that = this;
            for (var i = 0; i < arg.length; i++) {
                that = that.replace(new RegExp('\\{' + i + '\\}', "g"), arg[i]);
            }
            return that;
        };
        /**
         * 唯一性校验
         * */
        function unique(str){
            var obj={};
            var oldStrArr = str.split("");
            var newArr = [];
            for(var i=0;i<oldStrArr.length;i++){
                if(!obj[oldStrArr[i]]){
                    obj[oldStrArr[i]]=1;
                    newArr.push(oldStrArr[i]);
                }
            }
            return  newArr.join(",")
        }
        /**
         * 转换为浮点数
         * */
        function parseNum( value ){
            return parseFloat( $.trim( value+"" ), 10 ) || 0;
        }
        /**
         * 将字节数转字符个数
         * */
       function getByteLen( val ) {
            var temp = 0;
            for (var i = 0; i < val.length; i++ ) {
                //UTF-8 中文占2字节(统一做成单个字符)
                if ( val[ i ].match( /[^x00-xff]/ig ) != null ) {
                    temp += 1;
                }else{
                    temp += 1;
                }
            }
            return temp;
        }
        /**
         * 验证数据类型对应表
         * */
        var validRules =
            {
                email:
                        {
                            check:function(value) {
                                var value = $.trim(value);
                                    var invalidLetter;
                                    if(value.length>254){
                                        return "length-error"
                                    }else if(value.indexOf("@")==-1){
                                        return "at-error"
                                    }else if(!/^(\w|[!#$%&’*+-/=?^`{}|~.])+@[^@]+$/.test(value)){
                                        invalidLetter = value.replace(/@[^@]+$/,"").replace(/\w|[!#$%&’*+-/=?^`{}|~.]/g,"");
                                        return ["account-letter-forbidden",unique(invalidLetter)]
                                    }else if(/[.]{2}/.test(value)){
                                        return "double-dot-error"
                                    }else if(!/^.{1,63}@[^@]+$/.test(value)){
                                        return "account-length-error"
                                    }else if(! ( /(^[^.].*@[^@]+$)/.test(value) &&  /^.*[^.]@[^@]+$/.test(value) )){
                                        return "prevDot-error"
                                    }else if(! /^[^@]+@([0-9]|[A-Z]|[a-z]|[\-.])+$/.test(value)){
                                        invalidLetter = value.replace(/^[^@]+@/,"").replace(/[A-Za-z0–9\-.]/g,"");
                                        return ["nextLetter-forbidden",unique(invalidLetter)]
                                    }else if(! ( /^[^@]+@[^-].*$/.test(value)&&/^[^@]+@.*[^-]$/.test(value) )){
                                        return "nextLine-error"
                                    }else if( !/^[^@]+@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)){
                                        return "domain-error"
                                    }
                                    return false;
                                }
                        },
                required:{ check:function(value) {return ($.trim(value) == '');} },
                mobile:{ check:function(value) {return (!/^\d{5,}$/.test($.trim(value)));}},
                phone:{ check:function(value) {return (!/^\d{1,}-\d{5,}$/.test($.trim(value)));}},
                letter:{check:function(value) { value = $.trim(value);return (!getByteLen(value)==value.length)} },
                chinese:{check:function(value) {return (!/^[\u4e00-\u9fff]+$/.test($.trim(value)));} },
                date:{check:function(value){return(/Invalid|NaN/.test(new Date($.trim(value)).toString()));}},
                //请输入有效身份证
                idcard:{ check:function(value){return(!(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(value)||/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/.test(value)));}},
                maxvalue:{check:function(value, $obj) {
                                //传递了比较值
                                var value2 = $obj.data("maxvalue");
                                if(value2){
                                    this.value = parseNum(value2);
                                }
                                value = parseNum(value);
                                return (!(value<=this.value));
                            }
                        },
                minvalue: {
                            check:function(value, $obj) {
                                //传递了比较值
                                var value2 = $obj.data("minvalue");
                                if(value2){
                                    this.value = parseNum(value2);
                                }
                                value = parseNum(value);
                                return (!(value>=this.value));
                            }
                        },
                multiple:{
                            check:function(value, $obj) {
                                //传递了比较值
                                var value2 = $obj.data("multiple");
                                if(value2){
                                    this.value = parseNum(value2);
                                }
                                value = parseNum(value);
                                return ((value%this.value));
                            }
                        },
				bigger :{
							check:function(value, $obj) {
								//传递了比较值
								var $bigger = $( $obj.data( "bigger" ) );
								var value2 = $bigger.val();
								//比较的值必须有输入
								if( (typeof value2 == "undefined") || (value2 == "") ){
									return ;
								}
								if(value2){
									this.value = parseFloat(value2, 10);
								}
								value = parseFloat(value, 10);

								return (!(value<this.value));
							}
						},
				smaller :{
							check:function(value, $obj) {
								//传递了比较
								var $bigger = $( $obj.data( "smaller" ) );
								var value2 = $bigger.val();
								//比较的值必须有输入
								if( (typeof value2 == "undefined") || (value2 == "") ){
									return ;
								}
								if(value2){
									this.value = parseFloat(value2, 10);
								}
								value = parseFloat(value, 10);
								return (!(value>this.value));
							}
						},
                maxlength:{check:function(value, $obj) {
                    return (!(value.length <= parseNum( $obj.data("maxlength") ) ));
                }},
                minlength:{check:function(value, $obj) {
                    return (!(value.length >= parseNum( $obj.data("minlength") ) ));
                } },
                pswagain:
                        {
                            check:function(value, $obj) {
                                //传递了比较值pswAgain传递是一个jquery选择器字符
                                var sel = $obj.data("pswagain");
                                var value2 = $(sel).val();

                                return ( !( $.trim(value) == $.trim(value2) ) );
                            }
                        },
                password: {
                    check:function(value, $obj) {
                        if(/^\d+$/.test(value.trim())){
                            return true;
                        }else if(!/\d/.test(value.trim())){
                            return true;
                        }else{
                            return false
                        }
                    },
                }

        };
        /**
         *
         * 跟据校验规则校验单条数据
         * */

        function checkBothRule(checkBothType,$target,value,from){
            var errorCode
            var errorMsg;
            var errorParams;
            var checkTypeName;
            var orCheck = checkBothType.length>1?true:false;

            for(var j=0; j<checkBothType.length; j++){
                checkTypeName = checkBothType[j];
                //如果checktype没有或者checktype函数没有就跳出循环继续
                if( !validRules[ checkTypeName ] || !validRules[ checkTypeName ].check ){
                    continue;
                }

                //在submit的时候提交
                if( from=="blur" && value=="" && !$target.parents("form").data("blur-check-empty") ){
                    continue;
                }

                //将对象和值传递过去 true表示错误
                 errorCode = validRules[ checkTypeName ].check( value, $target );
                errorMsg ="";
                if( errorCode ){
                    checkTypeName = checkTypeName.toLowerCase();
                    errorMsg =  $target.data( checkTypeName + "-msg" ) || $target.data( checkTypeName + "-default-msg" ) ;
                    //校验带参数
                    if(typeof errorCode=="object"){
                        errorParams = errorCode.slice(1);
                        errorCode = errorCode[0].toLowerCase();
                        errorMsg = tpl.apply($target.data( checkTypeName+"-"+ errorCode + "-msg" ),errorParams);
                    }else if(typeof errorCode=="string"){
                        errorCode = errorCode.toLowerCase();
                        errorMsg = $target.data( checkTypeName+"-"+ errorCode + "-msg" )
                    }

                 //校验成功之后的函数,“或”规则只要成功就跳出
                }else if( orCheck ){
                    errorMsg ="";
                    errorCode ="";
                    checkTypeName ="";
                   break;
                }
            }
            return {code:errorCode,msg:errorMsg,checkType:checkTypeName}
        }
        /**
         *
         * 跟据校验规则校验单条数据
         * */
        function checkByRule( $subFrom,$target,   error, success,from){

			var value,name;
			if( $target.data( "check-is-html" ) ){
				value = $.trim( $target.html().replace( /\n|\t/g, "" ) );
			}else if( $target.length && ( $target.attr( "type" ) == "checkbox" ) ){
				 name = $target.attr( "name" );
                value = $subFrom.find("input[name='"+name+"']:checked").length?"1":"";
			}else if( $target.length && ($target.attr( "type" ) == "radio" ) ){
                 name = $target.attr( "name" );
                value = $subFrom.find("input[name='"+name+"']:checked").length?"1":"";
			}else{
				value = $.trim( $target.val() );
			}

            var checkTypes = $target.attr( "check-type" );
			var checkBothType

            //共同校验分隔符'空格' '，' '&&'
            checkTypes = ( checkTypes && checkTypes.split( /\s+|,|&&/ ) ) ||[];

            for(var i=0; i<checkTypes.length; i++){
                //"或"规则的检测项
                checkBothType = checkTypes[ i ].split( "|" );
                //校验"或"规则
               var checkStatus = checkBothRule(checkBothType,$target,value,from);

               //当前校验有错误
                if(checkStatus.code){
                    if( $.type( error ) == "function"){
                        error( $target, checkStatus.code, checkStatus.msg ,checkStatus.checkType);
                    }
                    return false;
                }


            }//end for i

			//全部成功之后单个校验完成
			if( $.type( success ) == "function" ){
                if( from=="blur" && value=="" && !$target.parents("form").data("blur-check-empty") ){
                //空字符且为blur事件
                }else{
                    success( $target );
                }
			}

            //全部类型都校验成功之后返回true
            return true;
        }

		/**校验执行函数
		* opts = setRule 外部使用用于扩展校验方法
		* opts = setBlur 内部使用用于绑定blur校验
		* */

		function checkForm( $subFrom, opts, success, successList, error, obj ){

				//刷选出校验的数据
				var $subFormInput = $subFrom.find( "input" )
					.add( $subFrom.find( "textarea" ) )
					.add( $subFrom.find( "select" ) )
					.add( $subFrom.find( ".needCheck" ) )
					.not( ".noCheck" )
                    .not(":disabled")

				var retVal = true;

				$subFormInput.each( function(){

					var $this =  $( this );

					//如果没有设置checktype就返回
					if( !$this.attr( "check-type" ) ){
						return ;
					}

					//如果设置focus,blur为true 函数为设定绑定focus,blur事件,
					if( opts == "setBlur" ){
						if( !$this.data("blur") ){
							//不重复绑定
							$this.data("blur",false);
							$this.bind("blur", function(){

								//用于动态取消校验
								if( $this.hasClass( "noCheck" ) ){
									return;
								}

								//这里的校验不会传递successList
								if(typeof obj.blurCallback=="function" ){
								    //当还有校验的时候不应该传递success
                                    if(checkByRule( $subFrom,$this , error,null,"blur")==true){
                                        obj.blurCallback($this,successList);
                                    }
								}else{
                                    checkByRule( $subFrom,$this , error,successList,"blur");
                                }
							});
						}

						if( !$this.data("focus") ){
							$this.data("focus",false);
							$this.bind("focus", function(){
								if(typeof obj.focusCallback=="function"){
									obj.focusCallback($this);
								}
							});
						}
						return ;
					}


					//跟据校验规则校验单条数据
					var retItemVal = checkByRule($subFrom, $this , error, successList);

					//只要发生错误就会一直保持错误值
					if(retVal){
						retVal = retItemVal;
					}

					//当发生错误时，且one-error-throw=true。执行一条错误校验。并且之后表单停止校验直接返回
					if( $subFrom.data( "one-error-throw" ) && retVal == false ){
						return false;
					}

				});//end each

				//不进行校验
				if( opts == "setBlur" ){
					return ;
				}

				//如果全部通过
				if( ( $.type( success ) == "function" ) && retVal ){

					success( $subFrom );
				}

            return retVal;
		}

        /**
         * 校验初始化函数。提供一个校验函数
         * */
        function valiForm( obj ){

            var selector = obj.form || "",
				successList = obj.successList,
                success = obj.success,
                error = obj.error;

            if( error == undefined ){
                error = alert
            }

            //提供选择器缓存和不缓存
            var $subFrom;

            if( $.type( selector ) == "string" ){

                $subFrom = $( selector );

            }else{

                $subFrom = selector;

            }

			//失去焦点就校验对象
			checkForm( $subFrom, "setBlur", success, successList, error, obj);

            //验证执行函数 //工厂模式
            return	function( opts ){

				//设置校验参数
				if( opts == "getRule" ){
					return validRules;
				}

				return checkForm( $subFrom, opts, success, successList, error );
			}

        }//end valiForm2
        /**
         * 提交按钮全部填充完才显示提交状态
         * */
        function initDisableBtn($form) {
            var $input = $form.find( "input" );
            var $select = $form.find( "select" );
            var $textarea = $form.find( "textarea" )
            var $check = $input.add($select).add($textarea).not( ".noCheck" ).not(":disabled").filter( function(){
                var checkType = $( this ).attr( "check-type" )
                if(checkType || (checkType && checkType.indexOf("required")==-1   )){
                    return true;
                }
                return false;
            });
            function checkBtn(){
                var ret = true;
                $check.each(function () {
                    if($(this).val()==""){
                        ret = false;
                        return false;
                    }
                    if($(this).attr("type")=="radio"){
                        var name = $(this).attr("name");
                        if( $("input[name='"+name+"']:checked").val() ){
                            ret = false;
                            return false;
                        }
                    }
                });
                if(ret){
                    $form.find(".J-submitBtn.J-submitFocus").removeClass("disabled");
                }else{
                    $form.find(".J-submitBtn.J-submitFocus").addClass("disabled");
                }
            }
            //输入之后变亮
            $form.off("keyup.checkBtn", "input,textarea").on("keyup.checkBtn","input,textarea",function () {
                checkBtn();
                if($.trim( $(this).val() )){
                    $(this).addClass("ipt-not-empty");
                }else{
                    $(this).removeClass("ipt-not-empty");
                }
            });

            $form.off("change.checkBtn", "select").on("change.checkBtn","select",function () {
                checkBtn();
                if($.trim( $(this).val() )){
                    $(this).addClass("ipt-not-empty");
                }else{
                    $(this).removeClass("ipt-not-empty");
                }
            });
            checkBtn();
        }
        /**
         * 校验功能化函数
         * */
		function valiFormMiddle($form,opts) {
            var validOpts = {
               form:$form,
                success: function () {
                    if (typeof opts.success == "function" && opts.success($currentSubBtn,$form)===false) {
                        return ;
                    }
                    $form.removeClass("validing");
                },
                successList: function ($target) {
                    if (typeof opts.successList == "function" && opts.successList($target,$form)===false) {
                        return ;
                    }
                    $target.parents(".J-validItem").removeClass("validError").addClass("validSuccess");
                },
                blurCallback: function ($target,success) {
                    if (typeof opts.blur == "function" && opts.blur($target,$form)===false) {
                        return false;
                    }else if(typeof success=="function"){
                        //如果没有ajax校验就成功了
                        if(!$target.data("ajax-check")){
                            success($target);
                        }
                    }
                },
                focusCallback: function ($target) {
                    if (typeof opts.focus == "function" && opts.focus($target,$form)===false) {
                        return ;
                    }
                    $target.parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
                },
                error: function ($target,code, msg, type) {
                    if (typeof opts.error == "function" && opts.error($target,code, msg, type,$form)===false) {
                        return ;
                    }
                    var $parents = $target.parents(".J-validItem").addClass("validError");
                    $parents.find(".J-valid-msg").html(msg);
                    $form.removeClass("validing");
                    if (typeof opts.errorAfter == "function" ) {
                        opts.errorAfter($target,code, msg, type,$form);
                    }
                }
            };
            //解决多个提交按钮的不同校验
            var $currentSubBtn;
            $form.off("click", ".J-submitBtn").on("click", ".J-submitBtn", function () {
                //提交按钮在提交之后如果表正在校验就停止校验，没有变亮按钮也是不能校验的
                if ($form.hasClass("validing")||$(this).hasClass("disabled")) {
                    return false;
                }
                $currentSubBtn = $(this);
                $form.submit();
            });

            // 提交按钮全部填充完才显示提交状态指定J-submitFocus
            initDisableBtn($form)

            //对于提交按钮要求指定focus
            $("body").off("keyup.submit").on("keyup.submit",function (e) {
                if(e.key=="Enter"){
                    $(this).find(".J-submitBtn.J-submitFocus").trigger("click");
                }
            });

            var validForm = valiForm($.extend({},opts, validOpts));

            //提交
            $form.off("submit").on("submit", function () {
                try {
					/*防止重复提交*/
                    var $this = $(this);
                    if ($this.hasClass("validing")) {
                        return false;
                    }
                    $this.addClass("validing");
                    validForm();
                } catch (e) {
                    console.error(e&&e.stack);
                }
                return false;
            });
            //外部引用校验函数
            $form.data("valid-form",validForm);
        }

        $.fn.validForm = function (opts) {
			return this.each(function () {
				valiFormMiddle($(this),opts)
            })
        }
        function layzeSetVisible($this){
            var selectHeight = $this.height();
            var selectOffsetTop = $this.offset().top;
            var optionsMaxHeight = parseNum($this.find(".J-select-option").css("max-height"));
            var optionsMinHeight = parseNum($this.find(".J-select-option").css("min-height"));
            var optionsHeight = 0;
            $this.find(".J-select-option").children().each(function () {
                optionsHeight +=$(this).height();
            })
            optionsHeight = Math.min(optionsHeight,optionsMaxHeight)
            optionsHeight = Math.max(optionsHeight,optionsMinHeight)
            var wheight =$(window).height();
            var scrollTop = $(window).scrollTop()
            if(selectOffsetTop+selectHeight+optionsHeight < wheight+scrollTop){
                $this.find(".J-select-option").removeClass("visible-up");
            }else if(selectOffsetTop-optionsHeight>scrollTop){
                $this.find(".J-select-option").addClass("visible-up");
            }else{
                $this.find(".J-select-option").removeClass("visible-up");
            }

        }
        /**
         * 下拉菜单
         * */
        $(document).off("click", ".J-select").on("click", ".J-select", function (e) {
            var $this = $(this)
            if($this.hasClass("J-mutil-select")&& ($(e.target).hasClass(".J-select-option")||$(e.target).parents(".J-select-option").length)){
                return false;
            }
            if($this.hasClass("current") && !$(e.target).hasClass("option")){
                return;
            }
            $(".J-select").not($this).removeClass("current");

            $this.toggleClass("current");

            if( $this.hasClass("J-vertical-visible") ){
                layzeSetVisible($this);
            }

        }).off("click", ".J-select-option .option").on("click", ".J-select-option .option", function () {
            var $option = $(this);
            var value = $option.data("value");
            var $select = $option.parents(".J-select");
            var $selectText = $select.find(".J-select-text");
            var $selectValue = $select.find(".J-select-value");
            var $selectParentValue = $select.find(".J-select-parent-value");
            if (value != "") {
                $selectText.addClass("ipt-not-empty");
            } else {
                $selectText.removeClass("ipt-not-empty");
            }
            function getMutilOptionData($select){
                var names = [];
                var values = [];
                var allSelect = true;
                $select.find(".option input").each(function () {
                    var $input = $(this);
                    var $curOption = $input.parents(".option");
                    if(!$input.hasClass("J-select-all-ipt")){
                        if($input.prop("checked")){
                            names.push( $curOption.data("name"));
                            values.push($curOption.data("value"));
                        }else{
                            allSelect = false;
                        }

                    }
                });
                return {names:names,values:values,allSelect:allSelect}
            }
            //多选下拉
            if($select.hasClass("J-mutil-select")){
                var $curInput = $option.find("input");
                if($curInput.prop("checked")){
                    $curInput.prop("checked",false);
                }else{
                    $curInput.prop("checked",true);
                }
                //全选
                if( $curInput.hasClass("J-select-all-ipt")){
                    if($curInput.prop("checked")){
                        $select.find("input").prop("checked",true);
                        var selectData = getMutilOptionData($select);
                        $selectText.val($option.data("name")).change();
                        $selectValue.val(selectData.values.join(",")).change();
                    }else{
                        $select.find("input").prop("checked",false);
                        $selectText.val("").change();
                        $selectValue.val("").change();
                    }
                }else{
                    var selectData = getMutilOptionData($select);
                    //已经全部选中需要把all-option的input的点亮
                    if(selectData.allSelect){
                        $select.find(".J-select-all-ipt").prop("checked",true);
                        $selectText.val($select.find(".J-select-all-ipt").parents(".option").data("name")).change();
                    }else{
                        $select.find(".J-select-all-ipt").prop("checked",false);
                        $selectText.val(selectData.names.join(",")).change();
                    }
                    $selectValue.val(selectData.values.join(",")).change();
                }
            }else{
                var name = $(this).data("name");
                $selectText.val(name&&name.toString().replace(/^\s+|\s+$/, "")).change();
                $selectValue.val(value).data("option",$(this).data()).change();
                $(".J-select").removeClass("current");
                //附带标题
                var titleName = $(this).parents(".option-group").find(".option-group-title").data("name")
                $selectParentValue.val(titleName&&titleName.toString().replace(/^\s+|\s+$/, "")).change();
            }

            return false;
        }).on("focus.select",".J-select-text",function () {
            $(this).parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
        }).on("click.select", function (e) {
            if (!$(e.target).hasClass("J-select") && $(e.target).parents(".J-select").length == 0) {
                $(".J-select").removeClass("current");
            }
            //支持搜索功能，data-jp,data-qp,data-name
        }).on("keyup.select",".J-select-text",function () {
            var key = $.trim($(this).val())
            if($(this).parents(".J-select-search").length){
                $(this).parents(".J-select-search").find('.J-select-option .option').each(function () {
                   var searchStr = [( $(this).data("qp")||"") ,($(this).data("jp")||"")  , ($(this).data("name")||"" )].join(",")
                    if( searchStr.toLowerCase().indexOf(key.toLowerCase())==-1){
                        $(this).hide()
                    }else{
                        $(this).show()
                    }
                })
            }

        });
    })(RBT.dom, window.undefined);