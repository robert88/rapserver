;(function($,resizeStack){
    /**
     author:robert
     date:2018-12-07
     description:	Chart factory function
     **/
	var Chart = function(opts,canvas,wrap){
		this.canvas = canvas;
		this.c = canvas.getContext("2d");
		this.wrap = wrap;
		this.width = $(wrap).width();
		this.height = $(wrap).height();
		this.clear();
		this.opts = $.extend(true,{},opts);
		this.axis = this.opts&&this.opts.axis;
		this.data = this.opts&&this.opts.data;
		this.stack = [];
		this.parseAxisStyle();
		this.draw();
        resizeStack.push({fn:this.resize,context:this,params:[]})
	};
    /**
     author:robert
     date:2018-12-08
     description:	resize
     **/
	Chart.prototype.resize = function(){
        this.width = $(this.wrap ).width();
        this.height = $(this.wrap ).height();
        this.redraw()
	}
    /**
     author:robert
     date:2018-12-08
     description:	redraw
     **/
    Chart.prototype.redraw = function(opts){
        this.clear();
        this.stack = [];
        this.opts = $.extend(true,this.opts,opts);
        this.axis = this.opts&&this.opts.axis;
        this.data = this.opts&&this.opts.data;
        this.parseAxisStyle();
        this.draw();
	}
    /**
     author:robert
     date:2018-12-08
     description:	draw line chart
     **/
	function getTextWidth(text,fontsize,xformat){
		if(xformat){
			text = xformat(text);
		}
		var $test = $(".test-text")
		if(!$test.length){
            $test = $("<span></span>").appendTo("body");
            $test.attr("style","visibility: hidden;position:absolute;left:-100%").attr("class","test-text")
		}
        $test.css("font-size",fontsize).html(text)
      return  $test.width();
	}
    /**
     author:robert
     date:2018-12-08
     description: parseAxisX
     **/
    Chart.prototype.parseAxisX = function(style){
        var x = this.axis.x;
        if(!x){
            return console.error("error:not find axis x");
        }
        var xstyle = this.parseStyle(this.axis.xstyle);
        var xformat = this.axis.xformat;
        var len = x.length;
        var xdataType = "number";
        var index =-1

        for(var i=0;i<len;i++){
            var itemX = xstyle["left"]+(i+1)/len*xstyle["width"];
            var itemXText =itemX -getTextWidth(x[i],xstyle["font-size"],xformat);
            getLineStack(itemX,style["top"]+style["height"],itemX,style["top"]+style["height"]-5,style["border-bottom-color"],"solid",style["border-bottom-width"],this.stack);
            getTextStack(x[i],itemXText,xstyle["top"],xstyle["color"],xstyle["font-size"],this.stack,xformat);
            if(typeof x[i]=="string"){
                xdataType = "string";
            }
        }

        //解析数据
        var xdata = this.data.x;
        var xdataPx = [];
        if(xdataType=="number"){
            x.sort(function (a,b) {
                return a-b<0?-1:1;
            });
        }
        for(i=0;i<xdata.length;i++){
            if(xdataType=="number"){
                if(x[len-1]<xdata[i]){
                    xdata[i] = x[len-1];
                }
                if(x[0]>xdata[i]){
                    xdata[i] = x[0];
                }
                xdataPx.push((xdata[i]-x[0])/(x[len-1]-x[0])*xstyle["width"]+xstyle["left"]+1);
            }else{
                index = x.indexOf(xdata[i]);
                if(index!=-1){
                    xdataPx.push( xstyle["left"]+index/len*xstyle["width"]);
                }else {
                    xdataPx.push( xstyle["left"]);
                }
            }
        }
        return xdataPx
	}
    /**
     author:robert
     date:2018-12-08
     description: parseAxisY
     **/
    Chart.prototype.parseAxisY = function(style){
        var y = this.axis.y;
        if(!y){
            console.error("no axis y");
            return
        }

        var ystyle = this.parseStyle(this.axis.ystyle);
        var yformat = this.axis.yformat;
        var ydataType = "number";
        var index;
		var len = y.length;

		for(var i=len-1;i>=0;i--){
			var itemY= ystyle["top"]+(i+1)/len*ystyle["height"];
			getLineStack(style["left"],itemY,style["left"]+5,itemY,style["border-left-color"],"solid",style["border-left-width"],this.stack);
			getTextStack(y[len-1-i],ystyle["left"],itemY,ystyle["color"],ystyle["font-size"],this.stack,yformat);
			if(typeof y[i]=="string"){
				ydataType = "string";
			}
		}

        //解析数据
		var ydata = this.data.y;
		var ydataPx = [];
		if(ydataType=="number"){
			y.sort(function (a,b) {
				return a-b<0?-1:1;
			});
		}
		for(i=0;i<ydata.length;i++){

			if(ydataType=="number"){
				if(y[len-1]<ydata[i]){
					ydata[i] = y[len-1];
				}
				if(y[0]>ydata[i]){
					ydata[i] = y[0];
				}
				ydataPx.push(ystyle["top"]+(y[len-1]-ydata[i])/(y[len-1]-y[0])*ystyle["height"] );
			}else{
				index = y.indexOf(ydata[i]);
				if(index!=-1){
					ydataPx.push( ystyle["top"]+index/len*ystyle["height"]);
				}else{
					ydataPx.push( 0);
				}
			}
		}
		return ydataPx
    }
    /**
	 author:robert
	 date:2018-12-08
	 description:	draw line chart
	 **/
	Chart.prototype.parseAxisStyle = function(){
		if(this.axis){
			var style = {};
			if(this.axis.style){
				style = this.parseStyle(this.axis.style);

				getBorderStack(style,this.stack);

               var  xdataPx = this.parseAxisX(style);

               var  ydataPx =this.parseAxisY(style);

				if(xdataPx&&ydataPx){
					getGroupLineStack(xdataPx,ydataPx,style["border-left-color"],"solid",style["border-left-width"],this.stack);
				}
			}
		}
	};
	/**
	 author:robert
	 date:2018-12-08
	 description:	redraw chart clear all draw data
	 **/
	Chart.prototype.clear = function(){
		var radio = getPixelRatio(this.c);
		this.canvas.style.width = this.width+"px";
		this.canvas.style.height = this.height+"px";
		this.canvas.width = this.width* (radio);
		this.canvas.height = this.height* (radio);
	};
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw chart
	 **/
	Chart.prototype.draw = function(){
		var that = this;
		$.each(this.stack,function (idx,val) {
			if(val.type=="line"){
				if(val.style=="solid"){
					drawMoveLine(that.c,val.x1,val.y1,val.x2,val.y2,val.color,val.width);
				}else{
					dashedLine(that.c,val.x1,val.y1,val.x2,val.y2,val.color,val.width);
				}

			}if(val.type=="lineGroup"){

				if(val.style=="solid"){
					drawGroupLine(that.c,val.xArr,val.yArr,val.color,val.width);
				}else{
					drawGroupDashedLine(that.c,val.xArr,val.yArr,val.color,val.width);
				}

			}else{
				drawText(that.c,val.text,val.x,val.y,val.color,val.font);
			}
		});
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw blurry line to clear
	 **/
	function getPixelRatio(context) {
		var backingStore = context.backingStorePixelRatio ||
			context.webkitBackingStorePixelRatio ||
			context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio ||
			context.oBackingStorePixelRatio ||
			context.backingStorePixelRatio || 1;
		return (window.devicePixelRatio || 1) / backingStore;
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	px to float, % to relative size
	 **/
	function toValue(str,relativeValue) {
        if(typeof str=="number"){
            return str;
        }
        if(str.indexOf("%")!=-1){
           return  str.toFloat()/100*relativeValue;
        }
        return str.toFloat();
    }
	/**
	 author:robert
	 date:2018-12-08
	 description:	padding to padding-top padding-right padding-bottom padding-left
	 **/
    function toFourValue(str,relativeValue){
	    var values = str.split(/\s+/);
	    var leftValue
        var topValue;
	    var rightValue;
	    var bottomValue;
	    if(values.length==1){
            leftValue = toValue(values[0],relativeValue)
	        return [leftValue,leftValue,leftValue,leftValue];
        }else if(values.length==2){
            topValue= toValue(values[0],relativeValue);
           leftValue = toValue(values[1],relativeValue);
            return [topValue,leftValue,topValue,leftValue];
        }else if(values.length==3){
            topValue= toValue(values[0],relativeValue);
            bottomValue= toValue(values[2],relativeValue);
            leftValue = toValue(values[1],relativeValue);
            return [topValue,leftValue,bottomValue,leftValue];
        }else if(values.length==4){
            topValue= toValue(values[0],relativeValue);
            bottomValue= toValue(values[2],relativeValue);
            leftValue = toValue(values[3],relativeValue);
            rightValue = toValue(values[1],relativeValue);
            return [topValue,rightValue,bottomValue,leftValue];
        }
    }
	/**
	 author:robert
	 date:2018-12-08
	 description:	default value 0
	 **/
	function toDefaultValue(val) {
		return val || 0;
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	set number of layout conver left right top bottom and width height
	 **/
	function setDefaultValue(wrapWidth,wrapHeight,style){
		$.each(["top","right","bottom","left"],function (idx,val) {
			style[val] = toDefaultValue(style[val])
			style["padding-"+val] = toDefaultValue(style["padding-"+val])
			style["margin-"+val] = toDefaultValue(style["margin-"+val])
			style["border-"+val+"-width"] = toDefaultValue(style["border-"+val+"-width"])
		})
		$.each(["width","height","background-position-x","background-position-y"],function (idx,val) {
			style[val] = toDefaultValue(style[val])
		})
		//如果width存在
		if(!style["width"]&&style["left"]&&style["right"]){
			style["width"] = wrapWidth - style["left"]-style["right"];
		}

		if(!style["height"]&&style["top"]&&style["bottom"]){
			style["height"] = wrapHeight - style["top"]-style["bottom"];
		}
		if(style["right"]&&!style["left"]){
			style["left"] =wrapWidth - style["right"] + style["width"];
		}
		if(style["bottom"]&&!style["top"]){
			style["top"] =wrapHeight - style["bottom"] + style["height"];
		}
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw line stack
	 **/
	function getLineStack(x1,y1,x2,y2,color,style,width,stack){
		stack.push({
			type:"line",
			x1:x1,
			y1:y1,
			x2:x2,
			y2:y2,
			color:color||"#000000",
			style:style||"solid",
			width:width
		})
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw line group stack
	 **/
	function getGroupLineStack(xArr,yArr,color,style,width,stack){
		var x = [],y=[];
		var unique = {};
		for(var i=0;i<xArr.length;i++){
			if(!unique[xArr[i]+""]){
                unique[xArr[i]+""]=1;
                x.push(xArr[i]);
                y.push(yArr[i]);
			}
		}
		stack.push({
			type:"lineGroup",
			xArr:x,
			yArr:y,
			color:color||"#000000",
			style:style||"solid",
			width:width
		})
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw border stack
	 **/
	function getBorderStack(style,stack){
		var offset = [];
		var padding = [];
		var margin = [];
		var size = [];
		var border = [];
		$.each(["top","right","bottom","left"],function (idx,val) {
			var sizeHelp = ["height","width","height","width"];
			offset.push(style[val]) ;
			padding.push(style["padding-"+val] )
			margin.push(style["margin-"+val] );
			size.push(style[sizeHelp[idx]] );
			border.push({
				type:"line",
				color:style["border-"+val+"-color"]||"#000000",
				style:style["border-"+val+"-style"]||"solid",
				width:style["border-"+val+"-width"]
			})
		});

		$.each(border,function (idx,val) {
			var x1=0,x2=0,y1=0,y2=0;
			if(idx==1||idx==2){
				x1 = size[1];
			}
			if(idx==2||idx==3){
				y1 = size[0];
			}
			if(idx==0||idx==1){
				x2 = size[1];
			}
			if(idx==1||idx==2){
				y2 = size[0];
			}

			val.x1 =  (offset[3]+margin[3]) +x1 ;
			val.x2 = (offset[3]+margin[3])+x2 ;
			val.y1 = (offset[0]+margin[0]) +y1 ;
			val.y2 = (offset[0]+margin[0]) +y2 ;


			if(val.width){
				stack.push(val);
			}
		})

	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	draw text stack
	 **/
	function getTextStack(text,x,y,color,font,stack,format){
		stack.push({
			type:"text",
			text:typeof format=="function"?format(text):text,
			x:x,
			y:y,
			color:color||"#000000",
			font:font||"12px"
		})
	}
	/**
	 author:robert
	 date:2018-12-08
	 description:	parse one css style to draw params
	 **/
    Chart.prototype.parseOneStyle = function(style,styleName,styleValue){
		var borderH;
		var borderV
		switch (styleName){
            case "top":
            case "bottom":
            case "height":
			case "background-position-y":
                style[styleName] = toValue(styleValue,this.height);
                break;
            case "padding":
            case "margin":
                var padding = toFourValue(styleValue,this.width);
				style[styleName+"-top"] = padding[0];
				style[styleName+"-right"] = padding[1];
				style[styleName+"-bottom"] = padding[2];
				style[styleName+"-left"] = padding[3];
                break;
			case "left":
			case "right":
			case "width":
            case "padding-left":
            case "padding-right":
            case "padding-bottom":
            case "padding-top":
            case "margin-left":
            case "margin-right":
            case "margin-bottom":
            case "margin-top":
			case "background-position-x":
                style[styleName] = toValue(styleValue,this.width);
                break;
            case "border":
                styleValue = styleValue.split(/\s+/);
                styleValue[1] = styleValue[1]||"solid";
                styleValue[2] = styleValue[2]||"#000";
                 borderH =  toValue(styleValue[0],this.width);
                 borderV =  toValue(styleValue[0],this.height);
                style[styleName+"-left-width"] = borderV;
                style[styleName+"-right-width"] = borderV;
                style[styleName+"-bottom-width"] = borderH;
                style[styleName+"-top-width"] = borderH;
				style[styleName+"-left-style"] = styleValue[1];
				style[styleName+"-right-style"] = styleValue[1];
				style[styleName+"-top-style"] = styleValue[1];
				style[styleName+"-bottom-style"] = styleValue[1];
				style[styleName+"-left-color"] = styleValue[2];
				style[styleName+"-right-color"] = styleValue[2];
				style[styleName+"-top-color"] = styleValue[2];
				style[styleName+"-bottom-color"] = styleValue[2];
				break;
			case "border-right":
			case "border-left":
				styleValue = styleValue.split(/\s+/);
				styleValue[1] = styleValue[1]||"solid";
				styleValue[2] = styleValue[2]||"#000";
				 borderH =  toValue(styleValue[0],this.width);
				style[styleName+"-width"] = borderH;
				style[styleName+"-style"] = styleValue[1];
				style[styleName+"-color"] = styleValue[2];

				break;
			case "border-top":
			case "border-bottom":
				styleValue = styleValue.split(/\s+/);
				styleValue[1] = styleValue[1]||"solid";
				styleValue[2] = styleValue[2]||"#000";
				borderV =  toValue(styleValue[0],this.height);
				style[styleName+"-width"] = borderV;
				style[styleName+"-style"] = styleValue[1];
				style[styleName+"-color"] = styleValue[2];
				break;
			case "background":
				var background = [];
				styleValue = styleValue.match(/(#[0-9a-f]+\s*)|(rgba?\([^\)]+\))|(url?\([^\)]+\))|([0-9a-z-]+\s*)|([0-9a-z-]+\s*)|([0-9a-z-]+\s*)/g);
				var idx = 0;
				if(/(#[0-9a-f]+\s*)|(rgba?\([^\)]+\))/.test(styleValue[0])){
					style["background-color"] = styleValue[0];
					idx =1;
					if(/(url?\([^\)]+\))|([0-9a-z-]+\s*)/.test(styleValue[1])){
						style["background-image"]  = styleValue[1];
					}
				}else if(/(url?\([^\)]+\))|([0-9a-z-]+\s*)/.test(styleValue[0])){
					style["background-image"]  = styleValue[0];
				}
				style["background-repeat"] = styleValue[1+idx];
				style["background-position-x"] = toValue(styleValue[2+idx],this.width);
				style["background-position-y"] =  toValue(styleValue[3+idx],this.height);
				break;
			default :
				style[styleName] = styleValue
        }
	};
	/**
	 author:robert
	 date:2018-12-08
	 description:	parse style to draw params
	 **/
    Chart.prototype.parseStyle = function(str){
	    var that = this;
	    var style={};
	    if(!str){
	        return;
        }
	    var item = str.split(";");
	    $.each(item,function (idx,val) {
	        val = val.trim();
            if(val){
                var styleItem = val.split(":");
                if(styleItem.length==2){
                    var styleName = styleItem[0].trim();
                    var styleValue = styleItem[1].trim();
                    that.parseOneStyle(style,styleName,styleValue)
                }
            }
        });
		setDefaultValue(this.width,this.height,style);
		return style;
    };

	// Chart.prototype.addLine  =function(opts){
	// 	opts = RBT.extend({},defaultLineOptions,opts);
	// }
	// Chart.prototype.addPoint  =function(opts){
	// 	opts = RBT.extend({},defaultPointOptions,opts);
	// }

    /**
     author:robert
     date:2018-12-07
     description:	use RBT.dom prototype function to do chart
     **/
	RBT.dom.fn.chart = function(opts,callback){
		return this.each(function(){
				if($(this).data("init-chart")){
					return;
				}
				$(this).data("init-chart",true).append($("<canvas></canvas>"));
				var c = $(this).find("canvas")[0];
            callback(new Chart(opts,c,this));
		});
	};

    /**
     author:robert
     date:2013-08-13
     description:	draw line width variable point param0 is context2D laster param is stroke style
     **/
    function drawLine(c,x,y,color,border){
		var radio = getPixelRatio(c);
		x = x*radio;
		y = y*radio;
        if(!c){throw "画线cavnas 不存在！";}
        c.lineTo(x,y);
        c.strokeStyle=color;
        c.lineWidth=border;
        c.stroke();
    }
    /**
     author:robert
     date:2013-08-13
     description:	draw line width variable point param0 is context2D laster param is stroke style
     **/
    function drawMoveLine(c,x0,y0,x1,y1,color,border){
        if(!c){throw "画线cavnas 不存在！";}
		var radio = getPixelRatio(c);
        c.beginPath();
        c.lineCap="round";
        c.lineJoin="round";
		x0= x0*radio;
		y0 = y0*radio;
		// if(x0%2){
		// 	x0+=.5;
		// }
		// if(y0%2){
		// 	y0+=.5;
		// }
        c.moveTo(x0,y0);
        drawLine(c,x1,y1,color,border);
    }
	/**
	 author:robert
	 date:2013-08-13
	 description:	draw group line
	 **/
	function drawGroupLine(c,xArr,yArr,color,border){
		if(!c){throw "画线cavnas 不存在！";}
		var radio = getPixelRatio(c);
		c.beginPath();
		c.lineCap="round";
		c.lineJoin="round";
		var x,y;
		for(var i=0;i<xArr.length;i++){
			yArr[i] = yArr[i]||0

				x= xArr[i]*radio;
				y = yArr[i]*radio;
				if(i==0){
					c.moveTo(x,y);
				}else{
					c.lineTo(x,y);
				}

		}
		c.strokeStyle=color;
		c.lineWidth=border;
		c.stroke();
		c.closePath();
	}
	/**
	 author:robert
	 date:2013-08-13
	 description:	draw group line
	 **/
	function drawGroupDashedLine(c,xArr,yArr,color,border){
		for(var i=0;i<xArr.length;i+=2){
			yArr[i] = yArr[i]||0
			dashedLine(c,xArr[i],yArr[i],xArr[i+1],yArr[i+1],color,border);
		}
		if(xArr.length<i){
			dashedLine(c,xArr[i-2],yArr[i-2],xArr[i-1],yArr[i-1],color,border);
		}
	}

    /**
     author:robert
     date:2014-01-16
     description:	dash line dot to dot  dashArray is length of solid line and dash line;
     **/
    function dashedLine(c,x,y,x2,y2,color,border,dashArray){
        if (!dashArray){dashArray=[10,5];}
        var dx = (x2-x), dy = (y2-y);
        var distRemaining = Math.sqrt( dx*dx + dy*dy );
        var dashLen =(dashArray[0]+dashArray[1]);
        var step = Math.floor(distRemaining/dashLen);
        var dashArraySlop = dashArray[0]/dashLen;
        var xStep = dx/ step;
        var yStep = dy/ step;
        var dashIndex=0, draw=true;
        var x0,y0;
        for(var i=0;i<step;i++){
            x0=x+i*xStep;
            y0=y+i*yStep;
            drawMoveLine(c,x0,y0,x0+xStep*dashArraySlop,y0+yStep*dashArraySlop,color,border);
        }
    }
    /**
     author:robert
     date:2014-01-16
     description:	fill dot
     **/
    function drawDot(){
        var argLen=arguments.length;
        var c =arguments[0];
        if(!c){throw ("画点 canvas对象不存在！");}
        if(argLen>=5){
            c.beginPath();
            //	console.log(arguments[argLen-1])
            for(var i=2;i<arguments.length-1;i+=2){
                c.arc(arguments[i-1], arguments[i], arguments[argLen-2], 0, Math.PI * 2, true);
            }
            c.fillStyle=arguments[argLen-1];
            c.fill();
        }else{
            throw ("画点 参数不对！");
        }
    }
    /**
     author:robert
     date:2014-01-16
     description:	fill text
     **/
    function drawText(c,t,x,y,color,font){
		var radio = getPixelRatio(c);
		x = x*radio;
		y = y*radio;
        if(!c){return;}
        c.beginPath();
        c.fillStyle=color;
        if(font){
            c.font=font;
        }
        c.fillText(t,x,y);
    }
    /**
     author:robert
     date:2014-01-16
     description:	fill picture
     **/
    function drawPicture(c,src,x,y,_load){
        if(!c){throw "画图 canvas对象不存在！";}
        var img =new Image();
        img.src = src;
        if(!_load){
            img.onload = function(){
                c.beginPath();
                c.drawImage(img,x,y);
            };
        }else{
            c.beginPath();
            c.drawImage(img,x,y);
        }
    }


})(window.RBT.dom,RBT.resizeStack);