create table t_code (
	id serial PRIMARY KEY NOT NULL,
	title  varchar(128),
	content text,--内容
  turn serial,--自定义顺序
  createtime timestamp,
  updatetime timestamp,
  status varchar(20) default 'used'--"used"正在使用 "unuse"未使用 "lock"锁住
);