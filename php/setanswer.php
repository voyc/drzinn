<?php
/*
	svc setanswer
	Save a set of answers for logged-in user.
*/

require_once('tests.php');

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

	Log::write(LOG_WARNING, "si:$si");
	Log::write(LOG_WARNING, "tid:$tid");
	Log::write(LOG_WARNING, "ans:$ans");
	
	
	
	
	
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

	// score a completed test
	$numanswers = count($dmerged);
	$qsize = DrZinn::$test[$tid]['quizzsize'];	
	Log::write(LOG_NOTICE, "test $tid completed $numanswers of $qsize");
	if ($numanswers == $qsize) {
		Log::write(LOG_NOTICE, "test $tid completed. scoring.");

		switch($tid) {
			case 'tem':
				$scores = scoreTem($dmerged);
				break;
			case 'mot':
				$scores = scoreMot($dmerged);
				break;
			case 'per':
				$scores = scorePer($dmerged);
				break;
			case 'lrn':
				$scores = scoreLrn($dmerged);
				break;
			case 'eji':
				$scores = scoreEji($dmerged);
				break;
			case 'soi':
				$scores = scoreSoi($dmerged);
				break;
			default:
				Log::write(LOG_NOTICE, "$tid missing score function");
		}
		$jscores = json_encode($scores);

		// read score record if any
		$scoreid = 0;
		$name = 'query-score';
		$sql = "select id, scores from drzinn.score where userid = $1 and testcode = $2";
		$params = array($userid, $tid);
		$result = execSql($conn, $name, $sql, $params, false);
		if ($result && pg_num_rows ($result )) {
			$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
			$scoreid = $row['id'];
			$scores = $row['scores'];
		}

		// insert or update score
		if ($scoreid) {
			$name = 'update-score';
			$sql = "update drzinn.score set scores=$2 where id = $1";
			$params = array($scoreid, $jscores);
			$result = execSql($conn, $name, $sql, $params, true);
			if (!$result) {
				Log::write(LOG_NOTICE, "$name failed");
				$a['status'] = 'failed';
			}
		}
		else {
			$name = 'insert-score';
			$sql = "insert into drzinn.score (userid, testcode, scores) values ($1,$2,$3)";
			$params = array($userid, $tid, $jscores);
			$result = execSql($conn, $name, $sql, $params, true);
			if (!$result) {
				Log::write(LOG_NOTICE, "$name failed");
				$a['status'] = 'failed';
			}
		}

		$a['scoresupdated'] = true;
	}
	
	// success
	return $a;
}

function validateTestCode($taint) {
	// test string format
	$clean = false;
 	$ok = preg_match('/^[a-z]{3}$/', $taint);
	if ($ok) {
		// test presence in code table
		if (DrZinn::$test[$taint]) {
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

function scoreTem($answers) {
	$scores = array();
	$scores['e'] = countAnswers($answers, [ 1, 8,15,22,29,36,43,50,57,64] );
	$scores['s'] = countAnswers($answers, [ 2, 9,16,23,30,37,44,51,58,65, 3,10,17,24,31,38,45,52,59,66] );
	$scores['t'] = countAnswers($answers, [ 4,11,18,25,32,39,46,53,60,67, 5,12,19,26,33,40,47,54,61,68] );
	$scores['j'] = countAnswers($answers, [ 6,13,20,27,34,41,48,55,62,69, 7,14,21,28,35,42,49,56,63,70] );
	return $scores;
}		

function scoreMot($answers) {
	$scores = array();
	$scores['def'] = countAnswers($answers, [ 3, 4,19,39,82,110] );
	$scores['eff'] = countAnswers($answers, [ 8,46,47,58,59,83,84] );
	$scores['aut'] = countAnswers($answers, [15,16,17,30,35,54,55,56,57,116] );
	$scores['war'] = countAnswers($answers, [18,36,37,38,67,68,118] );
	$scores['fel'] = countAnswers($answers, [1,2,7,77,78,79,81,107,108,109] );
	$scores['cur'] = countAnswers($answers, [9,20,44,45,48,49,85,86,87,102] );
	$scores['res'] = countAnswers($answers, [21,22,23,24,50,80,90,91,98,119] );
	$scores['tol'] = countAnswers($answers, [5,6,103,104,105] );
	$scores['aff'] = countAnswers($answers, [26,27,28,29,42,63,112,113,114,115] );
	$scores['prs'] = countAnswers($answers, [60,62,99,100,101,106,111,120,121] );
	$scores['avd'] = countAnswers($answers, [13,14,25,64,70,92,93,94,95] );
	$scores['dis'] = countAnswers($answers, [43,65,66,96,97,117] );
	$scores['acc'] = countAnswers($answers, [10,11,12,31,32,33,34,72,73,74] );
	$scores['dir'] = countAnswers($answers, [40,41,51,52,53,71,75,76,88,89] );
	return $scores;
}		

function countAnswers($answers, $a) {
	$tot = 0;
	$cnt = 0;
	foreach ($a as $value) {
		$ndx = $value - 1;
		if ($answers[$ndx] == 1) {
			$cnt++;
		}
		$tot++;
	}
	return array($cnt, intval((($cnt / $tot) * 100)));
}

function scoreLrn($answers) {
/*
	$key = array(
		array(1,2,3),  //  1
		array(2,3,1),  //  2
		array(3,1,2),  //  3
		array(1,3,2),  //  4
		array(2,1,3),  //  5
		array(1,1,1),  //  6
		array(1,1,1),  //  7
		array(1,1,1),  //  8
		array(1,1,1),  //  9
		array(1,1,1),  // 10
		array(1,1,1),  // 11
		array(1,1,1),  // 12
		array(1,1,1),  // 13
		array(1,1,1),  // 14
		array(1,1,1),  // 15
		array(1,1,1),  // 16
		array(1,1,1),  // 17
		array(1,1,1),  // 18
		array(1,1,1),  // 19
		array(1,1,1),  // 20
		array(1,1,1),  // 21
		array(1,1,1),  // 22
		array(1,1,1),  // 23
		array(1,1,1),  // 24
		array(1,1,1),  // 25
	);

	foreach ($answers as $answer) {
		$key $answer	
		$eye = $a[0];
		$ear = $a[1];
		$han = $a[2];
	}
*/
}
?>
