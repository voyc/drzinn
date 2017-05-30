<?php	
/*
	svc getanswer
	Return the answers for all tests for logged-in user.
*/
function getanswer() {
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

	// read answer records
	$allanswers = array();
	$name = 'query-answer';
	$sql = "select id, testcode, answers from drzinn.answer where userid = $1";
	$params = array($userid);
	$result = execSql($conn, $name, $sql, $params, false);
	if ($result) {
		$numrows = pg_num_rows($result);
		for ($i=0; $i<$numrows; $i++) {
			$row = pg_fetch_array($result, $i, PGSQL_ASSOC);
			$answerid = $row['id'];
			$testcode = $row['testcode'];
			$answers = $row['answers'];
			$allanswers[$testcode] = $answers;
		}
	}

	// success
	$a['status'] = 'ok';
	$a['answers'] = $allanswers;
	return $a;
}
?>
