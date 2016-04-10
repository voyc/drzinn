<?php

test( 'john@voyc.com');
test( 'john.hagstrand@voyc.hagstrand.com');

function test($email) {
	echo $email . ':' . obscureEmail($email) . "\n";
}

function obscureEmail($email) {
	$a = explode('@', $email);
	$b = explode('.', $email);
	$name = $a[0];
	$top = $b[count($b)-1];
	$s = substr($name, 0, 1) . '*****@' . substr($email, strlen($name)+1, 1) . '****.' . $top;
	return $s;
}
?>
