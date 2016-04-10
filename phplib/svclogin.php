<?php
function doLogin() { // login with username/email/password
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_both = isset($_POST['both']) ? $_POST['both'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;
	$taint_rmrq = isset($_POST['rmrq']) ? $_POST['rmrq'] : 0;
	
	// validated inputs
	$both = validateBoth($taint_both);
	$pword = validatePword($taint_pword);
	$rmrq = validateBool($taint_rmrq);

	// three required parameters
	if (!$rmrq || !$both || !$pword) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// connect to db
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// query user table
	$name = 'login_with_email';
	$sql = "select id, username, email, hashpassword, auth, access";
	$sql .= " from secure.user";
	$sql .= " where email = $1 or username = $1";
	$params = array($both);
	$result = execSql($conn, $name, $sql, $params, false); 
	
	// check result count == 1
	$numrows = pg_num_rows($result);
	if ($numrows > 1) {
		Log::write(LOG_ERR, "$name returned multiple records");
		return $a;
	}
	if ($numrows < 1) {
		Log::write(LOG_NOTICE, "$name attempt, email/username not found");
		$a['status'] = 'email-not-found';
		return $a;
	}

	// get the data
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$username = $row['username'];
	$email = $row['email'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];
	$access = $row['access'];

	// validate password
	$boo = verifyPassword($pword, $dbpw);
	if (!$boo) {
		recordFailedAttempt($conn, $id, DB::$locus_login_by_password);
		$a['status'] = 'email-password-no-match';
		return $a;
	}

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "non-verified user has logged in");
	}

	// write a new session id token
	$st = writeToken($conn, $id, DB::$reason_session_id, 0);
	if (!$st) {
		return $a;
	}

	// if requested, create a new rm cookie
	if ($rmrq == 't' && isUserVerified($auth)) {
		$rm = writeToken($conn, $id, DB::$reason_rememberme_cookie, 0);
		if (!$rm) {
			return $a;
		}
		$a['rm'] = $rm;
	}

	// success
	$a['status'] = 'ok';
	$a['username'] = $username;
	$a['email'] = obscureEmail($email);
	$a['auth'] = $auth;
	$a['access'] = $access;
	$a['st'] = $st;
	return $a;
}

function doRelogin() {  // login with rememberme cookie
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_rm = isset($_POST['rm']) ? $_POST['rm'] : 0;
	
	// validated inputs
	$rm = validateToken($taint_rm);

	// required
	if (!$rm) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// connect to db
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// query user table
	$result = getUserByToken($conn, $rm, DB::$reason_rememberme_cookie);
	if (!$result) {
		return $a;
	}

	// get the data
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$username = $row['username'];
	$email = $row['email'];
	$auth = $row['auth'];
	$access = $row['access'];
	$dbtoken = $row['token'];

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "non-verified user has logged in");
	} 

	// create a new rm cookie
	$rm = writeToken($conn, $id, DB::$reason_rememberme_cookie, 0);
	if (!$rm) {
		return $a;
	}

	// write a new session id token
	$st = writeToken($conn, $id, DB::$reason_session_id, 0);
	if (!$st) {
		return $a;
	}
	
	// success
	$a['status'] = 'ok';
	$a['username'] = $username;
	$a['email'] = obscureEmail($email);
	$a['auth'] = $auth;
	$a['access'] = $access;
	$a['st'] = $st;
	$a['rm'] = $rm;
	return $a;
}

function doLogout() {
	$a = array(
	    'status' => 'system-error'
	);
	
	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	
	// validated inputs
	$st = validateToken($taint_st);
	
	// validate parameter set	
	if (!$st) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}
	
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}
	
	$boo = expireToken($conn, $st);
	if ($boo) {
		$a['status'] = 'ok';
	}
	return $a;
}

function recordFailedAttempt($conn, $id, $locus) {
	$name = 'insert-attempt';
	$sql = "insert into secure.attempt ( locus, userid, ip, agent) values ($1, $2, $3, $4)";
	$params = array('pw', $id, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return false;
	}
	return true;
}
?>
