<?php
/*
	svc forgotpassword
	User forgot his password, requests reset.
*/
function forgotpassword() {
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
	$publicTic = generateTic();
	$hashTic = hashTic($publicTic);

	// send TIC to user by email
	$boo = sendAuthenticationEmail($email, $publicTic, 'reset');
	if (!$boo) {
		$a['status'] = 'send-email-failed';
		return $a;
	}

	// update auth and hashtic in user record
	$name = 'change-user-auth';
	$sql = "update account.user set auth = $1, hashtic=$3 where id = $2";
	$auth = DB::$auth_resetpending;
	$params = array($auth, $id, $hashTic);
	$result = execSql($conn, $name, $sql, $params, true);
	if (!$result) {
		return $a;
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
	$a['uname'] = $username;
	return $a;
}
?>
