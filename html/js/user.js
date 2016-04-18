// अथ योगानुशासनम्॥१॥
/*
	class User
	Singleton object.
	Represents the current user.
	May be logged-in or anonymous.
*/
User = function(observer) {
	this.observer = observer;
	this.username = '';
	this.auth = '';
	this.access = '';

	// extended profile
	this.photo = '';
	this.birthday = 0;
	this.phone = '';
	this.gender = '';

	var self = this;
	this.observer.subscribe('login-received'         ,'user' ,function(note) { self.onLoginReceived         (note);});
	this.observer.subscribe('logout-received'        ,'user' ,function(note) { self.onLogoutReceived        (note);});
}

User.prototype.isAnonymous = function() {
	return (!this.username);
}

User.prototype.onLoginReceived = function(note) {
	this.username = note.payload.username;
	this.auth = note.payload.auth;
	this.access = note.payload.access;
}

User.prototype.onLogoutReceived = function(note) {
	this.username = '';
	this.auth = '';
	this.access = '';
}
