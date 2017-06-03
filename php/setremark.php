<?php
/*
	svc setremark
	Save one remark for logged-in user.
*/

function setremark() {
	$a = array(
		'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;
	$taint_tid = isset($_POST['tid']) ? $_POST['tid'] : '';
	$taint_fid = isset($_POST['fid']) ? $_POST['fid'] : '';
	$taint_rem = isset($_POST['rem']) ? $_POST['rem']  : '';

	// validate inputs
	$si = validateToken($taint_si);
	$tid  = validateTestCode($taint_tid );
	$fid  = validateFactorCode($taint_fid );
	$rem  = validateText($taint_rem );
	
	// validate parameter set
	if (!$si || !$tid || !$fid || !$rem) {
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

	// read remark record if any
	$remarkid = 0;
	$name = 'query-remark';
	$sql = "select id, remark from drzinn.remark where userid = $1 and testcode = $2 and factorcode = $3";
	$params = array($userid, $tid, $fid);
	$result = execSql($conn, $name, $sql, $params, false);
	$numrows = pg_num_rows($result);
	if ($result && $numrows) {
		$row = pg_fetch_array($result, 0, PGSQL_ASSOC);
		$remarkid = $row['id'];
		$remark = $row['remark'];
	}

	// insert or update remark
	$a['status'] = 'ok';
	if ($remarkid) {
		$name = 'update-remark';
		$sql = "update drzinn.remark set remark=$2 where id = $1";
		$params = array($remarkid, $rem);
		$result = execSql($conn, $name, $sql, $params, true);
		if (!$result) {
			Log::write(LOG_NOTICE, "$name failed");
			$a['status'] = 'failed';
		}
	}
	else {
		$name = 'insert-remark';
		$sql = "insert into drzinn.remark (userid, testcode, factorcode, remark) values ($1,$2,$3,$4)";
		$params = array($userid, $tid, $fid, $rem);
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

function validateFactorCode($taint) {
	// test string format
	$clean = false;
 	$ok = preg_match('/^[a-z]{3,20}$/', $taint);
	if ($ok) {
		$clean = $taint;
	}
	return $clean;
}

function validateText($taint) {
	$clean = false;
	$stripped = strip_tags($taint);
	if ($stripped == $taint) {
		//$ok = preg_match('/^[ .,a-zA-Z0-9\[\]\{\}(),;:\"\']{3,1500}$/', $taint);

		$ok = preg_match('/^[ .,\?\/!@#$%\^&\*;:{}=\-_`~()a-zA-Z0-9\[\]\\"\'\[\]]{3,1500}$/', $taint);
		
		if ($ok) {
			
			$clean = $taint;
		}
	}
	return $clean;
}
?>
