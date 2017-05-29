/**
 * class voyc.DrZinn
 * @constructor
 * A singleton object
 */
voyc.DrZinn = function () {
	if (voyc.DrZinn._instance) return voyc.DrZinn._instance;
	voyc.DrZinn._instance = this;

	this.options = {
		ansblocksize:5
	}
	this.openquizzid = '';  // duplicate of separately managed field in drzinnview
	this.answers = [];
	this.answersDirty = [];
	this.answersState = [];  // notstarted, inprogress, completed
	this.setup();
}

voyc.DrZinn.prototype.setup = function () {
	this.observer = new voyc.Observer();
	this.user = new voyc.User(this.observer);
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
	this.observer.subscribe('nav-requested'       ,'drzinn' ,function(note) { self.onNavRequested        (note); });

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
	if (note.payload['status'] == 'ok' && note.payload['uname']) {
		this.readScore();
	}
	else {
		this.scores.clear();
		this.observer.publish(new voyc.Note('scores-received', 'drzinn', {}));
	}
}

voyc.DrZinn.prototype.readScore = function() {
	var svcname = 'getscore';
	var data = {};
	data['si'] = voyc.getSessionId();
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			// consolidate, codify: name, code, id, title, display, for test and factor, page title, dbid
			var s = response['scores'];
			var a = {};
			var testname = '';
			var factorname = '';
			var raw = 0;
			var pct = 0;
			voyc.drzinn.scores.clear();
			for (var tid in s) {
				var testname = self.getTestNameForCode(tid);
				a = JSON.parse(s[tid]);
				for (var fcode in a) {
					factorname = self.getFactorNameForCode(testname,fcode);
					raw = a[fcode][0];
					pct = a[fcode][1];
					voyc.drzinn.scores.scores.push({testid:testname, factorid:factorname, raw:raw, pct:pct});
				}
			}
			self.scores.initScores();
			self.observer.publish(new voyc.Note('scores-received', 'drzinn', response));
		}
		else {
		}
	});
	this.observer.publish(new voyc.Note('getscore-posted', 'drzinn', {}));
}

voyc.DrZinn.prototype.getTestNameForCode = function(code) {
	var name = '';
	for (var n in voyc.data.tests) {
		if (voyc.data.tests[n].code == code) {
			name = n;
			break;
		}
	}
	return name;
}

voyc.DrZinn.prototype.getFactorNameForCode = function(testname, code) {
	name = '';
	for (var n in voyc.data.factors[testname]) {
		if (voyc.data.factors[testname][n].code == code) {
			name = n;
			break;
		}
	}
	return name;
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
	this.readAnswers();
}

voyc.DrZinn.prototype.onAnswerSubmitted = function(note) {
	var q = note.payload['q'];
	var a = note.payload['a'];
	
// this has been moved to drzinnview
//	this.answers[this.openquizzid][q-1] = a;
//	this.answersDirty[this.openquizzid][q-1] = true;
	
	this.writeAnswers(false);
}

voyc.DrZinn.prototype.collectDirty = function() {
	var o = {};
	var cnt = 0;
	for (var i=0; i<this.answersDirty[this.openquizzid].length; i++) {
		if (this.answersDirty[this.openquizzid][i]) {
			o[i] = this.answers[this.openquizzid][i];
			cnt++;
		}
	}
	return {'cnt':cnt, 'o':o};
}

voyc.DrZinn.prototype.setDirty = function(answers, dirty) {
	for (var q in answers['o']) {
		this.answersDirty[this.openquizzid][q] = dirty;
	}
}
	
voyc.DrZinn.prototype.writeAnswers = function(force) {
	var answers = this.collectDirty();

	if ((answers['cnt'] >= this.options.ansblocksize) || ((answers['cnt'] > 0) && force)) {
		var svcname = 'setanswer';
		var data = {};
		data['si'] = voyc.getSessionId();
		data['tid'] = voyc.data.tests[this.openquizzid].code;
		data['ans'] = JSON.stringify(answers['o']);
		var self = this;
		this.comm.request(svcname, data, function(ok, response, xhr) {
			if (!ok) {
				response = { 'status':'system-error'};
			}
			if (response['status'] == 'ok') {
				self.observer.publish(new voyc.Note('setanswer-returned', 'drzinn', response));
				if (response['scoresupdated']) {
					self.readScore();
				}
			}
			else {
				self.setDirty(answers, true);
			}
		});
		this.observer.publish(new voyc.Note('setanswer-posted', 'drzinn', {}));
		this.setDirty(answers, false);
	}
}

voyc.DrZinn.prototype.readAnswers = function() {
	var svcname = 'getanswer';
	var data = {};
	data['si'] = voyc.getSessionId();
	data['tid'] = voyc.data.tests[this.openquizzid].code;
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			var s = response['answers'];
			var a = JSON.parse(s);
			for (var q in a) {
				self.answers[self.openquizzid][q] = a[q];
			}
		}
		else {
		}
		self.observer.publish(new voyc.Note('answers-received', 'drzinn', response));
	});
	this.observer.publish(new voyc.Note('getanswer-posted', 'drzinn', {}));
}

voyc.DrZinn.prototype.onNavRequested = function(note) {
	if (this.openquizzid) {
		this.writeAnswers(true);
		this.openquizzid = '';
	}
}

/* on startup */
window.addEventListener('load', function(evt) {
	voyc.drzinn = new voyc.DrZinn();
}, false);
