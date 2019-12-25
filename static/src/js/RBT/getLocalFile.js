;(function($){
	var fileQueue = [];
	var handlerStatus = "idle"
    var M5  = 3*1024*1024;
    /**
	 * 添加队列中
	 * */
	function AddFileQueue(files,fn){
        for (var f,i=0; f=files[i]; i++) {
        	f.slice = f.slice|| f.webkitSlice || f.mozSlice;
        	fileQueue.push({
				file:f,
                lastModified : f.lastModified,//modify
				name : f.name,
				type : f.type,
				relativePath : f.webkitRelativePath,//兼容
				size : f.size,
				start:0,//读取的开始位置
				status:"",//状态为end表示读取结束
				fn:fn//结束之后的回调
			})
		}
	}

    /**
     * 添加队列中，并且启动读文件
     * */
	function startReadFile(files,fn){
        AddFileQueue(files,fn);
		if(handlerStatus=="busy"){
			return;
		}
        handlerStatus = "busy";
        pipeFile(fileQueue.shift());
	}
    /**
     * 循环读取文件
     * */
	function pipeFile(queue){
        var reader = new FileReader();
        reader.onload = function( e ) {
            	queue.data = e.srcElement.result;
                if( typeof queue.fn === "function" ){
                    queue.fn( queue ,handleReadEnd);
                }else{
                    handleReadEnd();
				}
        }
        //读取数据
        function handleReadEnd(){
            if(queue.status!="end"){
                pipeFile(queue);
            }else{
                queue = null;
                //如果队列中没有文件，那么就将状态改为idle，如果有就继续读取下一个文件
                if(fileQueue.length){
                    pipeFile(fileQueue.shift());
                }else{
                    handlerStatus = "idle";
                }
            }
		}
        var end = 0;
        if(queue.start+M5>queue.size){
        	end = queue.size;
        	queue.status="end"
		}else{
        	end = queue.start+M5
		}
        var file = queue.file.slice(queue.start,end);
        queue.start = end;
        reader.readAsBinaryString( file );
	}

    /**
     * input files change事件、和文件drop事件回调
     * */
	function selectByDropOrInput( e,fn ){
		var files
		//drop dataTransfer.files
		if( e.dataTransfer ){
			files = e.dataTransfer.files;
		//input dom files
		}else{
			files=e.target.files;
		}
		if(!files||files.length==0){
			return;
		}
        startReadFile(files,fn);
	}
    /**
     * input files change事件、和文件drop事件回调
     * */
	function handleFileSelect( e,fn ) {
		e.stopPropagation();
		e.preventDefault();
		if( document.domain ){
			selectByDropOrInput( e,fn );
		}
	}
    /**
     * 拖拽文件阻止默认行为，如下载和打开
     * */
	function handleDragOver( e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy'; 
	}
	
	//单独分离this使用下面方法
	$.fn.getFile = function( fn ){
		this.each(function () {
			var $this = $(this);
			if($this.data("init-get-file")){
				return;
			}
            $this.data("init-get-file",true);
			if(this.tagName === "INPUT"){
				$this.on("change",function (e) {
                    handleFileSelect(e,fn);
                });
			}else{
				$this.on("drop",function (e) {
                    handleFileSelect(e,fn);
                });
				$this.on("dragover",function (e) {
                    handleDragOver(e,fn);
                });
			}
        });
		return this;
	}
})(RBT.dom);