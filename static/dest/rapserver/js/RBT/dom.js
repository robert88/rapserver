
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.each，RBT.extend
*/

;(function(){
	window.RBT = window.RBT || {};
	var each = RBT.each;
	var extend = RBT.extend;

	function Dom(selector,context){
        var dom = find(selector,context);
        Array.prototype.push.apply(this,dom);
        this.selector = selector;
        return this;
	}


	RBT.dom = function( selector,context ){
		return new Dom(selector,context);
	};

	//提前检测代码优化
	var g_listner = "";
	var g_removeListner =""
	var g_type = "";
	if( window.addEventListener ){
		g_listner = "addEventListener";
		g_removeListner = "removeEventListner"
	}else if(window.attachEvent){
		g_listner = "attachEvent";
		g_removeListner = "detachEvent"
		g_type = "on";
	}

	var g_touch =/touchstart|touchend|touchmove/g;
	
	//添加事件监听
	function bind( e, fn, keep ,val,index){
		
		//如果设置了keep，那就允许默认行为 和事件传播
		if(keep){
			e.stopPropagation();
			e.preventDefault();			
		}
		
		//支持平板touch事件
		if(g_touch.test(e.type)){
			e = e.originalEvent.touches[0];
		}
		
        var fnRet = fn.call(val,e,index);
        
        if(fnRet===false){
            e.stopPropagation();
			e.preventDefault();	
        }
	}
	
	//获取css样式
	function getCss( elem, key ){
		
		//将命名变成驼峰式命名
		var varKey = setName(key);
		var computedStyle = getComputedStyle()
		if( elem.style[varKey] ){
			return elem.style[varKey];
			//兼容性更好
        }else if( computedStyle ||  elem.currentStyle){
		    var value = computedStyle( elem, null ).getPropertyValue( key );
		    if(RBT.userAgent.split("/")[4]=="ie"){
                if(key=="width"){
                    value += computedStyle( elem, null ).getPropertyValue( "padding-left" ).toFloat() +computedStyle( elem, null ).getPropertyValue( "padding-right" ).toFloat();
                }else if( key=="height"){
                    value += computedStyle( elem, null ).getPropertyValue( "padding-top" ).toFloat() +computedStyle( elem, null ).getPropertyValue( "padding-top" ).toFloat();
                }
            }
			return value || (elem.currentStyle && elem.currentStyle[varKey]);
		}
	}

	function getComputedStyle(){
	    return document.defaultView  &&  document.defaultView.getComputedStyle;
    }
	//设置css样式
	function setCss( elem, key, value ){
		key = setName( key );
		if(/^top|left|bottom|right|width|height$/){
		    if(typeof value=="number" || value&&/^\d+$/.test(value)){
		        value = value+"px";
            }
        }
		elem.style[key] = value;
	}
	
	//将命名变成驼峰式命名
	function setName( name ){
		return name.replace(/-(\w)/g,function(c,m1){return m1.toUpperCase();});
	}
		
	//将事件代理
	function findDelegateDom(target,parentNode,matchNode){
		if(!matchNode.length){
			return null
		}
		for(var i=0;i<matchNode.length;i++){
			if(target==matchNode[i]){
				return {dom:matchNode[i],index:i};
			}
		}
		if(target.parentNode!=null&&target.parentNode!=parentNode){
			return findDelegateDom(target.parentNode,parentNode,matchNode)
		}
		
		return null
	}
	function findDom(str,context,level){
	    var isTag =str.match( /^\s*<(\w+)\s*[^>]*>([\u0000-\uFFFF]*?)<\/\w+>$/);

	    var domList = [];
        if(isTag){
            var newDom = document.createElement(isTag[1]);
            if(isTag[2]){
                newDom.innerHTML = isTag[1];
            }
            return [newDom];
        }
        if( document.querySelector ){
            var newStr;
            if(/^>.*/.test(str)){
	            newStr =  str.slice(1)
            }else{
                newStr = str;
            }
            if(context&&context.querySelectorAll){
                domList =  context.querySelectorAll( newStr );
            }else{
                domList =  document.querySelectorAll( newStr );
            }
            if(/^>.*/.test(str)){
                 domList = filter(domList,function (val,idx) {
                    return val.parentNode == context;
                });
            }
            return domList;
        }else{
            if( /^#.*/.test( str ) ){
                domList.push(document.getElementById( str.slice(1) )) ;
            }else if( /^\..*/.test( str ) ){
                domList = document.getElementsByClassName( str.slice(1) );
            }else if(/^>.*/.test(str)){
                //只比较一级父类
                domList = findDom(str.slice(1),context,true);
            }else{
                domList = document.getElementsByTagName( str )
            }
        }
        if(context){
            domList = filter(domList,function (val,idx) {
                if(level){
                    return val.parentNode == context;
                }else{
                    return isParent(val,context)
                }
            })
        }
        return domList;
	}
	function isParent(ele,parent) {
		if(ele.parentNode!=null&&ele!=document ){
			if(ele.parentNode==parent){
                return true;
			}else{
                return isParent(ele.parentNode,parent)
			}
		}else{
            return false;
        }
    }
	/*context必须是dom*/
	function find(str,context) {
        var dom = [];
        if(typeof str=="string"){
            var tempDom
            if(context&&context.nodeType==Node.ELEMENT_NODE){
                tempDom = findDom(str,context);
            }else{
                tempDom = findDom(str);
            }
            if(tempDom){
                if(tempDom.length==null){
                    dom.push(tempDom) ;
                }else{
                	for(var i=0;i<tempDom.length;i++){
                        dom.push(tempDom[i]);
					}
                }
            }
            tempDom = null
        }else if(typeof str=="object"){
            if(str.nodeType ||str==window || str==document){
                dom.push(str) ;
            }else if( str.constructor==Dom){
				return str;
			}
        }

        return dom;

    }
    function testAttr(name){
		var dom = document.createElement("div");
        dom.setAttribute(name,"test");
        return (dom.getAttribute(name)=="test");
	}
	var attrMap = {"className":"className","class":"className"}
	if(testAttr("class")){
        attrMap["className"]="class";
        attrMap["class"]="class";
	}
    function getAttr(ele,name){
        name = attrMap[name]||name;
		return ele.getAttribute(name)||"";
	}
    function setAttr(ele,name,value){
        name = attrMap[name]||name;
         ele.setAttribute(name,value);
    }
    function findParentDom(ele,parentSelector,retArr){
		if(ele.parentNode==null||retArr.indexOf(ele.parentNode)!=-1 || ele.parentNode==document){
            return;
		}
		var id="#"+ele.parentNode.id;
		var className = "."+ getAttr(ele.parentNode,"className").replace(/^\s+|\s+$/g,"").replace(/\s+/g,".");
		var attrName = ele.parentNode.getAttributeNames();
		var attrStr = false;
        each(attrName,function(val){
        	if(val=="id"||val=="className"||val=="class"){
        		return
			}
			var value = getAttr(ele.parentNode,val);
            if(("["+val+"="+value+"]")==parentSelector || ("["+val+"='"+value+"']")==parentSelector || ('['+val+'="'+value+'"]')==parentSelector){
                attrStr =true;
        		return false;
			}

		})
		if(parentSelector==id|| className.indexOf(parentSelector)!=-1 || attrStr){
            retArr.push(ele.parentNode)
		}
        findParentDom(ele.parentNode,parentSelector,retArr)
	}
    function fireEvent(element,event){
        if (document.createEventObject){
            // IE浏览器支持fireEvent方法
            var evt = document.createEventObject();
            return element.fireEvent('on'+event,evt)
        }
        else{
            // 其他标准浏览器使用dispatchEvent方法
            var evt = document.createEvent( 'HTMLEvents' );
            evt.initEvent(event, true, true);
            return !element.dispatchEvent(evt);
        }
    }

	function innerHtml(appendTarget,ele,clear){
        var singleTag = /\b(br|hr|input|link|img|meta|param)\b/i;
        if(singleTag.test(ele.nodeName)){
            return;
        }
        //插入的是dom元素
        if(appendTarget&&appendTarget.nodeType){
        	if(clear){
                ele.innerHTML=appendTarget.outerHTML;
			}else{
                ele.appendChild(appendTarget);
			}
		//插入的是Dom构造器构建的元素
        }else if(appendTarget&&appendTarget.constructor==Dom){
        	if(appendTarget.length){
                var tempStr="";
                each(appendTarget,function (val) {
                    if(clear){
                        tempStr += val.outerHTML;
                    }else{
                        ele.appendChild(val);
                    }
                });
				if(clear){
					ele.innerHTML=tempStr;
				}
			}
        }else{
            if(clear){
                ele.innerHTML=appendTarget;
            }else{
                // ele.innerHTML+=tempStr;//不能清除之前的dom事件
                var vDom = document.createElement("div");
                vDom.innerHTML = appendTarget;
                each(vDom.children,function (val) {
                    ele.appendChild(clone(val));
                })
                vDom = null;
            }
        }
	}

    //克隆dom
	function clone(target){
	    if(target&&target.nodeType){
            return target.cloneNode();
        }else{
	        return target
        }
    }
    //过滤
    function filter(orgArr,fn) {
        var arr =[];
        each(orgArr,function (val,idx) {
            if(fn.call(val,val,idx)) {
                arr.push(this)
            }
        });
        return arr;
    }
	//字符串优化
	var display = "display",
		none = "none",
		unde = "undefined"

	var offsetTop=function( elem ){
		var top = elem.offsetTop;
		var parent = elem.offsetParent;
		while(parent){
			top += parent.offsetTop;
			parent = parent.offsetParent;
		}
		return top;
	};
	var offsetLeft=function( elem ){
		var left = elem.offsetLeft;
		var parent = elem.offsetParent;
		while( parent){
			left += parent.offsetLeft;
			parent = parent.offsetParent;
		}
		return left;
	};


	var selfProp ={

        //在Ie8+支持选择器，其他浏览
        find:function( str ){
            var self = new Dom();
            each(this,function (val) {
                var context = val;
                var dom = find(str,context);
                Array.prototype.push.apply(self,dom);
            })
            return self;
        },
		offset:function () {
			var self =this;
			if(self[0]){
				return {top:offsetTop(self[0]),left:offsetLeft(self[0])}
			}
		},
        scrollTop:function(){
            if(this[0]==window||this[0]==document||this[0]==document.body){
                return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            }else{
                return this[0].scrollTop;
            }
        },
        scrollLeft:function(){
            if(this[0]==window||this[0]==document||this[0]==document.body){
                return document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
            }else{
                return this[0].scrollLeft;
            }
        },
        stop:function(){

        },

        on : function( type , delegate, fn ,keep){
            var self =this;
            type = type.split(",");
            var len = type.length;
            //代理
            if(typeof delegate=="function" ){
                keep = fn;
                fn = delegate
                delegate = null;
            }
            each(this, function( val ){
                var fn1 = fn

                if(delegate){
                    fn1=function(e){
                        var delegateNodes = find(delegate,val);
                        var delegateInfo = findDelegateDom(e.target,val,delegateNodes)
                        if(delegateInfo){
                            fn.call(delegateInfo.dom,e,delegateInfo)
                        }
                    }
                }
                for(var i=0; i<len; i++){
                    val.eventMap = val.eventMap||{};
                    val.eventMap[type[i]] = val.eventMap[type[i]]||[];
                    var handlerEventFun = function(e){
                        bind( e, fn1, keep,val );
                    }
                    val.eventMap[type[i]].push(handlerEventFun)
                    val[ g_listner ]( g_type + type[i].split(".")[0], handlerEventFun, false );
                }

            });
            return this;
        },
        off:function ( type , delegate, fn ,keep) {
            var self =this;
            type = type.split(",");
            var len = type.length;
            //代理
            if(typeof delegate=="function" ){
                keep = fn;
                fn = delegate
                delegate = null;
            }
            each(this, function( val ){
                for(var i=0; i<len; i++){
                    if(val.eventMap&&val.eventMap[type[i]] ){
                        var eventLen = val.eventMap[type[i]];
                        while (eventLen--){
                            val[ g_removeListner ]( g_type + type[i].split(".")[0], val.eventMap[type[i]][eventLen], false );
                        }
                    }
                }

            });
            return this;
        },
        bind:function(){
          this.on.apply(this,arguments)
        },
        unbind:function(){
            this.on.apply(this,arguments);
        },
        append : function(str){

            each( this, function( val, i ){
                innerHtml(str,val)
            })
            return this;

        },
        appendTo:function(parent){
             RBT.dom(parent).append(this);
            return this;
        },
        val : function(){
            if(this.length==0){
                return ( typeof arguments[0] === unde)? "":this;
            }
            return ( typeof arguments[0] === unde)? this[0].value:(this[0].value=arguments[0],this[0].setAttribute("value",arguments[0]),this);
        },
        prop:function(name,value){
            if(arguments.length==1){
                if(this.length==0){
                    return this;
                }
                return getAttr(this[0],name)
            }else{
                each( this, function( val, i ){
                    setAttr(val,name,value);
                });
                return this;
            }
        },
        html:function(str){

            if(arguments.length==0){
                if(this.length==0){
                    return this;
                }
                return this[0].innerHTML;
            }else{
                each( this, function( val, i ){
                    innerHtml(str,val,true)
                });
                return this;
            }

        },
        //selector必须是单一的class或者是id或者是input
        parents:function(selector){
            var self = RBT.dom();
            if(typeof selector!=="string"){
                return self;
            }
            var parentNodes=[];
            each(this,function (val) {
                findParentDom(val,selector,parentNodes);
            })

            Array.prototype.push.apply(self,parentNodes);
            return self;
        },
        parent:function(){
            if(this.length==0){
                return new Dom();
            }
            return RBT.dom(this[0].parentNode);
        },
        css:function(){

            var args = arguments;
            var len = args.length;
            var temp = [];
            if(typeof args[0] === "object"){
                for(var i in args[0]){
                    each(this,
                        function(val){
                            setCss(val, i, args[0][i])
                        }
                    );
                }
            }else if(len === 1){
                return getCss(this[0],args[0]);
            }else{
                each(this,
                    function (val){
                        setCss(val, args[0], args[1])
                    }
                );
                return this;

            }
        },
        width : function(width){
            if(this[0]==window){
                return window.innerWidth;
            }
			if(width){
				return this.css("width",width+"px");
			}else{
                if(this.css("box-sizing")=="border-box"){
                    return (this.css("width")||"").toFloat();
                }else{
                    return (this.css("width")||"").toFloat()  - (this.css("padding-left")||"").toFloat()- (this.css("padding-right")||"").toFloat();
                }

			}
        },
        height: function(height){
            if(this[0]==window){
                return window.innerHeight;
            }
			if(height){
				return this.css("height",height+"px");
			}else{
			    if(this.css("box-sizing")=="border-box"){
			        return  (this.css("height")||"").toFloat()
                }else{
                    return (this.css("height")||"").toFloat() - (this.css("padding-top")||"").toFloat()- (this.css("padding-bottom")||"").toFloat();
                }
			}
        },
        show : function(){
            var that = this;
            each(this.css( display),
                function( val , idx){
                    if(val === none){
                        RBT.dom( that[idx] ).css(display,"")
                    }
                }
            );
            return this;
        },
        hide : function(){
            var that = this;
            each(this.css( display),
                function( val , idx){
                    if(val !== none){
                        RBT.dom( that[idx] ).css(display,none)
                    }
                }
            );
            return this;
        },
        attr:function(){
            return this.prop.apply(this,arguments)
        },
        each:function (fn) {
            each(this,fn);
            return this;
        },
        add:function (selector) {
            var that=this;
            each(RBT.dom( selector ),function () {
                Array.prototype.push.call(that,this)
            });
            return this;
        },
        not:function (selector) {
            var that = this;
            var arr = [];
            each(this,function (val,idx) {
                var selectorString = "#" +RBT.dom( val ).prop("id")+ "."+RBT.dom( val ).prop("id").split(/\s+/).join(".");
                if(selectorString.indexOf(selector)==-1){
                    arr.push(this)
                }
            });
            var self = new Dom();
            Array.prototype.push.apply(self,arr);
            return self;
        },
        eq:function(idx){
            return RBT.dom( this[idx] );
        },
        filter:function (fn) {
            var arr = filter(this,fn);
            this.length=0;
            var self = new Dom();
            Array.prototype.push.apply(self,arr);
            return self;
        },
        removeClass:function (className) {
            var args = arguments;
            each(this, function (val, idx) {
                if (typeof className == "string") {
                    var domClassName = getAttr(val, "class") || "";
                    var splitClassName = className.split(/\s+/);
                    var splitClassNameLen = splitClassName.length;
                    while (splitClassNameLen--) {
                        if (~domClassName.indexOf(splitClassName[splitClassNameLen])) {
                            domClassName = domClassName.replace(splitClassName[splitClassNameLen], "");
                        }
                    }
                    setAttr(val, "class", domClassName);
                } else if (args.length == 0) {
                    setAttr(val, "class", "");
                }
            });
            return this;
        },
        remove:function(){
            each(this,function () {
                this.remove();
            })
        },
        addClass:function (className) {
            each(this, function (val, idx) {
                if (typeof className == "string") {
                    var domClassName = getAttr(val, "class") || "";
                    var splitClassName = className.split(/\s+/);
                    var splitClassNameLen = splitClassName.length;
                    while (splitClassNameLen--) {
                        if (domClassName.indexOf(splitClassName[splitClassNameLen])==-1) {
                            domClassName += " "+splitClassName[splitClassNameLen]
                        }
                    }
                    setAttr(val, "class", domClassName);
                }
            });
            return this;
        },
        hasClass:function (className) {
        	var val = this[0];
            if(this.length==0){
                return this;
            }
            if (typeof className == "string") {
                var domClassName = getAttr(val, "class") || "";
                var splitClassName = className.split(/\s+/);
                var splitClassNameLen = splitClassName.length;
                if(splitClassNameLen==0){
                    return false;
				}
                while (splitClassNameLen--) {
                    if (domClassName.indexOf(splitClassName[splitClassNameLen])==-1) {
                        return false;
                    }
                }
                return true;
            }else{
            	return false
			}
        },
        toggleClass:function(className){
            each(this, function (val, idx) {
                var $this =  RBT.dom(val);
                if($this.hasClass(className)){
                    $this.removeClass(className)
                }else{
                    $this.addClass(className)
                }
            });
            return this;
        },
        data:function () {
            var args = arguments;
            var ret = {}
            if(args.length==0){
                if(this.length){
                    this[0].selfAttributes = this[0].selfAttributes ||{}
                    each(this[0].attributes, function (val, idx) {
                        if(typeof val=="object"&&val.nodeType==2&&val.name.indexOf("data-")==0){
                            ret[val.name.replace("data-","")] = val.value
                        }
                    })

                    each(this[0].selfAttributes, function (val, idx) {
                        if(idx.indexOf("data-")==0){
                            ret[idx.replace("data-","")] = val
                        }
                    })
                }
                return ret;
            }else if(args.length==1){
                if(this.length){
                    this[0].selfAttributes = this[0].selfAttributes ||{}
                    var dataValue = this[0].attributes["data-"+args[0]];
                    var dataValue2 = this[0].selfAttributes["data-"+args[0]];
                    if(typeof dataValue=="object" && dataValue.nodeType==2){
                       return dataValue.value
                    }else if(typeof dataValue!="undefined"){
                        return dataValue;
                    }else{
                        return dataValue2;
                    }

                }
            }else{
                each(this, function (val, idx) {
                    var dataName = args[0];
                    if(dataName){
                       var dataValue = args[1];
                       if(typeof dataValue=="object"||typeof dataValue=="function"){
                           val.selfAttributes = val.selfAttributes ||{}
                           val.selfAttributes["data-"+dataName] =dataValue;
                       }else{
                           setAttr(val, "data-"+dataName, dataValue);
                       }
                    }
                });
            }
            return this;
        },
        trigger:function (eventName) {
            each(this, function (val, idx) {
                fireEvent(val,eventName);
            });
        }
    }
    //翻转
    RBT.dom.each =function(arr,fn){
	    each(arr,function(val,idx){
            fn.call(val,idx,val);
        })
    };
    RBT.dom.extend =extend;
    RBT.dom.type =function (tar) {
        if(typeof tar=="object"){
            if(tar==null){
                return "null"
            }else if(tar.length!=null){
                return "array"
            }else{
                return "object"
            }
        }
        return typeof tar;
    };
    RBT.dom.trim =function(val){
        if(val){
            return val.toString().replace(/^\s+|\s+$/,"");
        }
        return "";
    };
    RBT.dom.isEmptyObject = function (obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    };
	// RBT.dom.cookie =RBT.cookie;
	// RBT.dom.ajax =RBT.ajax;
	// RBT.dom.floatHeight =RBT.floatHeight;

    each(["submit","keyup","mousedown","mouseleave","click","change","mousemove","mouseup","mouseenter","scroll","resize","blur","focus"],function (val,idx) {
        selfProp[val] = function (fn) {
            if(fn){
                this.on(val,fn);
            }else{
                this.trigger(val);
            }
			return this;
        }
    })
    //扩展实例
    RBT.dom.fn = Dom.prototype;
	for(var prop in selfProp){
        RBT.dom.fn[prop] = selfProp[prop];
	}

})();
