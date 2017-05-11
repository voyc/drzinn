/*
	class Modal
	Singleton object.
	Represents the set of modal dialogs for user authentication.
*/
Modal = function (observer) {
	this.observer = observer;

	// attach app events
	var self = this;
	this.observer.subscribe('login-requested'          ,'modal' ,function(note) { (new voyc.Minimal).openPopup('login');          });
	this.observer.subscribe('register-requested'       ,'modal' ,function(note) { (new voyc.Minimal).openPopup('register');       });
	this.observer.subscribe('verify-requested' ,'modal' ,function(note) { (new voyc.Minimal).openPopup('verify'); });
	this.observer.subscribe('forgotpassword-requested' ,'modal' ,function(note) { (new voyc.Minimal).openPopup('forgotpassword'); });
	this.observer.subscribe('resetpassword-requested'  ,'modal' ,function(note) { (new voyc.Minimal).openPopup('resetpassword');  });
	this.observer.subscribe('changepassword-requested' ,'modal' ,function(note) { (new voyc.Minimal).openPopup('changepassword'); });
	this.observer.subscribe('changeusername-requested' ,'modal' ,function(note) { (new voyc.Minimal).openPopup('changeusername'); });
	this.observer.subscribe('changeemail-requested'    ,'modal' ,function(note) { (new voyc.Minimal).openPopup('changeemail');    });
	this.observer.subscribe('verifyemail-requested'    ,'modal' ,function(note) { (new voyc.Minimal).openPopup('verifyemail');    });

	this.observer.subscribe('login-posted'             ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('login-received'           ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('register-posted'          ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('register-received'        ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('verify-posted'    ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('verify-received'  ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('forgotpassword-posted'    ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('forgotpassword-received'  ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('resetpassword-posted'     ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('resetpassword-received'   ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('changepassword-posted'    ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('changepassword-received'  ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('changeusername-posted'    ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('changeusername-received'  ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('changeemail-posted'       ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('changeemail-received'     ,'modal' ,function(note) { self.onSvcReceived  (note);});
	this.observer.subscribe('verifyemail-posted'       ,'modal' ,function(note) { self.onSvcPosted    (note);});
	this.observer.subscribe('verifyemail-received'     ,'modal' ,function(note) { self.onSvcReceived  (note);});

	// attach UI events
	var elems = document.querySelectorAll('[type=submit]');
	var elem, dialog;
	var self = this;
	for (i=0; i<elems.length; i++) {
		elem = elems[i];
		dialog = voyc.findParentWithTag(elem, 'form');
		dialog.addEventListener('submit', function(evt) {
			evt.preventDefault();
			self.onSubmitClick(evt);
		}, false);
	}
}

Modal.prototype.onSubmitClick = function(evt) {
	var form = evt.currentTarget;
	var svc = form.id;
	var inputs = form.elements;
	var note = svc + '-submitted';
	this.observer.publish(new voyc.Note(note, 'modal', {svc:svc, inputs:inputs}));
	voyc.$('dialog-msg').innerHTML = '';
}

Modal.prototype.onLoginPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onLoginReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}

Modal.prototype.onRegisterPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onRegisterReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}

Modal.prototype.onVerifyPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onVerifyReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}

Modal.prototype.onForgotPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onForgotReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}

Modal.prototype.onResetPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onResetReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}

Modal.prototype.onSvcPosted = function(note) {
	voyc.wait();
}

Modal.prototype.onSvcReceived = function(note) {
	if (note.payload.status == 'ok') {
		voyc.closePopup();
	}
	else {
		voyc.killWait();
		voyc.$('dialog-msg').innerHTML = note.payload.status;
	}
}
