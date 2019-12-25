var wakePromise = require("@/lib/rap.filesystem.promise");
var wake = require("@/lib/rap.filesystem");
function loadmateriallisttree(){
	return require("./loadmateriallisttree.json")
}
function loadmaterialData(){
		 delete require.cache[require.resolve("./loadmateriallis.json")];
		return require("./loadmateriallis.json")
}
function loadmaterialData2(){
		 delete require.cache[require.resolve("./loadmateriallis2.json")];
		return require("./loadmateriallis2.json")
}
function loadmaterialData3(){
		 delete require.cache[require.resolve("./loadmateriallis3.json")];
		return require("./loadmateriallis3.json")
}
function searchDetail(id){
	    delete require.cache[require.resolve(`./search${id}.json`)];
		return require(`./search${id}.json`)
}
var toggle=0;
exports=module.exports={
	"/cn/material/materialList.html":function(req,res,next){

		var params = req.params;
		if(params.method=="loadmateriallisttree"){
			next(loadmateriallisttree())
		}else if(params.method=="loadmaterial"){
			if(toggle){
				toggle=0;
				next(loadmaterialData2())
			}else{
				toggle=1
				next(loadmaterialData())
			}
		}else{
			next("/cn/material/materialList.html","text/html")
		}
		
	},
		"/cn/material/materialList2.html":function(req,res,next){

		var params = req.params;
		if(params.method=="loadmateriallisttree"){
			next(loadmateriallisttree())
		}else if(params.method=="loadmaterial"){
				next(loadmaterialData3())
		}else{
			next("/cn/material/materialList2.html","text/html")
		}
		
	},
	"/cn/material/onLineViewV3.html":function(req,res,next){
		if(!req){return;}
		var params = req.params;
		if(params.method=="submitcomment"||params.method=="loadcomments"){
			next({BO:{result:"true",comments:[]}})
		}else if(params.method=="loadonlineviewdata"){
			var data = {"status":true,"statusCode":0,"data":{"MaterialID":"21a1436f149c424db97519fc48d24800","Name":"华为 CloudEngine系列交换机 全家福","DocType":"mp4","Author":"liyingying 00301857","Authority":"ENT-PUBLIC","ReadTimes":3106,"DownloadTimes":2566,"Scores":2,"ScoreTimes":2,"LikeTimes":1,"ImgName":"423b960e-14f7-4155-803f-0567c0d882f9_1_1.jpeg","ImgDir":"/mediafiles/MarketingMaterial_MCD/EBG/PUBLIC/zh/2019/03/cache/423b960e-14f7-4155-803f-0567c0d882f9/","IsPreview":true,"IsForbiddenDownload":false,"IsLiked":false,"Status":1,"IsInterception":"false","IsFollow":false},"message":null}
			next(data);
		}else{
		  next("/cn/material/onLineViewV3.html")
		}
	},
	"/cn/material/materialSearch.html":function(req,res,next){
		var params = req.params;
		if(params.method=="loadindustrymenu"){
			next(searchDetail(6))
		}else if(params.method=="loadlanguagemenu"){
			next(searchDetail(66))
		}else if(params.method=="loadmattypemenu"&&params.categoryType=="7"){
			next(searchDetail(7))
		}else if(params.method=="loadsolutionmenu"&&params.categoryType=="8"){
			next(searchDetail(8))
		}else if(params.method=="loadproductmenu"&&params.categoryType=="9"){
			if(params.ebgProducts=="1C3CD1DEAB054009B225FF0B45093026"){
				next(searchDetail("9.1"))
			}else if(params.ebgProducts=="1C3CD1DEAB054009B225FF0B45093026,4B1788AD45294198B04C0BC27FBFC42B"){
				next(searchDetail("9.1.1"))
			}else if(params.ebgProducts=="6E1A5B98D3C04B7098375AF1CF91AE9A"){
				next(searchDetail("9.2"))
			}else{
				next(searchDetail(9))
			}
			
		}else if(params.method=="materialsearchdata"&&params.categoryType=="0"){
			next(searchDetail(0))
		}else{
			next("/cn/material/materialSearch.html","text/html")
		}
	}

}
