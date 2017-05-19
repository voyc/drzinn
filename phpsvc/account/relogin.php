<?php
function relogin() {  // login with session-id
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;

	// validated inputs
	$si = validateToken($taint_si);

	// connect to db
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// query user table
	$result = getUserByToken($conn, $si);
	if (!$result) {
		return $a;
	}

	// get the data
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$uname = $row['username'];
	$email = $row['email'];
	$auth = $row['auth'];
	$access = $row['access'];
	$dbtoken = $row['token'];

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
?>
