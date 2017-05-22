<?php
/*
	svc getscore
	Return the scores for logged-in user.
*/

require_once('tests.php');

function getscore() {
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

	// read score records
	$scoreid = 0;
	$scores = '';
	$jscores = '';
	$name = 'query-score';
	$sql = "select id, testcode, scores from drzinn.score where userid = $1";
	$params = array($userid);
	$result = execSql($conn, $name, $sql, $params, false);
	$numrows = pg_num_rows($result);
	$out = array();
	for ($i=0; $i<$numrows; $i++) {
		$row = pg_fetch_array($result, $i, PGSQL_ASSOC);
		$scoreid = $row['id'];
		$testcode = $row['testcode'];
		$scores = $row['scores'];
		$out[$testcode] = $scores;
	}

	// success
	$a['status'] = 'ok';
	$a['scores'] = $out;
	return $a;
}
?>
