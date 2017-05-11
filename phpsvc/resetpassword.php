<?php
/*
	svc resetpassword
	Reset password.
*/
function resetpassword() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_tic = isset($_POST['tic']) ? $_POST['tic'] : 0;
	$taint_pnew = isset($_POST['pnew']) ? $_POST['pnew'] : 0;

	// validate inputs
	$si = validateToken($taint_si);
	$tic = validateTic($taint_tic);
	$pnew = validatePword($taint_pnew);

	// validate parameter set
	if (!$si || !$pnew || !$tic) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	// get database connection
	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	// read user and token table
	$result = getUserByToken($conn, $si);
	if (!$result) {
		return $a;
	}

	// get data fields
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$id = $row['id'];
	$hashtic = $row['hashtic'];
	$auth = $row['auth'];
	$uname = $row['username'];

	// verify user
	if (isUserVerified($auth)) {
		Log::write(LOG_NOTICE, 'attempt on already-verified user');
		$a['status'] = 'reset-fail';
		return $a;
	}

	// verify the tic from the email
	$boo = verifyTic($tic, $hashtic);
	if (!$boo) {
		Log::write(LOG_NOTICE, 'attempt with invalid tic');
		$a['status'] = 'reset-fail';
		return $a;
	}

	// hash the new password
	$hashpnew = hashPassword($pnew);

	// store the new hashed password and set user to verified
	$name = 'reset-password-update';
	$sql = "update account.user set auth = $1, hashpassword = $3 where id = $2";
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
