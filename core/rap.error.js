

exports = module.exports = {
    UNKNOWN:500,
	TIMEOUT: 501,
	FILESTATERROR: 502,
    MESSAGE: 503,
	FILENOTFIND: 404,
    NOPERMISSION:403,
	throwError  (msg, code) {
		throw new Error(JSON.stringify({msg: msg, code: code}));
	},
	errorParse(str){
        return JSON.parse(str);
	},
	getMessage(msg,code){
    	var codeMap = {
    		error:501,
			success:200
		}
    	return {msg: msg, code: codeMap[code]||500}
	}
}
