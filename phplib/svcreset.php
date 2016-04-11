<?php
/*
	reset password
	two svc's: 
		forgot - initiated from form (POST), user enters both
		reset - first-time initiated from email link (GET) with code
			- second-time, initiated from form (POST), user enters new password, along with hidden code
*/
function doForgot() {
	$a = array(
		'status' => 'system-error'
	);
	
	// raw inputs
	$taint_both = isset($_POST['both']) ? $_POST['both'] : 0;

	// validate inputs
	$both = validateBoth($taint_both);

	// validate parameter set
	if (!$both){
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get database connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}
	
	// read user
	$result = getUserByBoth($conn, $both);
	if (!$result) {
		return $a;
	}
	
	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$access = $row['access'];
	$auth = $row['auth'];
	$email = $row['email'];
	$username = $row['username'];

	// get TIC 
	$publicCode = generateCode();
	$hashedCode = hashPassword($publicCode);

	// send TIC to user by email
	$boo = sendAuthenticationEmail($email, $publicCode, 'reset');
	if (!$boo) {
		$a['status'] = 'send-email-failed';
		return $a;
	}

	// update auth in user record
	$name = 'change-user-auth';
	$sql = "update accounts.user set auth = $1 where id = $2";
	$auth = DB::$auth_resetpending;
	$params = array($auth, $id);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// write a session token containing the code
	$st = writeToken($conn, $id, DB::$reason_session_id, $hashedCode);
	if (!$st){
		return $a;
	}
	
	// success
	$a['status'] = 'ok';
	$a['st'] = $st;
	$a['auth'] = $auth;
	$a['access'] = $access;
	$a['username'] = $username;
	return $a;
}

function doReset() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;
	$taint_tic = isset($_POST['tic']) ? $_POST['tic'] : 0;
	$taint_pnew = isset($_POST['pnew']) ? $_POST['pnew'] : 0;

	// validate inputs
	$st = validateToken($taint_st);
	$tic = validateTic($taint_tic);
	$pnew = validatePword($taint_pnew);

	// validate parameter set
	if (!$st || !$pnew || !$tic) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get database connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}
	
	// read user and token table
	$result = getUserByToken($conn, $st, DB::$reason_session_id);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$hashtic = $row['hashtic'];
	$auth = $row['auth'];

	// verify user
	if (isUserVerified($auth)) {
		Log::write(LOG_NOTICE, 'attempt on already-verified user');
		$a['status'] = 'reset-fail';
		return $a;
	}

	// verify the tic from the email
	$boo = verifyPassword($tic, $hashtic);
	if (!$boo) {
		Log::write(LOG_NOTICE, 'attempt with invalid tic');
		$a['status'] = 'reset-fail';
		return $a;
	}

	// hash the new password
	$hashpnew = hashPassword($pnew);

	// store the new hashed password and set user to verified
	$name = 'reset-password-update';
	$sql = "update accounts.user set auth = $1, hashpassword = $3 where id = $2";
	$auth = DB::$auth_verified;
	$params = array($auth, $id, $hashpnew);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// success
	$a['status'] = 'ok';
	$a['auth'] = $auth;
	return $a;
}
?>
