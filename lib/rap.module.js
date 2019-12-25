rap.module = {};


/*
 * 注册模块
 * */
rap.registerModule = function () {
	var arg = arguments;
	var registerName = arg[0].moduleName;
	if (rap.debug_module)rap.log("注册模块：" + registerName);
	var t = function (data) {
		if (!t)return rap.module[registerName].prototype
		var origins = t._register_wait;
		if (origins) {
			for (var i = 1; i < origins.length; i++) {
				if (origins[i]._register_wait)origins[i] = origins[i].call(rap, data);
			}
		}
		rap.module[registerName] = rap.initModule.apply(rap, origins);
		t = origins = null;
		if (this != rap)return new rap.module[registerName](data);
		else return rap.module[registerName];
	};
	t._register_wait = Array.prototype.slice.call(arg, 0);
	return (rap.module[registerName] = t);
};
/*
 * 初始化模块
 * */
rap.initModule = function () {
	var arg = arguments;
	var selfModule = {};
	if (rap.debug_module)console.log("初始化模块 ", arg[0].moduleName);
	var initGroup = [];
	var i = arg.length;
	while (i--) {
		if (arg[i].prototype) {
			arg[i] = arg[i].prototype
		}
		if (arg[i].$init) {
			initGroup.push(arg[i].$init)
		}
		rap.extend(true, selfModule, arg[i])
	}
	selfModule.$init = function () {
		for (var i = 0; i < initGroup.length; i++)
			initGroup[i].apply(this, arguments);
	};
	var result = function (config) {
		this.$ready = [];
		this.$init(config);
		if (this.filter)this.filter(config);
		for (var i = 0; i < this.$ready.length; i++)
			this.$ready[i].call(this);
	};
	result.prototype = selfModule;
	selfModule = arg = null;
	return result;
};
