var pg = require("pg");
require("./rap.sql.js");

exports = module.exports = {
	/*
	 *连接串在config中配置
	 * 连接数据库
	 * */
	_connect: function () {
		return new Promise(function (resolve, reject) {
			var connectStr = rap.connectionString;
			rap.info("connect postgres", connectStr);
			pg.connect(connectStr, function (err, client, done) {
				if (err) {
					rap.error("connect postgres error", err&&err.message||err);
					reject(err);
				} else {
					rap.info("connect postgres success", client);
					resolve({client: client, done: done});
				}
			});
		});
	},
	/*
	 *select 查询
	 * */
	select: function (next,opts, params) {

		rap.info("select api createSql：", opts);

		var sqlObj = new rap.SQL(opts).getSelectOptions();

		if (!sqlObj.selectSql) {
			throw Error("cant find select sql");
		}
		return this.query(sqlObj.selectSql, params).then(function (queryResult) {

			rap.info("查询到数据：", queryResult.rows);

			next(queryResult.rows);

		});

	},
	/*插入数据*/
	insert:function (next,opts,params) {
		rap.info("insert api by option：", opts);
		//没有插入的数据
		if(!params){
			return next({code:501,message:"insert fail by no params"});
		}
		opts.insertOptions = params;

		var sqlObj = new rap.SQL(opts).getInsertOptions();

		if (!sqlObj.insertSql) {
			throw Error("cant find insert sql");
		}
		rap.info("insert sql:",sqlObj.insertSql);
		return this.query(sqlObj.insertSql).then(function (queryResult) {

			rap.info(sqlObj.name,"insert succees");

			next({ret:"200",message:"insert success"});

		});
	},
	/*
	 *查询
	 * */
	query: function (sql, params, callback) {
		if (typeof params == 'function') {
			callback = params;
			params = [];
		}
		if (!params) {
			params = [];
		}

		//是否打印SQL语句
		if (rap.sqldebug) {
			rap.log('[SQL:]', sql, '[:SQL]');
			rap.log('[PARAMS:]', params, '[:PARAMS]');
		}

		return this._connect()
			.then(function (connectResult) {
				var client = connectResult.client;
				var done = connectResult.done;
				return new Promise(function (resolve, reject) {
					client.query(sql, params, function (err, queryResult) {
						done();
						if (err) {
							reject(err);
						} else {
							if (typeof queryResult != "object") {
								resolve({rows: []});
							} else {
								resolve(queryResult);
							}
						}
					})
				});
			})
			.then(callback);
	}
};
