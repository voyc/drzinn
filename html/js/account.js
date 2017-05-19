/**
 * class Account
 * @param {Object=} observer
 * @constructor
 * A singleton object
 * Manages user authentication.

 Values returned in response.
              session     screen
	status      no          no
	si          yes         no
	auth        yes         yes
	access      yes         no
	uname       no          yes
	email       no          no

 Object Account handles sessionStorage.
 Object AccountView handles display to screen.

 */
Account = function (observer) {
	if (Account._instance) return Account._instance;
	Account._instance = this;

	this.observer = observer;
	this.comma = new voyc.Comm('account/svc/', 'comma', 2, true);  // for production
	if (window.location.origin == 'file://') {
		this.comma = new voyc.Comm('http://account.hagstrand.com/svc', 'comma', 2, true);  // for local testing
	}

	// attach app events
	var self = this;
	this.observer.subscribe('setup-complete'           ,'account' ,function(note) { self.onSetupComplete           (note); });
	this.observer.subscribe('login-submitted'          ,'account' ,function(note) { self.onLoginSubmitted          (note); });
	this.observer.subscribe('logout-requested'         ,'account' ,function(note) { self.onLogoutRequested         (note); });
	this.observer.subscribe('register-submitted'       ,'account' ,function(note) { self.onRegisterSubmitted       (note); });
	this.observer.subscribe('verify-submitted'         ,'account' ,function(note) { self.onVerifySubmitted         (note); });
	this.observer.subscribe('forgotpassword-submitted' ,'account' ,function(note) { self.onForgotPasswordSubmitted (note); });
	this.observer.subscribe('resetpassword-submitted'  ,'account' ,function(note) { self.onResetPasswordSubmitted  (note); });
	this.observer.subscribe('changepassword-submitted' ,'account' ,function(note) { self.onChangePasswordSubmitted (note); });
	this.observer.subscribe('changeusername-submitted' ,'account' ,function(note) { self.onChangeUsernameSubmitted (note); });
	this.observer.subscribe('changeemail-submitted'    ,'account' ,function(note) { self.onChangeEmailSubmitted    (note); });
	this.observer.subscribe('verifyemail-submitted'    ,'account' ,function(note) { self.onVerifyEmailSubmitted    (note); });
}

Account.svcdef = {
	'register':       {'uname':1, 'email':1, 'pword':1, 'both':0, 'pnew':0, 'si':0, 'tic':0},
	'verify':         {'uname':0, 'email':0, 'pword':1, 'both':0, 'pnew':0, 'si':1, 'tic':1},
	'login':          {'uname':0, 'email':0, 'pword':1, 'both':1, 'pnew':0, 'si':0, 'tic':0},
	'relogin':        {'uname':0, 'email':0, 'pword':0, 'both':0, 'pnew':0, 'si':0, 'tic':0},
	'logout':         {'uname':0, 'email':0, 'pword':0, 'both':0, 'pnew':0, 'si':1, 'tic':0},
	'forgotpassword': {'uname':0, 'email':0, 'pword':0, 'both':1, 'pnew':0, 'si':0, 'tic':0},
	'resetpassword':  {'uname':0, 'email':0, 'pword':0, 'both':0, 'pnew':1, 'si':1, 'tic':1},
	'changepassword': {'uname':0, 'email':0, 'pword':1, 'both':0, 'pnew':1, 'si':1, 'tic':0},
	'changeusername': {'uname':1, 'email':0, 'pword':1, 'both':0, 'pnew':0, 'si':1, 'tic':0},
	'changeemail':    {'uname':0, 'email':1, 'pword':1, 'both':0, 'pnew':0, 'si':1, 'tic':0},
	'verifyemail':    {'uname':0, 'email':0, 'pword':1, 'both':0, 'pnew':0, 'si':1, 'tic':1},
	'stub':           {'uname':0, 'email':0, 'pword':0, 'both':0, 'pnew':0, 'si':1, 'tic':0},
}

