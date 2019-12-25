
// https://blog.csdn.net/qq_41455420/article/details/79549599


/**
 客户端类型：pc wap tool bot unkown
 系统类型：mac window Ubuntu FreeBSD linux ios android blackBerry windowsCE windowPhone symbian unkown
 系统位数：64  32
 系统版本：series unkown
 浏览器 ： ie chrome safari opera firefox  LotusNotes Lynx konqueror unkown
 浏览器版本： series unkown
 浏览器厂家：apple google firefox  opera 360  遨游 htc 世界之窗 SAMSUNG qq uc sogou Avant Xoom hp Nexus outlook utlookExpress Vivaldi AppStore Silk iTunes Thunderbird OmniWeb Camino SeaMonkey Flock OperaMini OperaCoast blackberry konqueror LotusNotes  Lynx unkown

 //得到统一的格式
 客户端类型/系统类型/系统位数/系统版本/浏览器/浏览器版本/浏览器厂家
 */

function matchUserAgent(userAge){
	var startReg = /^\s*([a-zA-Z-\s_]+)\/\d+\.\d+\s+\(([^\)]+)\)/g;
	var match = userAge.match(startReg);

	if(match&&match[0]){
		var matchStr = match[0];
	}else{
		matchStr = userAge
	}


	var isMac = matchStr.match(/Mac\sOS\sX\s(\d+\D\d+(\D\d+)?)/i) || matchStr.match(/Mac\sOS\s(X)/i) ;
	var isWindow = matchStr.match(/Windows\sNT\s(\d+\D\d+(\D\d+)?)/i)|| matchStr.match(/Windows\s*(\d+(\D\d+)?)/i) || userAge.match(/Windows\s*(XP)/i)
	var isIphone = /\(iPhone;/i.test(matchStr);
	var isIpad =  /\(iPad;/i.test(matchStr);
	var isIpod = /\(iPod;/i.test(matchStr);
	var applemail = userAge.match(/AppleWebKit\/(533\.18\.1)/i)
	var OmniWeb = userAge.match(/OmniWeb\/v(\d+(\D\d+)?(\w)?)/i)
	var iphoneVersion = matchStr.match(/OS\s(\d+\D\d+(\D\d+)?)/i)||matchStr.match(/Mac\sOS\s(X)/i) ;
	var isAndroid =  matchStr.match(/android-?\s*(\d+\D\d+(\D\d+)?)/i)|| userAge.match(/Linux\s(armv7l)/i)
	var BlackBerry =  matchStr.match(/BlackBerry\s(\d+(\D\d+)?)/i)||userAge.match(/BB10;/i);
	var SymbianOS = /SymbianOS/i.test(matchStr);
	var WindowsPhone = userAge.match(/Windows\sPhone\sOS\s*\/?\s*(\d+\D\d+(\D\d+)?)/)||userAge.match(/Windows\sPhone\s*(\d+\D\d+(\D\d+)?)/)
	var WindowsCE = userAge.match(/Windows\s(CE)/);
	var hpwOS = userAge.match(/hpwOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var linux = userAge.match(/linux\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || userAge.match(/Linux\s(x86_64)/i) || userAge.match(/Linux\s(i\d+)/i)
	var FreeBSD = userAge.match(/FreeBSD\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var Ubuntu = userAge.match(/Ubuntu\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);

	var isChrome = userAge.match( /Chrome\s*\/\s*(\d+\D\d+(\D\d+)?)/i);
	var chromeMobile = userAge.match( /CrMo\s*\/\s*(\d+\D\d+(\D\d+)?)/i)|| userAge.match( /CriOS\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match( /CrOS\si686\s*(\d+\D\d+(\D\d+)?)/i)
	var isIe =  matchStr.match(/MSIE\s(\d+(\D\d+)?(\w)?)/i);
	var isIe11 = /Trident/i.test(matchStr)&&/rv:11/i.test(matchStr)|| matchStr.match(/\bIE\s11\b/i);
	var edge = userAge.match(/Edge\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var Opera = matchStr.match(/Opera\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i)|| userAge.match(/OPR\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i)
	var OperaMini = userAge.match(/Opera\sMini\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i)
	var OperaCoast = userAge.match(/Coast\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i)
	var Safari = userAge.match(/Safari\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var Version = userAge.match(/Version\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var fireFox = userAge.match(/Firefox\s*\/\s*(\d+\D\d+(\D\d+)?)/)|| userAge.match(/FxiOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var Camino = userAge.match(/Camino\s*\/\s*(\d+\D\d+(\D\d+)?)/)
	var SAMSUNG = userAge.match(/SAMSUNG/)
	var SeaMonkey = userAge.match(/SeaMonkey\s*\/\s*(\d+\D\d+(\D\d+)?)/)
	var Flock = userAge.match(/Flock\s*\/\s*(\d+\D\d+(\D\d+)?)/)
	var BrowserNG = userAge.match(/BrowserNG\s*\/\s*(\d+\D\d+(\D\d+)?)/);
	var Presto = userAge.match(/Presto\s*\/\s*(\d+\D\d+(\D\d+)?)/);

	var is64 = /\b(WOW64|Win64|x64)\b/.test(userAge);
	var IEMobile =matchStr.match(/IEMobile\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var  isMobile= /Mobile/i.test(userAge);


	var outlook = userAge.match(/MSOffice\s*(\d+(\D\d+)?)/i)
	var OutlookExpress = userAge.match(/Outlook-Express\s*\/\s*(\d+(\D\d+)?)/i)
	var is360  = /360SE/i.test(matchStr)|| /360EE/i.test(userAge);
	var aoyou  = /Maxthon/i.test(matchStr);
	var theWord= /The\sworld/i.test(matchStr);
	var qq= /TencentTraveler/i.test(matchStr)||/MQQBrowser/i.test(userAge);
	var sogou= /MetaSr/i.test(matchStr);
	var Avant= /Avant/i.test(matchStr);
	var Xoom= /Xoom/i.test(matchStr);
	var Nexus= /Nexus/i.test(matchStr);
	var htc = /htc/i.test(userAge);
	var isUc = userAge.match(/UCWEB\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || /\bUC\b/.test(userAge);
	var Vivaldi = userAge.match(/Vivaldi\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var AppStore = userAge.match(/Mac(AppStore)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var iTunes = userAge.match(/(iTunes)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var Silk = userAge.match(/(Silk)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var Thunderbird = userAge.match(/Thunderbird\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
	var konqueror = userAge.match(/konqueror\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);

	var isProxy =  userAge.match(/\(via\s+(\w+\.\w+)\)/i);

	//端类别
	var type = "unkown";
	if(isIphone||isIpad||isIpod||isAndroid||isMobile||SymbianOS||BlackBerry||IEMobile||isUc||hpwOS || BrowserNG||chromeMobile||OperaMini||SAMSUNG){
		type = "wap";
	}else if(isMac||isWindow||linux){
		type = "pc";
	}
	//系统类别
	var systemType = "unkown";
	if(isMac && !(type=="wap")){
		systemType = "mac";
	}else if(isWindow) {
		systemType = "window";
	}else if(Ubuntu){
		systemType = "Ubuntu";
	}else if(FreeBSD){
		systemType = "FreeBSD";
	}else if( (hpwOS||linux) && !isAndroid){
		systemType="linux";
	}else if(type=="wap"){
		if(isIphone||isIpad||isIpod){
			systemType = "ios";
		}else if(BlackBerry){
			systemType = "blackBerry";
		}else if(WindowsPhone){
			systemType = "windowPhone";
		}else if(WindowsCE){
			systemType="windowsCE";
		}else if(SymbianOS||IEMobile ||BrowserNG ){
			systemType = "symbian";
		}else{
			systemType="android";
		}
	}
	//cpu位数
	var cpuBit = is64?"64":"32";

	//系统版本
	var systemVersion = "unkown";
	if(systemType!="unkown"){
		systemVersion = isWindow&&isWindow[1] || (isIphone||isIpad||isIpod) && iphoneVersion&&iphoneVersion[1]  || isMac&&isMac[1] ||  BlackBerry && BlackBerry[1] || WindowsPhone&&WindowsPhone[1] || BrowserNG&&BrowserNG[1] || hpwOS&&hpwOS[1]|| chromeMobile&&chromeMobile[1] || isAndroid && isAndroid[1] || WindowsPhone&&WindowsPhone[1] || WindowsCE&&WindowsCE[1] || FreeBSD&&FreeBSD[1] ||  Ubuntu&&Ubuntu[1] || linux&&linux[1]  || "unkown"
	}

	//浏览器类别
	var browser = "unkown";
	if( isIe || isIe11 || edge || IEMobile || SymbianOS){
		browser = "ie";
	}else if(Opera||Presto||OperaCoast){
		browser = "opera";
		isChrome = null;
		Safari = null;
	}else if(isChrome||chromeMobile||isUc){
		browser = "chrome";
	}else if(fireFox ||Camino || SeaMonkey || Flock){
		browser = "firefox";
	}else if(isIphone||isIpad||isIpod || Safari || applemail){
		browser = "safari";
	}
	var browserVersion = "unkown";
	if(browser!="unkown"){
		browserVersion =isIe&&isIe[1] || isIe11&&"11" || edge&&edge[1] || isChrome&&isChrome[1] || chromeMobile&& chromeMobile[1] || applemail&&applemail[1] || fireFox&&fireFox[1]  || isUc&&isUc[1]  || Presto&&Version&&Version[1] || OperaCoast&&OperaCoast[1] ||Opera&&Opera[1] || konqueror&&konqueror[1] || (browser == "safari")&&Version&&Version[1] || OmniWeb&&OmniWeb[1] ||Safari&&Safari[1]|| "unkown"
	}
	//
	var coop = isProxy&&("proxy_"+isProxy[1].replace(/\./g,"_")) ||is360&&"360" || isUc&&"uc" || aoyou&&"遨游" || htc&&"htc" || theWord&&"世界之窗" || SAMSUNG&&"SAMSUNG" || qq&&"qq" || sogou&&"sogou" || Avant&&"Avant" || Nexus&&"Nexus" || Xoom&&"Xoom" || hpwOS&&"hp" || outlook &&("outlook"+ outlook[1]) || OutlookExpress && "OutlookExpress" || browser=="ie"&&"microsoft" || Vivaldi&&"Vivaldi" || browser=="chrome"&&"google" || applemail&&"applemail" || AppStore&&"AppStore" || Silk&&"Silk" || iTunes&&"iTunes" || Thunderbird&&"Thunderbird" || OmniWeb&&"OmniWeb"  || Camino&&"Camino"||SeaMonkey&&"SeaMonkey" || Flock&&"Flock"|| browser=="firefox"&&"firefox" || OperaMini&&"OperaMini" || OperaCoast&&"OperaCoast" || browser=="opera"&&"opera"  || browser=="safari"&&"apple" || konqueror&&"konqueror"  || "unkown";
	//特殊
	if(type=="unkown"){
		var isLN = userAge.match(/Lotus-Notes\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
		var Lynx = userAge.match(/Lynx\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);

		if(Lynx){
			type = "wap";
			systemType = "window";
		}else if(isLN){
			type = "pc";
		}
		if(systemType=="unkown"){
			if(isLN){
				systemType = "window";
			}else if(Lynx){
				systemType="android";
			}
		}
		if(browser=="unkown"){
			if(isLN){
				browser = "LotusNotes";
			}else if(Lynx){
				browser="Lynx";
			}
		}
		if(browserVersion=="unkown"){
			browserVersion =  Lynx&&Lynx[1] || isLN&&isLN[1] || browserVersion
		}
		if(coop=="unkown"){
			coop = isLN&&"LotusNotes" || Lynx&&"Lynx" || coop
		}
	}

	if(type=="unkown"){


		var AdobeAIR = userAge.match(/(Adobe)AIR\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
		var curl = userAge.match(/(curl)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
		var ThumbSniperBot =  userAge.match(/(ThumbSniper)/i);

		var bot =  Thunderbird|| Silk  || AdobeAIR || curl || ThumbSniperBot || userAge.match(/^(Java)\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Phantom)\.js/i) || userAge.match(/^(python)-requests\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Wget)\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Apache)-HttpClient/i);


		type = bot&&"tool" || type;
		coop = bot&&bot[1]  || coop;
	}

	var googleBot = userAge.match(/(Google)bot/i)||userAge.match(/(Google)\sWeb\s Preview/i) || userAge.match(/Mediapartners-(Google)/i)  || userAge.match(/AdsBot-(Google)/i);
	var YahooBot = userAge.match(/(Yahoo)!\sSlurp/i);
	var AppleBot = userAge.match(/(Apple)Bot/i);
	var BingBot = userAge.match(/(Bing)Preview/i) || userAge.match(/(bing)bot/i)
	var WordPressBot = userAge.match(/(WordPress)\.com\s mShots/i);
	var SeznamBot = userAge.match(/(Seznam)\sscreenshot-generator/i);
	var facebookBot = userAge.match(/(facebook)externalhit/i);
	var ExaBot = userAge.match(/(Exabot)-Thumbnails/i);
	var YandexBot = userAge.match(/(Yandex)Market/i) ||  userAge.match(/(Yandex)MobileBot/i) ||  userAge.match(/(Yandex)Bot/i)  ;
	var AhrefsBot = userAge.match(/(Ahrefs)Bot/i);
	var AskBot = userAge.match(/(Ask)\sJeeves\/Teoma/i);
	var isBot = (googleBot || YahooBot ||AppleBot ||BingBot ||WordPressBot ||SeznamBot  || facebookBot ||ExaBot ||YandexBot ||AhrefsBot ||AskBot )

	if(isBot){
		type = isBot&&"bot";
		coop = isBot&&isBot[1]
	}
	return type + "/" +systemType +"/"+cpuBit+"/"+ systemVersion +"/"+ browser + "/" + browserVersion + "/" + coop
}
RBT.userAgent =  matchUserAgent(navigator.userAgent);