if(process.argv[2]&&process.argv[2].indexOf("www")==0){
	require("./rap.config."+process.argv[2])
}else{
		require("./rap.config.www4");
}
