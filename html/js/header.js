/*
	class Header
	Singleton object.
	Represents the UI header and the popup dialog for user functions.
*/
Header = function(observer) {
	this.observer = observer;
	this.uname = '';

	// attach app events
	var self = this;
	this.observer.subscribe('setup-complete'           ,'header' ,function(note) { self.onSetupComplete(note);});

	this.observer.subscribe('relogin-received'         ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('login-received'           ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('logout-received'          ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('restart-anonymous'        ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('forgotpassword-received'  ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('resetpassword-received'   ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('changeusername-received'  ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('changeemail-received'     ,'header' ,function(note) { self.refresh(note);});
	this.observer.subscribe('verifyemail-received'     ,'header' ,function(note) { self.refresh(note);});

	// attach UI events
	var elems = document.querySelectorAll('[request]');
	var elem;
	var self = this;
	for (i=0; i<elems.length; i++) {
		elem = elems[i];
		elem.addEventListener('click', function(evt) {
			self.onRequest(evt);
		}, false);
	}

	// for debugging only
	var elem = document.querySelector('icon[name=gear]');
	elem.addEventListener('click', function() {
		var ss = voyc.$('sessionstorage');
		if (ss) {
			var s = '';
			for (var v in sessionStorage) {
				s += '<tr><td>' + v + '</td><td>' + sessionStorage[v] + '</td></tr>';
			}
			ss.innerHTML = '<table>' + s + '</table>';
		}
	}, false);
}

Header.prototype.onRequest = function(evt) {
	var name = evt.currentTarget.getAttribute('request') + '-requested';
	this.observer.publish(new voyc.Note(name, 'header', {}));
}

Header.prototype.onSetupComplete = function(note) {
}

Header.prototype.refresh = function(note) {
	this.uname = note.payload.uname || '';

	// refresh header
	switch (getAuth()) {
		case 'anonymous'   :
			voyc.$('loggedinuser').innerHTML = '';
			voyc.$('headeruser').style.display = 'table-cell';
			voyc.$('headerlogin').style.display = 'inline-block';
			voyc.$('headerlogout').style.display = 'none';
		break;
		case 'registered'  :
			voyc.$('loggedinuser').innerHTML = this.uname;
			voyc.$('headeruser').style.display = 'table-cell';
			voyc.$('headerlogin').style.display = 'none';
			voyc.$('headerlogout').style.display = 'inline-block';
		break;
		case 'resetpending':
			voyc.$('loggedinuser').innerHTML = this.uname;
			voyc.$('headeruser').style.display = 'table-cell';
			voyc.$('headerlogin').style.display = 'none';
			voyc.$('headerlogout').style.display = 'inline-block';
		break;
		case 'verified'    :
			voyc.$('loggedinuser').innerHTML = this.uname;
			voyc.$('headeruser').style.display = 'table-cell';
			voyc.$('headerlogin').style.display = 'none';
			voyc.$('headerlogout').style.display = 'inline-block';
		break;
		case 'emailpending':
			voyc.$('loggedinuser').innerHTML = this.uname;
			voyc.$('headeruser').style.display = 'table-cell';
			voyc.$('headerlogin').style.display = 'none';
			voyc.$('headerlogout').style.display = 'inline-block';
		break;
	}
	
	// refresh dropdown user menu

	// enable buttons
	var elems = document.querySelectorAll('[request]');
	var elem, svc;
	var self = this;
	for (i=0; i<elems.length; i++) {
		elem = elems[i];
		svc = elem.getAttribute('request');
		elem.disabled = !isSvcAllowed(svc);
	}
}
