/*
*
* @title：rap框架
* @author：尹明
*
* */

rap.promission={
    ADMIN:0xffffffff,
    GROUP:{
		"xx1":0x1,
		"xx2":0x2,
		"xx3":0x4,
		"xx4":0x8,
		"xx5":0x10,
		"xx6":0x20,
		"xx7":0x40,
		"xx8":0x80,
		"xx9":0x100,
		"xx10":0x200,
		"xx11":0x400,
		"xx12":0x800,
		"xx13":0x1000,
		"xx14":0x2000,
		"xx15":0x4000,
		"xx16":0x8000
    }
}
/**
 * 校验是否有
 * flag为true时表示需要全部匹配
 * flag为false时表示只需要匹配一个就可以
 * */
rap.hasPromission =function(req){

	return true

}
