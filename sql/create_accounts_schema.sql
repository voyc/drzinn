/* 
This SQL is designed for postgres.

After creating this schema, execute the GRANT statements found in the comments section of the config.php file.
*/

create schema accounts;

create table accounts.user (
	id serial primary key,
	username varchar(100) not null,
	email varchar(100) not null,
	hashpassword varchar(255) not null,
	auth integer not null default 0,
	access integer not null default 1,
	tmregister timestamp with time zone not null default now(),
	tmverify timestamp with time zone
);
create unique index ndx_username on accounts.user (username);
create unique index ndx_email on accounts.user (email);

create table accounts.token (
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
create unique index ndx_token on accounts.token (token);

create table accounts.attempt (
	id serial primary key,
	locus char(2) not null default '',
	userid integer not null default 0,
	tm timestamp with time zone not null default now(),
	ip varchar(39) not null default '0.0.0.0',
	agent varchar(255)
);
