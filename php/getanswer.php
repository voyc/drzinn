<?php
/*
	svc getanswer
	Return the answers for logged-in user.
*/

require_once('tests.php');

function getanswer() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_tid = isset($_POST['tid']) ? $_POST['tid'] : '';

	// validate inputs
	$si = validateToken($taint_si);
	$tid  = validateTestCode($taint_tid );

	// validate parameter set
	if (!$si || !$tid) {
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

	// read answer record
	$answerid = 0;
	$answers = '';
	$janswers = '';
	$name = 'query-answer';
	$sql = "select id, answers from drzinn.answer where userid = $1 and testcode = $2";
	$params = array($userid, $tid);
	$result = execSql($conn, $name, $sql, $params, false);
	if ($result) {
		$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
		$answerid = $row['id'];
		$answers = $row['answers'];
		$janswers = json_encode($answers);
	}

	// success
	$a['status'] = 'ok';
	$a['answers'] = $answers;
	return $a;
}

function validateTestCode($taint) {
	// test string format
	$clean = false;
 	$ok = preg_match('/^[a-z]{3,16}$/', $taint);
	if ($ok) {
		// test presence in code table
		if (DrZinn::$test[$taint]) {
			$clean = $taint;
		}
	}
	return $clean;
}
?>
