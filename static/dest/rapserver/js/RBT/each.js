;(function(){
	window.RBT = window.RBT || {};
	
	RBT.each = function( str, fn ){
		if( str.constructor === Array && Array.prototype.forEach ){
			str.forEach( function (val,idx) {
                if( fn.call( val, val, idx )===false ){
                   return false
                }
            } )
		}else if(str.length!=null ){
			for( var i=0; i<str.length; i++ ){
				if( fn.call( str[i], str[i], i )===false ){
					break;
				}
			}
		}else if(typeof str=="object"){
			for( var key in str){
				if( fn.call( str[key], str[key], key )===false ){
					break;
				}
			}
		}

	}

})();
