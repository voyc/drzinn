<?php
class Str {
	static $strings = array(
		'verify-subject' => 'email verification - $1',
		'verify-message' => "Thank you for registering with $2.\nYour Temporary Identification Code is: $3\nPlease goto $1 now and enter this code to complete your registration.\nThis code will expire in a few minutes.",
		'reset-subject' => 'password reset - $1',
		'reset-message' => "You have requested a password reset on $2.\nYour Temporary Identification Code is: $3\nPlease goto $1 and enter this code now.\nThis code will expire in a few minutes.",
	);

	public static function get($name, $params) {
		$s = self::$strings[$name];
		if ($params) {
			for($x=0; $x<count($params); $x++) {
				$p = $params[$x];
				$t = '$'.($x+1);
				$s = str_replace($t, $p, $s);
			}	
		}
		return $s;
	}
}
?>
