<?php
/*
	stub - an empty client service, using authenticated, logged-in user
*/
function doStub() {
	$a = array(
		'status' => 'system-error'
	);
	
	// raw inputs
	$taint_st = isset($_POST['st']) ? $_POST['st'] : 0;

	// validate inputs
	$st = validateToken($taint_st);

	// validate parameter set
	if (!$st){
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get database connection
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
