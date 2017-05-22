/* 
This SQL is designed for postgres.

After creating this schema, execute the GRANT statements found in the comments section of the config.php file.
*/

drop schema drzinn cascade;
create schema drzinn;

create table drzinn.answer (
	id serial primary key,
	userid integer not null default 0,
	testcode char(3) not null default 'xxx',
	answers text
);
create index ndx_answer_usertest on drzinn.answer (userid, testcode);

create table drzinn.score (
	id serial primary key,
	userid integer not null default 0,
	testcode char(3) not null default 'xxx',
	scores text
);
create unique index ndx_score_usertest on drzinn.score (userid, testcode);
