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
	$tid  = validateCodeString($taint_tid );
	$ans  = validateArray ($taint_ans );

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

	// attempt to read answer record
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

	// compose new answers text field
	$answers = $ans; //$answers . $ans;
	
	// insert or update answer
	$a['status'] = 'ok';
	if ($answerid) {
		$name = 'update-answer';
		$sql = "update drzinn.answer set answers=$2 where id = $1";
		$params = array($answerid, $answers);
		$result = execSql($conn, $name, $sql, $params, true);
		if (!$result) {
			Log::write(LOG_NOTICE, "$name failed");
			$a['status'] = 'failed';
		}
	}
	else {
		$name = 'insert-answer';
		$sql = "insert into drzinn.answer (userid, testcode, answers) values ($1,$2,$3)";
		$params = array($userid, $tid, $answers);
		$result = execSql($conn, $name, $sql, $params, true);
		if (!$result) {
			Log::write(LOG_NOTICE, "$name failed");
			$a['status'] = 'failed';
		}
	}

	// success
	return $a;
}

function validateCodeString($taint) {
	$clean = false;
 	$ok = preg_match('/^[a-z]{3,16}$/', $taint);
	if ($ok) {
		$clean = $taint;
	}
	return $clean;
}

function validateArray($taint) {
	$clean = false;
 	$ok = preg_match('/^[0-9\[\]\{\}(),;:\"]{3,200}$/', $taint);
	if ($ok) {
		$clean = $taint;
	}
	return $clean;
}
?>
