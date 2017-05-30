<?php
/*
	svc setanswer
	Save a set of answers for logged-in user.
*/

function setanswer() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_tid = isset($_POST['tid']) ? $_POST['tid'] : '';
	$taint_ans = isset($_POST['ans']) ? $_POST['ans']  : '';

	// validate inputs
	$si = validateToken($taint_si);
	$tid  = validateTestCode($taint_tid );
	$ans  = validateArray($taint_ans );
	
	// validate parameter set
	if (!$si || !$tid || !$ans) {
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

	// read answer record if any
	$answerid = 0;
	$name = 'query-answer';
	$sql = "select id, answers from drzinn.answer where userid = $1 and testcode = $2";
	$params = array($userid, $tid);
	$result = execSql($conn, $name, $sql, $params, false);
	if ($result) {
		$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
		$answerid = $row['id'];
		$answers = $row['answers'];
	}

	// merge the new answers into those already on file
	$danswers = json_decode($answers,true);
	$dans = json_decode($ans,true);
	$dmerged = $danswers;
	foreach ($dans as $dq => $da) {
		$dmerged[$dq] = $da;
	}
	$merged = json_encode($dmerged);
	
	// insert or update answer
	$a['status'] = 'ok';
	if ($answerid) {
		$name = 'update-answer';
		$sql = "update drzinn.answer set answers=$2 where id = $1";
		$params = array($answerid, $merged);
		$result = execSql($conn, $name, $sql, $params, true);
		if (!$result) {
			Log::write(LOG_NOTICE, "$name failed");
			$a['status'] = 'failed';
		}
	}
	else {
		$name = 'insert-answer';
		$sql = "insert into drzinn.answer (userid, testcode, answers) values ($1,$2,$3)";
		$params = array($userid, $tid, $merged);
		$result = execSql($conn, $name, $sql, $params, true);
		if (!$result) {
			Log::write(LOG_NOTICE, "$name failed");
			$a['status'] = 'failed';
		}
	}
	
	// success
	return $a;
}

function validateTestCode($taint) {
	$validtest = array(
		'temperament',
		'motivation',
		'personality',
		'learningstyle',
		'eji',
		'soi',
		'wheel',
		'boundaries',
		'rhythm'
	);
	// test string format
	$clean = false;
 	$ok = preg_match('/^[a-z]{3,20}$/', $taint);
	if ($ok) {
		// test presence in code table
		if (in_array($taint, $validtest)) {
			$clean = $taint;
		}
	}
	return $clean;
}

function validateArray($taint) {
	$clean = false;
 	$ok = preg_match('/^[0-9\[\]\{\}(),;:\"]{3,1500}$/', $taint);
	if ($ok) {
		$clean = $taint;
	}
	return $clean;
}
?>
