<?php
/*
	svc verify
	Verify a newly registered user.
*/
function verify() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_tic = isset($_POST['tic']) ? $_POST['tic'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;

	// validate inputs
	$si = validateToken($taint_si);
	$tic = validateTic($taint_tic);
	$pword = validatePword($taint_pword);

	// validate parameter set
	if (!$si || !$tic || !$pword) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get db connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// read token and user table
	$result = getUserByToken($conn, $si);
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
	$boo = verifyTic($tic, $hashtic);
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
	$sql = "update account.user set auth = $1, tmverify = now() where id = $2";
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
