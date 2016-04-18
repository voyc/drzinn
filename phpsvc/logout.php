<?php
function logout() {
	$a = array(
	    'status' => 'system-error'
	);

	// raw inputs
	$taint_si = isset($_POST['si']) ? $_POST['si'] : 0;

	// validated inputs
	$si = validateToken($taint_si);

	// validate parameter set
	if (!$si) {
		Log::write(LOG_WARNING, 'attempt with invalid parameter set');
		return $a;
	}

	$conn = getConnection();
	if (!$conn) {
		return $a;
	}

	$boo = expireToken($conn, $si);
	if (!$boo) {
		return $a;
	}

	$a['status'] = 'ok';
	return $a;
}
?>
