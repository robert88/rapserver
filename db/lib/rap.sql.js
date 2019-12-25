require("./rap.sql.cache.js");
require("../rap.util.tool.js");

/*
* selectname:查询表
* selectResult：返回的字段
* selectOrder：
* selectCondition
* selectsql:查询语句
* */
/*
 *
 * 查询条件
 * */
var ConditionTool = {
	parseCondition: function () {
		this.selectCondition = rap.proxyHander.call(this,
			this.config.condition,
			function (condition) {
				return this._mergeCKey(condition);
			}, function () {
				return this._selectCondition.join(" and ")
			}
		)
	},
	_parseCKeyByObject: function (mergeType,  leftKey,rightObject) {
		if (rightObject.right != null) {
			return this._parseCKeyString(mergeType, leftKey, rightObject.right, rightObject.exec)
		} else {
			rap.log("this condition item: ", key, "is object; but exec can not find")
			return ""
		}
	},
	_parseCKeyString: function (mergeType, leftKey, rightKey, exec) {
		var $rightKey = this.to$Key(rightKey)[0];
		if(this.database[$rightKey]){
			return "{0} {1} {2} {3} ".tpl(mergeType, this.toTidKey(leftKey)[0], exec || "=", this.toTidKey($rightKey)[0])
		}else if(this.database[leftKey].type=="int"){
			return "{0} {1} {2} {3} ".tpl(mergeType, this.toTidKey(leftKey)[0], exec || "=", rightKey*1)
		}else{
			return "{0} {1} {2} '{3}' ".tpl(mergeType, this.toTidKey(leftKey)[0], exec || "=", rightKey.replace(/'/g,""))
		}

	},
	_parseCKey: function (mergeType, leftKey, rightKey) {
		if (rap.isUnEmptyObject(rightKey)) {
			return this._parseCKeyByObject(mergeType, leftKey, rightKey)
		} else {
			return this._parseCKeyString(mergeType, leftKey, rightKey)
		}
	},
	_mergeCKey: function (condition) {
		var defaultType = condition.defaultType || "and"
		var ret = [];
		var i = 0;
		var type = "";
		for (var key in condition) {
			if (key == "defaultType") {
				continue;
			}
			var $key = this.to$Key(key)[0];
			if (i == 0) {
				i++
			} else {
				type = (condition[key] && condition[key].type) || defaultType
			}
			if (this.database[$key]) {
				ret.push(this._parseCKey(type, $key, condition[key]));
			} else {
				rap.warn("[nameID:", this.nameID, "]", "condition:{" + key + ":" + condition[key] + ",} is not valid!")
			}
		}
		return ret.join(" ");
	}
};
/*
 *
 * 设置config和nameID相关操作
 * */
var SettingsTool = {
	uid: 0,
	$init: function (config) {
		this.config = rap.extend(true, {}, config);
		this.initNameID();
		this.name = this.config.name;
	},
	getTid: function () {
		return "t" + (SettingsTool.uid++);
	},
	initNameID: function () {
		if (this.nameID == null) {
			this.nameID = this.getTid();
		}
	},
	getNameID: function (idx) {
		var tables = this.config.tables;
		if (tables) {
			if (this.cells[idx]) {
				return this.cells[idx].nameID
			} else {
				rap.error("can not find tables by index is", idx);
				return "";
			}
		} else {
			return this.nameID
		}
	}
};
/*
 *
 * 返回字段
 * */
var ResultTool = {
	parseResult: function () {
		this.selectResult = rap.proxyHander.call(this,
			this.config.result,
			function (result) {
				return this._mergeRKey(result);
			}, function () {
				return this.returnDatabase()
			}
		)
	},
	_parseRKey: function ($key, retKey) {
		if (!retKey) {
			rap.warn("[nameID:", this.nameID, "] baseKey", $key, "==false")
			return ""
		}
		if (!/\s*\$\d+\.\S+\s*/.test($key)) {
			rap.error("[nameID:", this.nameID, "] baseKey", $key, "==false")
			return ""
		}
		var tablesIndex;
		var baseKey;
		$key.replace(/\s*\$(\d+)\..*/, function (m, m1) {
			tablesIndex = m1 * 1
		});
		$key.replace(/\s*\$\d+\.(\S+)\s*/, function (m, m1) {
			baseKey = m1
		});
		var nameID = this.getNameID(tablesIndex);
		if (typeof retKey != "string") {
			retKey = baseKey
		}
		return "{0}.{1} as {2}".tpl(nameID, baseKey, retKey)
	},
	_parseRFuncKey: function (retKey, funcKey) {
		var params = this.toTidKey(funcKey);
		var func = this.getFuncName(funcKey)
		return "{0}({1}) as {2}".tpl(func, params, retKey)
	},
	_mergeRKey: function (result) {
		var ret = [];
		for (var key in result) {
			var $key = this.to$Key(key)[0];
			var value = result[key];
			//数据表中是否存在
			if (this.database[$key]) {
				//database是函数
				if(this.database[$key].value && ~this.database[$key].value.indexOf("(") ){
					ret.push(this._parseRFuncKey(key, this.database[$key]));
				}else{
					ret.push(this._parseRKey($key, value));
				}

			//是否是函数
			} else if (typeof value == "string" && ~value.indexOf("(")) {
				ret.push(this._parseRFuncKey(key, value));
			} else {
				rap.warn("[nameID:", this.nameID, "]", "result:{" + key + ":" + value + ",} is not valid!")
			}
		}
		return ret.join(",")
	}
};

/*
 *
 * 排序条件
 * */
var OrderTool = {
	parseOrder:function () {
		this.selectOrder = rap.proxyHander.call(this,
			this.config.order,
			function (order) {
				return this._mergeOKey(order);
			}
		)
	},
	_mergeOKey:function (order) {
		var ret = [];
		for(var key in order){
			var $key = this.to$Key(key)[0];
			if(this.database[$key]){
				ret.push(this._parseOKey($key,order[key]))
			}else{
				rap.warn("[nameID:", this.nameID, "]", "order:{" + key + ":" + order[key] + ",} is not valid!")
			}
		}
		return ret.join(",")
	},
	_parseOKey:function ($key,value) {
		if(value=="asc" || value=="desc"){
			return this.toTidKey($key)+" "+value;
		}else if(value){
			return this.toTidKey($key)+" asc";
		}else{
			return this.toTidKey($key)+" desc";
		}
	}
};

/*
 *
 * 排序条件
 * */
var insertTool = {
	getInsertOptions:function () {

		if (this.name&&rap.sql.cache[this.name]) {
			if(this.config.insertOptions){
				this.getInsertDataName();
				this.getInsertDataValue();
				if(this.hasInsertData){
					this.insertSql = "insert into {0}({1}) values({2})".tpl(this.name,this.insertDataName.join(","),this.insertDataValue.join(","));
				}else{
					rap.log(this.name +" insert fail by the insetOptions is empty");
				}

			}else{
				rap.log(this.name + " insert fail by can not find insetOptions");
			}

		}else{
			rap.error("insert fail by not find table");
		}

		return this;
	},
	getInsertDataName:function () {
		this.insertDataName = [];
		for(var key in this.config.insertOptions){
			if(rap.sql.cache[this.name][key]){
				this.hasInsertData = true;
				this.insertDataName.push(key);
			}else{
				rap.warn("insert options of '{0}' key is not in table {1}".tpl(key,this.name))
			}
		}
	},
	getInsertDataValue:function () {
		this.insertDataValue = [];
		var cacheTable = rap.sql.cache[this.name];
		for(var i=0;i<this.insertDataName.length;i++){
			var key = this.insertDataName[i];
			var value = this.config.insertOptions[key];
			switch (cacheTable[key].type){
				case "varchar":
				case "text":
					this.insertDataValue.push("'{0}'".tpl(value.replace(/('|")/g,"\\$1")));
					break;
				case "smallint":
				case "serial":
					this.insertDataValue.push("{0}".tpl(value.toString().toInt()));
					break;
				case "timestamp":
					this.insertDataValue.push("{0}".tpl(value.toDate().format("yy/MM/dd hh:mm:ss")));
					break;
				default:
					this.insertDataValue.push("");
			}
		}
	}
};
/**
 *基础表相关方法
 */
rap.registerModule({
	moduleName: "Table",
	$init:function () {
		this.selectResult= "";
		this.selectCondition= "";
		this.selectOrder="";
		this.selectSql = "";
		this.cells=[];
		this._selectResult=[];
		this._selectCondition=[];
		this._selectOrder=[];
		this.database={};
	},
	getTableOptions:function () {
		this.setJoinType();
		this.initDatabase();
		this.parseResult();
		this.parseCondition();
		this.parseOrder();
		this.toSql();
	},
	setJoinType: function () {
		this.joinType = this.config.joinType || ","
	},
	getParamStr: function (key) {
		key = key.replace(/\w+\s*\(([^)]+)\)\s*/g, function (m, m1) {
			return m1;
		})
		return key
	},
	toTidKey: function (key) {
		var keys = [];
		var that = this;
		key = this.getParamStr(key);
		key.replace(/[\w.$]+/g, function (m) {
			var idx = 0;
			if (/\s*\$(\d+)\.\S+\s*/.test(m)) {
				idx = RegExp["$1"] * 1
			}
			m = m.replace(/[\w$]+\.([\w$]+)/g, function (t, t1) {
				return t1;
			})
			keys.push("{0}.{1}".tpl(that.getNameID(idx), m))
		});
		return keys
	},
	to$Key: function (key) {
		var keys = [];
		key = this.getParamStr(key);
		key.replace(/[\w\.\$]+/g, function (m) {
			if (m.indexOf(".") == -1) {
				m = "$0." + m
			}
			keys.push(m)
		})
		return keys;
	},
	toKey: function (key) {
		var keys = [];
		key.replace(/[\w.$]+/g, function (m) {
			m = m.replace(/[\w$]+\.([\w$]+)/g, function (t, t1) {
				return t1;
			})
			keys.push(m)
		});
		if (keys.lenght > 1) {
			rap.log("param key must single key")
		}
		return keys;
	},
	getFuncName: function (key) {
		return key.replace(/(\w+)\s*\(([^)]+)\)\s*/g, "$1");
	},
	returnDatabase: function () {
		var ret = [];
		for (var key in this.database) {
			if( this.database[key].value && ~this.database[key].value.indexOf("(") ){
				ret.push("{0} as {1}".tpl(this.database[key].value, this.toKey(key)[0]))
			}else{
				ret.push("{0} as {1}".tpl(this.toTidKey(key)[0], this.toKey(key)[0]))
			}

		}
		return ret.join(",")
	},
	initDatabase: function () {
		rap.log("no database")
	},
	toSql: function () {
		if (!this.selectName || !this.selectResult) {
			this.selectSql = "";
		} else {
			this.selectSql = "select {0} from {1} {2} {3}".tpl(this.selectResult, this.selectName,
				(this.selectCondition ? (" where " + this.selectCondition) : ""),
				(this.selectOrder ? (" order by " + this.selectOrder) : "")
			)
		}
	}

},  ConditionTool, OrderTool,insertTool,ResultTool,SettingsTool );
/**
 * 复合表的相关操作
 */
rap.registerModule({
	moduleName: "ComplexTable",
	getSelectOptions:function () {
		this.getTableOptions();
		this._parseCells();
		this.setWrapName();
		return this;
	},
	setWrapName: function () {
		this.wrapName = "(" + this.selectSql + ") " + this.nameID;
	},
	initDatabase: function () {
		if (this._selectResult.length != this.config.tables.length) {
			rap.error("_selectResult 的长度必须和table保持一致");
			return ""
		}
		for (var j = 0; j < this._selectResult.length; j++) {
			var arr = this._selectResult[j].split(",");
			for (var i = 0; i < arr.length; i++) {
				if (!(arr[i] = arr[i].trim())) {
					continue
				}
				var t = arr[i].split(/\bas\b/);
				var key = t && t[1];
				if (key) {
					key = key.trim();
					//保存函数,通过database.value=来传递函数
					if(~t[0].indexOf("(")){
						this.database["$" + j + "." + key] = {value:t[0],type:"any",nameID:this.getNameID(j)};
					}else{
						this.database["$" + j + "." + key] = {nameID:this.getNameID(j)};
					}

				} else {
					rap.error(".initDatabase:subTable selectResult must format:key as value")
				}
			}
		}
	},
	_parseCells: function () {
		var selectNameTpl = [];
		this.cells = [];
		for (var i = 0; i < this.config.tables.length; i++) {
			var itemConfig = this.config.tables[i];
			var itemTable = new SQL(itemConfig);
			this.cells[i] = itemTable;
			var joinType = itemTable.joinType;
			if (itemTable.wrapName) {
				if (selectNameTpl.length == 0) {
					selectNameTpl.push(itemTable.wrapName)
				}else {
					selectNameTpl.push(joinType, itemTable.wrapName)
				}
			}
			this._selectResult.push(itemTable.selectResult);
			itemTable.selectCondition&&this._selectCondition.push(itemTable.selectCondition);
			itemTable.selectOrder&&this._selectOrder.push(itemTable.selectOrder);

		}
		this.selectName = selectNameTpl.join(" ")
	}
}, rap.module.Table);
/**
 * 单表相关操作
 */
rap.registerModule({
	moduleName: "SingleTable",
	$init: function () {
		if (this.name&&rap.sql.cache[this.name]) {
			this.wrapName = this.name + " " + this.nameID;
			this.selectName = this.wrapName;
		}
	},
	getSelectOptions:function () {
		this.getTableOptions();
		return this;
	},
	initDatabase: function () {
		if (this.name&&rap.sql.cache[this.name]) {
			for (var key in rap.sql.cache[this.name]) {
				this.database["$0." + key ] = rap.sql.cache[this.name];
			}
			return ""
		} else {
			rap.error(".tableID:", this.nameID, " cant find table in cache:", this.name)
		}
	},
}, rap.module.Table);

/**
 * SQL对象
 * config:{
 * insertOptions:[{key1:value1,key2:value2}]定义插入数据
 * name:t_user表名
 * result：{key:ture,key:function,key:"otherKey"}//返回类型
 * condition：{}
 * order：{key：true倒序排序，key1:false 正序排序}
 * }
 */
var SQL = rap.SQL = function(config) {
	var ret;
	if (config.tables) {
		ret =  new rap.module.ComplexTable(config);
		rap.log("当前表id为：",ret.nameID,"名称：",ret.name,"是复合表");
		return ret;
	} else {
		ret =  new rap.module.SingleTable(config);
		rap.log("当前表id为：",ret.nameID,"名称：",ret.name,"是单表");
		return ret;
	}
}