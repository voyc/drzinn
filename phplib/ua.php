<?php
/**
	user authentication svc entry point
**/
require_once(dirname(__FILE__).'/../../config.php');
require_once('str.php');
require_once('db.php');
require_once('validate.php');
require_once('crypto.php');
require_once('cors.php');
require_once('log.php');

writeHeader();

function register() {
	Log::open('register');
	require_once('svcregister.php');
	$a = doRegister();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function verify() {
	Log::open('verify');
	require_once('svcregister.php');
	$a = doVerify();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function forgotpassword() {
	Log::open('forgot');
	require_once('svcreset.php');
	$a = doForgot();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function resetpassword() {
	Log::open('reset');
	require_once('svcreset.php');
	$a = doReset();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function login() {
	Log::open('login');
	require_once('svclogin.php');
	$a = doLogin();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function relogin() {
	Log::open('relogin');
	require_once('svclogin.php');
	$a = doRelogin();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function logout() {
	Log::open('logout');
	require_once('svclogin.php');
	$a = doLogout();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function changepassword() {
	Log::open('changepassword');
	require_once('svcchange.php');
	$a = doChangePassword();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function changeemail() {
	Log::open('changeemail');
	require_once('svcchange.php');
	$a = doChangeEmail();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function changeusername() {
	Log::open('changeusername');
	require_once('svcchange.php');
	$a = doChangeUsername();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}

function stub() {
	Log::open('stub');
	require_once('svcstub.php');
	$a = doStub();
	echo json_encode($a);
	Log::close($a['status']);
	return;
}
?>
