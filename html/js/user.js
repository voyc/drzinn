// अथ योगानुशासनम्॥१॥
/*
	Represents the current user.
	May be logged-in or anonymous.
	Manages calls to user authentication services.
*/
User = function() {
	this.username = '';
	this.st = '';
	this.auth = '';
	this.access = '';
	// email and password are NOT saved on the client.

	// extended profile
	this.photo = '';
	this.birthday = 0;
	this.phone = '';
	this.gender = '';
	
	this.config = {
		reason = {
			remember_me: 'rc',
		}
	};
}

User.prototype = {
	setup: function() {
		var self = this;
		flash.observer.subscribe('setup-complete'         ,'user' ,function(note) { self.relogin(note);         });
		flash.observer.subscribe('login-submit'           ,'user' ,function(note) { self.login(note);           });
		flash.observer.subscribe('logout'                 ,'user' ,function(note) { self.logout(note);          });
		flash.observer.subscribe('register-submit'        ,'user' ,function(note) { self.register(note);        });
		flash.observer.subscribe('verify'                 ,'user' ,function(note) { self.verify(note);          });
		flash.observer.subscribe('forgot-submit'          ,'user' ,function(note) { self.forgot(note);          });
		flash.observer.subscribe('reset-submit'           ,'user' ,function(note) { self.reset(note);           });
		flash.observer.subscribe('change-email-submit'    ,'user' ,function(note) { self.changeEmail(note);     });
		flash.observer.subscribe('change-username-submit' ,'user' ,function(note) { self.changeUsername(note);  });
		flash.observer.subscribe('change-password-submit' ,'user' ,function(note) { self.changePassword(note);  });
	},

	isAnonymous: function() {
		return (!this.st);
	},

	relogin: function() {
		// get the rememberme cookie
		var token = Cookie.get('rc');   // secure.config.reasonRememberMe

		// if no cookie, we start as anonymous user
		if (!token) {
			flash.observer.publish(new Note('user-is-anonymous', 'user', {}));
		}

		// publish note instead of caling direct?
		// show waiting... message while we attempt login
		var title = flash.str.get('contact-server');
		var msg1 = flash.str.get('contacting-server');
		flash.modal.prompt(title, msg1, null);
	
		var postdata = {
			rm:token,
		};
		var self = this;
		secure.comm.request('relogin', postdata, function(ok,response,xhr) { 
			self.onLogin(ok, response, xhr);
		});
	},

	login: function(note) {
		var postdata = note.payload;
		var self = this;
		secure.comm.request('login', postdata, function(ok,response,xhr) {
			self.onLogin(ok, response, xhr);
		});
	},

	onLogin: function(ok, response, xhr) {
		if (ok && response.status == 'ok') {
			this.username = response.username;
			this.st = response.st;
			this.auth = response.auth;
			this.access = response.access;

			if (response.rm) {
				var expires = new Date();
				expires.setTime(expires.getTime() + (1 * 60 * 60 * 1000));
				Cookie.set('rm', response.rm, expires);
			}
		}

		flash.observer.publish(new Note(notename, 'user', {
			status: response.status,
			username: this.username
		}));

	},

	register: function(note) {
		var request = note.payload;
		var self = this;
		flash.commLogin.request('register', request, function(ok,response,xhr) {
			self.onRegister(ok, response, xhr);
		});
	},

	onRegister: function(ok, response, xhr) {
		var notename = 'register-failed';
		var a = {};
		a.msg = response.status;

		if (ok && response.status == 'ok') {
			this.anonymous = false;
			this.username = response.username;
			this.token = response.tk;
			//this.programid = response.programid;
			Cookie.set('tk', this.token);
			a.programid = response.programid;
			a.username = this.username;
			a.msg = '';
			notename = 'register-success';
		}
		var note = new Note(notename, 'user', a);
		flash.observer.publish(note);
	},

	logout: function(note) {
		var postdata = {
			tk:this.token,
		};
		var self = this;
		flash.commLogin.request('logout', postdata, function(ok,response,xhr) {
			Cookie.del('tk');
			this.username = '';
			this.token = '';
			flash.observer.publish(new Note('user-is-anonymous', 'user', {}));
		});
	},

	forgot: function(note) {
		// user has forgotten his password
		// this should only be executed when the user is NOT logged in
		var request = note.payload;
		var self = this;

		// if the email address is on file,
		// an email will be sent to the user
		// with a url to a screen that will allow him
		// to change his password.
		flash.commLogin.request('forgot', request, function(ok,response,xhr) {
			self.onForgot(ok, response, xhr);
		});
	},
	onForgot: function(ok, response, xhr) {
		var notename = 'forgot-failed';
		var a = {};
		a.msg = response.status;

		if (ok && response.status == 'ok') {
			notename = 'forgot-success';
		}
		var note = new Note(notename, 'user', a);
		flash.observer.publish(note);
	},

	changeEmail: function() {
	},
	sendEmailVerification: function() {
	},
	verifyEmail: function() {
	},
	changeProfile: function() {
	},
	changeProgram: function() {
	}
}