Account.fielddef = {
	'uname':	{'type':'text'    , 'valuetype':'value'  , 'display':'username'},
	'email':	{'type':'text'    , 'valuetype':'value'  , 'display':'email'},
	'pword':	{'type':'text'    , 'valuetype':'value'  , 'display':'password'},
	'both':		{'type':'text'    , 'valuetype':'value'  , 'display':'username or email'},
	'pnew':		{'type':'text'    , 'valuetype':'value'  , 'display':'new password'},
	'si':		{'type':'text'    , 'valuetype':'value'  , 'display':'session-id'},
	'tic':		{'type':'text'    , 'valuetype':'value'  , 'display':'temporary id code'},
}

/* 
	user authentication states
		database, svc, sessionStorage use numeric
		javascript programming uses string, getAuth() 
*/
Account.authdef = {
	0: 'anonymous'   ,
	1: 'registered'  ,
	2: 'resetpending',
	7: 'verified'    ,  // auth >= verified vs auth < verified
	8: 'emailpending',
}
Account.svcbyauth = {
	'register':       {'anonymous':1, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':0 },
	'verify':         {'anonymous':0, 'registered':1, 'resetpending':0, 'emailpending':0, 'verified':0 },
	'login':          {'anonymous':1, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':0 },
	'relogin':        {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':0 },
	'logout':         {'anonymous':0, 'registered':1, 'resetpending':1, 'emailpending':1, 'verified':1 },
	'forgotpassword': {'anonymous':1, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':0 },
	'resetpassword':  {'anonymous':0, 'registered':0, 'resetpending':1, 'emailpending':0, 'verified':0 },
	'changepassword': {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':1 },
	'changeusername': {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':1 },
	'changeemail':    {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':1 },
	'verifyemail':    {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':1, 'verified':1 },
	'stub':           {'anonymous':0, 'registered':0, 'resetpending':0, 'emailpending':0, 'verified':1 },
}

Account.accessdef = {
	   0: 'none',
	   1: 'novice',
	 100: 'pro',
	 200: 'master',
	 235: 'admin',
	 255: 'super'
}

/* services */

Account.prototype.onLoginSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		self.observer.publish(new voyc.Note('login-received', 'account', response));
		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.requestPending(response);
		}
	});

	this.observer.publish(new voyc.Note('login-posted', 'account', {}));
}

Account.prototype.onRegisterSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('register-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.requestPending(response);
			self.assertAuth('registered');
		}
	});

	this.observer.publish(new voyc.Note('register-posted', 'account', {}));
}

Account.prototype.onVerifySubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('verify-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.assertAuth( 'verified');
		}
	});

	this.observer.publish(new voyc.Note('verify-posted', 'account', {}));
}

Account.prototype.onSetupComplete = function(note) {
	if (getSessionId()) {
		var svcname = 'relogin';
		var data = { 'si':getSessionId() };
		var self = this;
		this.comma.request(svcname, data, function(ok, response, xhr) {
			if (!ok) {
				response = { 'status':'system-error'};
			}
			self.observer.publish(new voyc.Note('relogin-received', 'account', response));
			if (response['status'] == 'ok') {
				self.saveSession(response);
				self.requestPending(response);
			}
			else {
				console.log('relogin failed.  session cleared.');
				self.clearSession();
			}
		});
		this.observer.publish(new voyc.Note('relogin-posted', 'account', {}));
	}
	else {
		this.clearSession();
		this.observer.publish(new voyc.Note('restart-anonymous', 'account', {}));
	}
}

Account.prototype.onLogoutRequested = function(note) {
	// post to svc
	var svcname = 'logout';
	var data = { 'si':getSessionId() };
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		self.clearSession();
		self.observer.publish(new voyc.Note('logout-received', 'account', response));
	});

	this.observer.publish(new voyc.Note('logout-posted', 'account', {}));
}

Account.prototype.onForgotPasswordSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('forgotpassword-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.assertAuth('resetpending');
			self.observer.publish(new voyc.Note('resetpassword-requested', 'account', response));
		}
		else {
			self.clearSession();
		}
	});

	this.observer.publish(new voyc.Note('forgotpassword-posted', 'account', {}));
}

Account.prototype.onResetPasswordSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('resetpassword-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.assertAuth('verified');
		}
	});

	this.observer.publish(new voyc.Note('resetpassword-posted', 'account', {}));
}

