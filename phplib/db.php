<?php
/**
	database functions
**/

// global variable: stack of prepared statements
$stmts = array();

// Establish a connection to database
function getConnection() {
	$conn = @pg_connect("port=".Config::$dbport." dbname=".Config::$dbname." user=".Config::$dbuser." password=".Config::$dbpassword);
	if (!$conn) {
		Log::write(LOG_CRIT, 'failed connect to database');
		return false;
	}
	return $conn;
}

// prepare and execute a sql statement
function execSql($conn, $name, $sql, $params, $test1) {
	global $stmts;
	
	// prepare the statement if it has not already been prepared
	if (!isset($stmts[$name])) {
		$result = @pg_prepare($conn, $name, $sql);
		if (!$result) {
			Log::write(LOG_ERR, "$name prepare error: ".pg_last_error($conn));
			return false;
		}
		$stmts[$name] = 1;
	}
	
	$result = @pg_execute($conn, $name, $params);
	if (!$result) {
		Log::write(LOG_ERR, "$name execute error: ".pg_last_error($conn));
		return false;
	}

	if ($test1) {
		$sqltype = substr($sql,0,6);
		$numrows = ($sqltype == 'select') ? pg_num_rows($result) : pg_affected_rows($result);
		if ($numrows > 1) {
			Log::write(LOG_WARNING, "$name multiple matching records");
			return false;
		}
		if ($numrows < 1) {
			Log::write(LOG_NOTICE, "$name record not found");
			return false;
		}
	}
	return $result;
}

function getUserByToken($conn, $token, $reason) {

	// get non-public version of the token
	$dbtoken = decryptToken($token);

	$expiration = Config::$ua_token_expiration;

	// read user,token
	$name = 'query-user-by-token';
	$sql = "select u.id, u.auth, u.access, u.hashpassword, u.username, u.email, t.tmexpire is not null as used,";
	$sql .= " age(now(), t.tmcreate) > $3 * '1 hour'::interval as expired, t.hashtic";
	$sql .= " from accounts.user u, accounts.token t";
	$sql .= " where t.token = $1 and t.reason = $2 and t.userid = u.id";
	$params = array($dbtoken, $reason, $expiration);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		Log::write(LOG_NOTICE, "$name token not found");
		return false;
	}

	// fetch fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$used = $row['used'];
	$expired = $row['expired'];

	// check token
	if ($used == 't') {
		Log::write(LOG_NOTICE, "$name token already used");
		return false;
	}
	if ($expired == 't') {
		Log::write(LOG_NOTICE, "$name token expired");
		return false;
	}

	// expire token
	if ($reason != DB::$reason_session_id) {
		$boo = expireToken($conn, $token);
		if (!$boo) {
			return false;
		}
	}

	return $result;
}

function getUserByBoth($conn, $both) {
	$name = 'query-user';
	$sql = "select id, auth, access, hashpassword, username, email";
	$sql .= " from accounts.user";
	$sql .= " where username = $1 or email = $1";
	$params = array($both);
	$result = execSql($conn, $name, $sql, $params, true); 
	if (!$result) {
		return false;
	}
	return $result;
}

function sendAuthenticationEmail($email, $code, $svc) {
	$to = $email;
	$subject = Str::get("$svc-subject", array(Config::$appname));
	$message = Str::get("$svc-message", array(Config::$appname, Config::$appnameLong, $code));
	$additional_headers = null; //"From: ".Config::$email_from."\r\n";
	$additional_parameters = null;

	$boo = mail( $to, $subject, $message, $additional_headers, $additional_parameters);
	if (!$boo) {
		Log::write(LOG_NOTICE, 'send authentication email failed');
	}
	return $boo;
}

function writeToken($conn, $uid, $reason, $hashtic) {
	// get a unique key and encrypt it
	$dbToken = generateToken();
	$publicToken = encryptToken($dbToken);

	// insert a token record
	$name = 'insert-token';
	$sql = "insert into accounts.token (reason, userid, token, ipcreate, agentcreate, hashtic) values ($1, $2, $3, $4, $5, $6)";
	$params = array($reason, $uid, $dbToken, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $hashtic);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		Log::write(LOG_ERR, "$name $reason, failed. ".pg_last_error($conn));
		false;
	}
	return $publicToken;
}
function expireToken($conn, $publicToken) {
	// decrypt input public token
	$dbtoken = decryptToken($publicToken);

	// set token record to expired
	$name = 'expire-token';
	$sql = "update accounts.token set tmexpire = now() where token = $1";
	$params = array($dbtoken);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return false;
	}
	return true;
}

function obscureEmail($email) {
	$a = explode('@', $email);
	$b = explode('.', $email);
	$name = $a[0];
	$top = $b[count($b)-1];
	$s = substr($name, 0, 1) . '*****@' . substr($email, strlen($name)+1, 1) . '****.' . $top;
	return $s;
}

class DB {
	static public $auth_anonymous = 0;
	static public $auth_registered = 1;
	static public $auth_resetpending = 2;
	static public $auth_verified = 7;

	static public $access_none = 0;
	static public $access_student = 1;
	static public $access_teacher = 100;
	static public $access_admin = 255;
    
	static public $reason_session_id = 'si';
	static public $reason_rememberme_cookie = 'rc';

	static public $locus_login_by_password = 'lp';
	static public $locus_login_by_rememberme = 'lr';
}
?>
