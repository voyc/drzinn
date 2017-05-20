/**
 * class voyc.DrZinn
 * @param {Object=} observer
 * @constructor
 * A singleton object
 */
voyc.DrZinn = function () {
	if (voyc.DrZinn._instance) return voyc.DrZinn._instance;
	voyc.DrZinn._instance = this;

	this.options = {
		ansblocksize:5
	}
	this.openquizzid = '';
	this.answers = {};
	this.answersDirty = {};
	this.scores = {};
	this.setup();
}

voyc.DrZinn.prototype.setup = function () {
	this.observer = new voyc.Observer();
	new voyc.User(this.observer);
	new voyc.Account(this.observer);
	new voyc.AccountView(this.observer);
	new voyc.DrZinnView(this.observer);
	this.scores = new voyc.Scores();

	// server communications
	var url = '/svc/';
	if (window.location.origin == 'file://') {
		url = 'http://drzinn.hagstrand.com/svc';  // for local testing
	}
	this.comm = new voyc.Comm(url, 'acomm', 2, true);

	// attach app events
	var self = this;
	this.observer.subscribe('setup-complete'      ,'drzinn' ,function(note) { self.onSetupComplete       (note); });
	this.observer.subscribe('relogin-received'    ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('login-received'      ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('logout-received'     ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('restart-anonymous'   ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('quizz-requested'     ,'drzinn' ,function(note) { self.onQuizzRequested      (note); });
	this.observer.subscribe('answer-submitted'    ,'drzinn' ,function(note) { self.onAnswerSubmitted     (note); });

	this.observer.subscribe('profile-requested'   ,'drzinn' ,function(note) { self.onProfileRequested    (note); });
	this.observer.subscribe('profile-submitted'   ,'drzinn' ,function(note) { self.onProfileSubmitted    (note); });
	this.observer.subscribe('setprofile-posted'   ,'drzinn' ,function(note) { self.onSetProfilePosted    (note); });
	this.observer.subscribe('setprofile-received' ,'drzinn' ,function(note) { self.onSetProfileReceived  (note); });
	this.observer.subscribe('getprofile-received' ,'drzinn' ,function(note) { self.onGetProfileReceived  (note); });

	this.observer.publish(new voyc.Note('setup-complete', 'drzinn', {}));
}

voyc.DrZinn.prototype.onSetupComplete = function(note) {
}

voyc.DrZinn.prototype.onLoginReceived = function(note) {
	if (note.payload.status == 'ok' && note.payload.uname) {
		this.scores.read(note.payload.uname);
	}
	else {
		this.scores.clear();
	}
	this.observer.publish(new voyc.Note('scores-received', 'drzinn', {}));
}

voyc.DrZinn.prototype.onProfileRequested = function(note) {
	var svcname = 'getprofile';
	var data = {};
	data['si'] = voyc.getSessionId();
	
	// call svc
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		self.observer.publish(new voyc.Note('getprofile-received', 'drzinn', response));
	});
	this.observer.publish(new voyc.Note('getprofile-posted', 'drzinn', {}));
}

voyc.DrZinn.prototype.onGetProfileReceived = function(note) {
	var response = note.payload;
	if (response['status'] == 'ok') {
		console.log('getprofile success');
		voyc.$('gender').value = response['gender'];
		voyc.$('photo' ).value = response['photo' ];
		voyc.$('phone' ).value = response['phone' ];
	}
	else {
		console.log('getprofile failed');
	}
}

voyc.DrZinn.prototype.onProfileSubmitted = function(note) {
	var svcname = 'setprofile';
	var inputs = note.payload.inputs;

	// build data array of name/value pairs from user input
	var data = {};
	data['si'] = voyc.getSessionId();
	data['gender'] = inputs['gender'].value;
	data['photo' ] = inputs['photo' ].value;
	data['phone' ] = inputs['phone' ].value;
	
	// call svc
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}

		self.observer.publish(new voyc.Note('setprofile-received', 'drzinn', response));

		if (response['status'] == 'ok') {
			console.log('setprofile success' + response['message']);
		}
		else {
			console.log('setprofile failed');
		}
	});

	this.observer.publish(new voyc.Note('setprofile-posted', 'drzinn', {}));
}

voyc.DrZinn.prototype.onSetProfilePosted = function(note) {
	console.log('setprofile posted');
}

voyc.DrZinn.prototype.onSetProfileReceived = function(note) {
	console.log('setprofile received');
}

voyc.DrZinn.prototype.onQuizzRequested = function(note) {
	this.openquizzid = note.payload['quizzid'];

	this.answers[this.openquizzid] = [];
	this.answersDirty[this.openquizzid] = [];
}

voyc.DrZinn.prototype.onAnswerSubmitted = function(note) {
	var q = note.payload.q;
	var a = note.payload.a;
	
	this.answers[this.openquizzid][q-1] = a;
	this.answersDirty[this.openquizzid][q-1] = true;
	
	this.flushToServer();
}

voyc.DrZinn.prototype.collectDirty = function() {
	var a = [];
	for (var i=0; i<this.answersDirty[this.openquizzid].length; i++) {
		if (this.answersDirty[this.openquizzid][i]) {
			a.push({i:this.answers[this.openquizzid][i]});
		}
	}
	return a;
}

voyc.DrZinn.prototype.setDirty = function(answers, dirty) {
	for (var i=0; i<answers.length; i++) {
		var q = answers[i];
		this.answersDirty[this.openquizzid][q] = dirty;
	}
}
	
voyc.DrZinn.prototype.flushToServer = function(force) {
	var answers = this.collectDirty();
	if ((answers.length < this.options.ansblocksize) && !force) {
		return;
	} 
	
	var svcname = 'setanswer';
	var data = {};
	data.tid = this.openquizzid;
	data.answers = JSON.stringify(answers);
	var s = JSON.stringify(data);
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			
		}
		else {
			self.setDirty(answers, true);
		}
		self.observer.publish(new voyc.Note('setanswer-returned', 'drzinn', response));
	});
	this.observer.publish(new voyc.Note('setanswer-posted', 'drzinn', {}));
	this.setDirty(answers, false);
}

/* on startup */
window.addEventListener('load', function(evt) {
	voyc.drzinn = new voyc.DrZinn();
}, false);
