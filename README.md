

## Principles

For PHP server configuration security, we rely on our hosting service.

We do NOT use PHP sessions.  Instead we create our own session-id "token".

We DO use PHP password_hash() and password_verify() with the default parameters.  
Algorithm and random-generated salt are concatenated to the hash in the returned value.

Cookie reading and writing is done by the Javascript client, not by the PHP services.

All database access is done with prepared statements.

All POST inputs to services are filtered immediately.

Error messages from the services contain minimal information.

All http requests use POST method, not GET.  

All http requests are made to a SSL server with a valid certificate.

Javascript required.

Cookies are not required.  But if cookies are enabled, we use two:
one for the session id and one for the remember me cookie.

No database updates or inserts unless user is verified.  Reset pending is NOT verified.
	
## Summary of Threats and Mitigation

sql injection
	filtering
	prepared statements

password cracking, using databases of stolen password hashes
	seed

password guessing
	detect and limit failed attempts

password probing attack can become a dos attack, unintentionally

avoid leaking server setup details
	limited error messages.  details in log.

timing attacks. existing username takes longer to response than non-existing username

## Categories
Security
Privacy
User Authentication
Code Hiding
ID Theft