Account.prototype.onChangePasswordSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('changepassword-received', 'account', response));

		if (response['status'] == 'ok') {
			console.log('change password successful');
		}
	});

	this.observer.publish(new voyc.Note('changepassword-posted', 'account', {}));
}

Account.prototype.onChangeUsernameSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('changeusername-received', 'account', response));

		if (response['status'] == 'ok') {
			console.log('change username successful');
		}
	});

	this.observer.publish(new voyc.Note('changeusername-posted', 'account', {}));
}

Account.prototype.onChangeEmailSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('changeemail-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.requestPending();
			self.assertAuth('emailpending');
		}
	});

	this.observer.publish(new voyc.Note('changeemail-posted', 'account', {}));
}
Account.prototype.onVerifyEmailSubmitted = function(note) {
	var svcname = note.payload.svc;
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = this.buildDataArray(svcname, inputs);

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('verifyemail-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			self.assertAuth('verified');
		}
	});


	this.observer.publish(new voyc.Note('verifyemail-posted', 'account', {}));
}
Account.prototype.onStubRequested = function(note) {
	var svcname = 'stub';
	var data = { 'a':'watchword', 'b':'wizard', 'si':getSessionId() };

	// call svc
	var self = this;
	this.comma.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('stub-received', 'account', response));

		if (response['status'] == 'ok') {
			self.saveSession(response);
			alert(response['message']);
		}
		else {
			alert('stub failed');
		}
	});

	this.observer.publish(new voyc.Note('stub-posted', 'account', {}));
}

/* utilities */

Account.prototype.buildDataArray = function(svcname, inputs) {
	var data = {};
	var fields = Account.svcdef[svcname];
	for (var name in fields) {
		var req = fields[name];
		var valuetype = Account.fielddef[name]['valuetype'];
		if (req) {
			var value = '';
			if (name == 'si') {
				value = getSessionId();
			}
			else {
				value = inputs[name][valuetype];
				if (valuetype == 'checked') {
					value = (value) ? 't' : 'f';
				}
			}
			data[name] = value;
		}
	}
	return data;
}

Account.prototype.isSvcAllowed = function(svc) {
	return 	this.isSvcAllowedForAuth(svc, this.getAuth());
}
Account.prototype.isSvcAllowedForAuth = function(svc, auth) {
	return 	Account.svcbyauth[svc][auth];
}

Account.prototype.getAllowedSvcsForAuth = function(auth) {
	var list = [];
	for (var svc in Account.svcbyauth) {
		if (Account.svcbyauth[svc][auth]) {
			list.push(svc);
		}
	}
	return [];
}

Account.prototype.getAuth = function() {
	var code = voyc.Session.get('auth');
	return Account.authdef[code];
}

Account.prototype.assertAuth = function(auth) {
	if (this.getAuth() != auth) {
		console.log('assertion failed.  auth is not ' + auth)
	}
}

Account.prototype.saveSession = function(response) {
	if (response['si'])     voyc.Session.set('si', response['si']);
	if (response['auth'])   voyc.Session.set('auth', response['auth']);
	if (response['access']) voyc.Session.set('access', response['access']);
}
Account.prototype.clearSession = function() {
	voyc.Session.set('si', '');
	voyc.Session.set('auth', '0');
	voyc.Session.set('access', '0');
}
Account.prototype.requestPending = function(response) {
 	if (isUserRegistered()) {
		this.observer.publish(new voyc.Note('verify-requested', 'account', response));
	}
	if (isUserEmailPending()) {
		this.observer.publish(new voyc.Note('verifyemail-requested', 'account', response));
	}
	if (isUserResetPending()) {
		this.observer.publish(new voyc.Note('resetpassword-requested', 'account', response));
	}
}

/*  global functions */

var isSvcAllowed = function(svc) { return (new Account).isSvcAllowed(svc); }
var getAuth = function() { return (new Account).getAuth(); }
var isUserAnonymous   = function() { return getAuth() == 'anonymous'   ;}
var isUserRegistered  = function() { return getAuth() == 'registered'  ;}
var isUserResetPending= function() { return getAuth() == 'resetpending';}
var isUserVerified    = function() { return getAuth() == 'verified'    ;}
var isUserEmailPending= function() { return getAuth() == 'emailpending';}
var getSessionId = function() { return voyc.Session.get('si'); }
