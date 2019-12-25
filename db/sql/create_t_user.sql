create table t_user (
	id serial PRIMARY KEY NOT NULL,
	cardid varchar(20),--//身份证号
  realname varchar(64),
  nickname varchar(64),
  email varchar(128),
  userType varchar(64),--sys系统管理员，admin网站管理员，normal普通用户
  age smallint,
  brithday timestamp,
  picture varchar(128),
  address varchar(512),
  mobile varchar(20),
  qq varchar(64),
  sex smallint,--//0男1女2其他
 turn serial,--自定义顺序
  password varchar(256),--未加密的密码
  passwordMd5 varchar(256),--加密的密码
  logintime timestamp,
  createtime timestamp,
  updatetime timestamp,
  status varchar(20) default 'used'--"used"正在使用 "unuse"未使用 "lock"锁住
);