<?php
function doChangePassword() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;
	$taint_pnew = isset($_POST['pnew']) ? $_POST['pnew'] : 0;

	// validate inputs
	$st = validateToken($taint_st);
	$pword = validatePword($taint_pword);
	$pnew = validatePword($taint_pnew);

	if (!$st || !$pword || !$pnew) {
		Log::write(LOG_WARNING, "attempt with invalid parameter set");
		return $a;
	}

	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// get logged-in user
	$result = getUserByToken($conn, $st, DB::$reason_session_id);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "attempt on non-verified user");
		return $a;
	}

	// verify password
	$boo = verifyPassword($pword, $dbpw);
	if (!$boo) {
		Log::write(LOG_NOTICE, "attempt with bad password");
		return $a;
	}

	// hash the new password
	$hashedPassword = hashPassword($pnew);

	// update the user record
	$name = 'change-user-password';
	$sql  = "update secure.user set hashpassword = $1 where id = $2";
	$params = array($hashedPassword, $id);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// success
	$a['status'] = 'ok';
	return $a;
}

function doChangeUsername() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;
	$taint_uname = isset($_POST['uname']) ? $_POST['uname'] : 0;

	// validate inputs
	$st = validateToken($taint_st);
	$pword = validatePword($taint_pword);
	$uname = validateUname($taint_uname);

	// validate parameter set
	if (!$st || !$pword || !$uname) {
		Log::write(LOG_WARNING, "attempt with invalid parameter set.");
		return $a;
	}

	// get db connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// get logged-in user
	$result = getUserByToken($conn, $st, DB::$reason_session_id);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "attempt by non-verified user");
		return $a;
	}

	// verify password
	$boo = verifyPassword($pword, $dbpw);
	if (!$boo) {
		Log::write(LOG_NOTICE, "attempt with bad password");
		return $a;
	}

	// update the user record
	$name = 'change-user-username';
	$sql  = "update secure.user set username = $1 where id = $2";
	$params = array($uname, $id);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// success
	$a['status'] = 'ok';
	return $a;
}

function doChangeEmail() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;
	$taint_email = isset($_POST['email']) ? $_POST['email'] : 0;

	// validate inputs
	$st = validateToken($taint_st);
	$pword = validatePword($taint_pword);
	$email = validateEmail($taint_email);

	// validate parameter set
	if (!$st || !$pword || !$email) {
		Log::write(LOG_WARNING, "attempt with invalid parameter set");
		return $a;
	}

	// get db connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// get logged-in user
	$result = getUserByToken($conn, $st, DB::$reason_session_id);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];

	// verify good user
	if (!isUserVerified($auth)) {
		Log::write(LOG_NOTICE, "attempt by non-verified user");
		return $a;
	}

	// verify password
	$boo = verifyPassword($pword, $dbpw);
	if (!$boo) {
		Log::write(LOG_NOTICE, "attempt with bad password");
		return $a;
	}

	// update the user record
	$name = 'change-user-email';
	$sql  = "update secure.user set email = $1 where id = $2";
	$params = array($email, $id);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// success
	$a['status'] = 'ok';
	return $a;
}
?>
