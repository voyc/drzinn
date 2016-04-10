create schema secure;
grant usage on schema secure to webuser64;

create table secure.user (
	id serial primary key,
	username varchar(100) not null,
	email varchar(100) not null,
	hashpassword varchar(255) not null,
	auth integer not null default 0,
	access integer not null default 1,
	tmregister timestamp with time zone not null default now(),
	tmverify timestamp with time zone
);
create unique index ndx_username on secure.user (username);
create unique index ndx_email on secure.user (email);
grant select,insert,update,delete on secure.user to webuser64;
grant select,update on secure.user_id_seq to webuser64;

create table secure.token (
	id serial primary key,
	reason char(2) not null default '',
	userid integer not null default 0,
	token varchar(64),
	tmcreate timestamp with time zone not null default now(),
	tmexpire timestamp with time zone,
	ipcreate varchar(39) not null default '0.0.0.0',
	agentcreate varchar(255),
	hashtic varchar(100)
);
create unique index ndx_token on secure.token (token);
grant select,insert,update,delete on secure.token to webuser64;
grant select,update on secure.token_id_seq to webuser64;

create table secure.attempt (
	id serial primary key,
	locus char(2) not null default '',
	userid integer not null default 0,
	tm timestamp with time zone not null default now(),
	ip varchar(39) not null default '0.0.0.0',
	agent varchar(255)
);
grant select,insert,update,delete on secure.attempt to webuser64;
grant select,update on secure.attempt_id_seq to webuser64;
