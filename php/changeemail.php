<?php
function changeemail() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_pword = isset($_POST['pword']) ? $_POST['pword'] : 0;
	$taint_email = isset($_POST['email']) ? $_POST['email'] : 0;

	// validate inputs
	$si = validateToken($taint_si);
	$pword = validatePword($taint_pword);
	$email = validateEmail($taint_email);

	// validate parameter set
	if (!$si || !$pword || !$email) {
		Log::write(LOG_WARNING, "attempt with invalid parameter set");
		return $a;
	}

	// get db connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// get logged-in user
	$result = getUserByToken($conn, $si);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$dbpw = $row['hashpassword'];
	$auth = $row['auth'];
	$oldemail = $row['email'];

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

	// validate email is unique
	$name = 'test-unique-email';
	$sql  = "select id from account.user where email = $1 and $id <> $2";
	$params = array($email, $id);
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

	// get TIC
	$publicTic = generateTic();
	$hashTic = hashTic($publicTic);
	
	$auth = DB::$auth_emailpending;

	// update the user record
	$name = 'change-user-email';
	$sql  = "update account.user set newemail = $1, auth=$3, hashtic=$4, tmhashtic=now() where id = $2";
	$params = array($email, $id, $auth, $hashTic);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
	}

	// send TIC to user by email
	$boo = sendAuthenticationEmail($email, $publicTic, 'verifyemail');
	if (!$boo) {
		$a['status'] = 'send-email-failed';
		return $a;
	}

	// success
	$a['status'] = 'ok';
	$a['auth'] = $auth;
	return $a;
}
?>
