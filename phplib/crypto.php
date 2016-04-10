<?php

/**
	crypto functions
		these tend to evolve over time as cops and robbers devise new tricks
		for now, we are using built-in PHP functions
**/

// 1. generate a unique key for use as session id or rememberme cookie
function generateToken() {  // returns a hash string length 64
	// older version from php-login-advanced, returns a hash string length 32
	//$tk = sha1(uniqid(mt_rand(), true));
	global $ua_token_seed;
	$tk = hash('sha256', Config::$ua_tokenseed.mt_rand());
	return $tk;
}
function encryptToken($token) {
	$cipherToken = mcrypt_encrypt(MCRYPT_RIJNDAEL_256, Config::$ua_secretkey, $token, MCRYPT_MODE_ECB);
	$publicToken = base64_encode($cipherToken);
	return $publicToken;
}
function decryptToken($publicToken) {
	$cipherToken = base64_decode($publicToken);
	$token = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, Config::$ua_secretkey, $cipherToken, MCRYPT_MODE_ECB);
	return $token;
}

// 2. generate a code for use as "temporary identification code" in email authorization
function generateCode() {  // returns all digits length 6
	// exclude problem chars: B8G6I1l0OQDS5Z2
	$characters = 'ACEFHJKMNPRTUVWXY4937';
	$string = '';
	$len = 6;
	for ($i = 0; $i < $len; $i++) {
		$string .= $characters[rand(0, strlen($characters) - 1)];
	}
	return $string;
}

// 3. hash and verify a password
// the hashed string contains concatenated salt and algo which are used to verify the incoming password
function hashPassword($password) {  // returns a hash string max length 255
	return password_hash($password, PASSWORD_DEFAULT);
}
function verifyPassword($password, $storedHashPassword) {  // returns a boolean
	return password_verify($password, $storedHashPassword);
}
?>
