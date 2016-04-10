<?php
/*
	two svcs
		1. register - initiated from form (POST)
		2. verify - initiated from link in authentication email (GET)
*/
function doRegister() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_uname = isset($_POST['uname']) ? $_POST['uname'] : 0;
	$taint_email = isset($_POST['email']) ? $_POST['email'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;

	// validate inputs
	$uname = validateUname($taint_uname);
	$email = validateEmail($taint_email);
	$pword = validatePword($taint_pword);

	if (!$email || !$uname || !$pword) {
		Log::write(LOG_WARNING, "attempt with invalid parameter set");
		return $a;
	}

	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// validate username is unique
	$name = 'test-unique-username';
	$sql  = "select id from secure.user where username = $1";
	$params = array($uname);
	$result = execSql($conn, $name, $sql, $params, false);
	if (!$result) {
		return $a;
	}

	$numrows = pg_num_rows($result);
	if ($numrows > 0) {
		Log::write(LOG_NOTICE, "$name: username already on file");
		$a['status'] = 'username-in-use';
		return $a;
	}

	// validate email is unique
	$name = 'test-unique-email';
	$sql  = "select id from secure.user where email = $1";
	$params = array($email);
	$result = execSql($conn, $name, $sql, $params, false);
	if (!$result) {
		return $a;
	}

	$numrows = pg_num_rows($result);
	if ($numrows > 0) {
		Log::write(LOG_NOTICE, "$name: email already on file");
		$a['status'] = 'email-in-use';
		return $a;
	}

	// get the next user id
	$name = 'get-next-user-id';
	$sql = "select nextval('secure.user_id_seq')";
	$params = array();
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['nextval'];

	// hash the password
	$hashedPassword = hashPassword($pword);

	$auth = DB::$auth_registered;

	// write the user record
	$name = 'insert-user';
	$sql  = "insert into secure.user (id, username, email, hashpassword, auth) values ($1, $2, $3, $4, $5)";
	$params = array($id, $uname, $email, $hashedPassword, $auth);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// get TIC 
	$publicCode = generateCode();
	$hashedCode = hashPassword($publicCode);
	
	// send TIC to user by email
	$boo = sendAuthenticationEmail($email, $publicCode, 'verify');
	if (!$boo) {
		$a['status'] = 'send-email-failed';
		return $a;
	}

	// write a session token containing the code
	$st = writeToken($conn, $id, DB::$reason_session_id, $hashedCode);
	if (!$st){
		return $a;
	}

	// success
	$a['status'] = 'ok';
	$a['uname'] = $uname;
	$a['auth'] = $auth;
	$a['st'] = $st;
	return $a;
}

function doVerify() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	$taint_tic = isset($_POST['tic']) ? $_POST['tic'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;

	// validate inputs
	$st = validateToken($taint_st);
	$tic = validateTic($taint_tic);
	$pword = validatePword($taint_pword);

	// validate parameter set
	if (!$st || !$tic || !$pword) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get db connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// read token and user table
	$result = getUserByToken($conn, $st, DB::$reason_session_id);
	if (!$result) {
		return $a;
	}

	// get fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$userid = $row['id'];
	$hashpassword = $row['hashpassword'];
	$auth = $row['auth'];
	$hashtic = $row['hashtic'];

	// check user
	if (isUserVerified($auth)) {
	 	Log::write(LOG_NOTICE, 'attempt on already verified user');
		return $a;
	}

	// verify the tic from the email
	$boo = verifyPassword($tic, $hashtic);
	if (!$boo) {
		Log::write(LOG_NOTICE, 'attempt with invalid tic');
		return $a;
	}

	// verify the password
	$boo = verifyPassword($pword, $hashpassword);
	if (!$boo) {
		Log::write(LOG_NOTICE, 'attempt with invalid password');
		return $a;
	}

	// set user record to active
	$auth = DB::$auth_verified;
	$name = 'verify-registration';
	$sql = "update secure.user set auth = $1, tmverify = now() where id = $2";
	$params = array($auth, $userid);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return false;
	}
	
	// success
	$a['status'] = 'ok';
	$a['auth'] = $auth;
	return $a;
}
?>
