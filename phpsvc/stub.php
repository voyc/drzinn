<?php
/*
	svc stub
	An empty client service, using authenticated, logged-in user.
*/
function stub() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;

	// validate inputs
	$si = validateToken($taint_si);

	// validate parameter set
	if (!$si){
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get database connection
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
	$username = $row['username'];
	$access = $row['access'];
	$auth = $row['auth'];

	// compose output message
	if (isUserVerified($auth)) {
		$message = "$username is verified";
	}

	// success
	$a['status'] = 'ok';
	$a['message'] = $message;
	return $a;
}
?>
