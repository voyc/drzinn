<?php
function login() { // login with username/email/password
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_both = isset($_POST['both']) ? $_POST['both'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;

	// validated inputs
	$both = validateBoth($taint_both);
	$pword = validatePword($taint_pword);

	// two required parameters
	if (!$both || !$pword) {
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
	$sql .= " from account.user";
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
		Log::write(LOG_NOTICE, "$name user not found");
		recordFailedAttempt($conn, 0, DB::$reason_user_not_found);
		$a['status'] = 'login-failed';
		return $a;
	}

	// get the data
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$uname = $row['username'];
	$email = $row['email'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];
	$access = $row['access'];

	// validate password
	$boo = verifyPassword($pword, $dbpw);
	if (!$boo) {
		Log::write(LOG_NOTICE, "password no match");
		recordFailedAttempt($conn, $id, DB::$reason_password_no_match);
		$a['status'] = 'login-failed';
		return $a;
	}

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "non-verified user has logged in");
	}

	// write a new session id token
	$si = writeToken($conn, $id);
	if (!$si) {
		return $a;
	}

	// success
	$a['status'] = 'ok';
	$a['si'] = $si;
	$a['auth'] = $auth;
	$a['access'] = $access;
	$a['uname'] = $uname;
	//$a['email'] = obscureEmail($email);
	return $a;
}

function recordFailedAttempt($conn, $id, $reason) {
	$name = 'insert-attempt';
	$sql = "insert into account.attempt ( reason, userid, ip, agent) values ($1, $2, $3, $4)";
	$params = array($reason, $id, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return false;
	}
	return true;
}
?>
