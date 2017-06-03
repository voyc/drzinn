<?php	
/*
	svc getremark
	Return all remarks for logged-in user.
*/
function getremark() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;

	// validate inputs
	$si = validateToken($taint_si);

	// validate parameter set
	if (!$si) {
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
	$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
	$userid = $row['id'];

	// read remark records
	$allremarks = array();
	$name = 'query-remark';
	$sql = "select id, testcode, factorcode, remark from drzinn.remark where userid = $1";
	$params = array($userid);
	$result = execSql($conn, $name, $sql, $params, false);
	if ($result) {
		$numrows = pg_num_rows($result);
		for ($i=0; $i<$numrows; $i++) {
			$row = pg_fetch_array($result, $i, PGSQL_ASSOC);
			$remarkid = $row['id'];
			$testcode = $row['testcode'];
			$factorcode = $row['factorcode'];
			$remark = $row['remark'];
			if (!$allremarks[$testcode]) {
				$allremarks[$testcode] = array();
			}
			$allremarks[$testcode][$factorcode] = $remark;
		}
	}

	// success
	$a['status'] = 'ok';
	$a['remarks'] = $allremarks;
	return $a;
}
?>
