# accounts
User Authentication

A library of AJAX services:

  * register
  * login
  * logout
  * reset_password
  * forgot_password
  * change_username
  * change_email
  * change_password

A demo/test AJAX application is also provided.

Javascript is required.  Cookies are not required.

## Design Principles

  1. This project is open source.  The source code for this library is provided publicly on github so it can be vetted by multiple experts, and so the security algorithms do not depend on obfuscation and are not susceptible to reverse-engineering.
  
  1. Sensitive information including seeds and database credentials is placed in the config file, and the config file is not included in the git repository and is not on the docroot path.

  1. The directory structure is organized so the server-side PHP code is not exposed on the docroot path.

  1. A second-stage email verification is required after register, change-password, change-username, change-email, and reset-password requests.

  1. It is recommended that anonymous users be allowed to use the application, but database saves are executed only for verified users.

  1. For PHP server configuration security, we rely on our hosting service.

  1. We do NOT use PHP sessions.  Instead we create our own session-id "token".

  1. We DO use PHP password_hash() and password_verify() with the default parameters.  Algorithm and random-generated salt are concatenated to the hash in the returned value.

  1. All database access is done with prepared statements.

  1. All POST inputs to services are filtered on the server immediately.

  1. Error codes from the services contain minimal information.

  1. All http requests use POST method, not GET.

  1. It is recommended that all http requests are made to an SSL server with a valid certificate, though this is recommended but not enforced by this application.
  
  1. CORS is implemented so that service requests from a non-SSL server can be serviced by this app running on an SSL server.

  1. Tokens do not contain unhashed database keys.

  1. Tokens are stored in local storage instead of cookies, so they are not carried in an http header of every server request.

  1. We enforce
    . valid email address: includes @ and .
    . valid password: between 4 and 64 chars
	. valid username: between 4 and 64 chars
  
  1. User's private email address is obscured when returned to the client on login.
  
## Summary of Threats and Mitigation

**Threat:** SQL injection.<br/>
**Mitigation:** All user inputs are filtered on the server before use.  All SQL is executed with prepared statements.

**Threat:** Password cracking, using databases of stolen password hashes.<br/>
**Mitigation:** A seed is concatenated with user's password.

**Threat:** Password guessing.<br/>
**Mitigation:** Detect, limit, and log failed attempts.

**Threat:** Password probing attack can become a DOS attack unintentionally.<br/>
**Mitigation:** ?

**Threat:** Leaking server setup details.<br/>
**Mitigation:** Limited error codes returned to client.  Details of errors written to server log, not to client.

**Threat:** Timing attacks.  Example: login attempt with existing username takes longer to respond.<br/>
**Mitigation:** We query for username/password combination with a single query.

## Categories
Security,
Privacy,
User Authentication,
Code Hiding,
ID Theft

## TODO
  * The create_accounts_schema.sql file exposes a database username.  Can this be hidden?  This file is for postgres and would have to be modified for use with mysql.  We can assume this file will be modified by the user.  So it's a possibility it could accidentally get committed to the repository after the user has modified it.  Remove the grants from this file, and add them as comments to config.php, near the db credentials section.
  * add a config.php.sample file and add it to .gitignore 
  * publish valid username, email, and password requirements

## How to Install

  1. clone the repository.
	Draw a picture of the directory structure showing:
		where to run the clone
		where to put the config.php file
		where to point the docroot
		
	Sample unix statements.
		mkdir myhost
		cd myhost
		git clone

  1. Create the database
		run create_accounts_schema.sql

  1. Create the config.php file by copying it from config.php sample.
		cp accounts/config.php.sample ../config.php

  1. Modify the config.php file with credentials for your database and system.
     Note: Do NOT allow the modified config.php file to get into the repository.

  1. Run the sql grant statements found in the config.php file, modified with your dbuser name.

