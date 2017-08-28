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
	
	this.setup();
}

voyc.DrZinn.prototype.setup = function () {
	this.observer = new voyc.Observer();
	this.user = new voyc.User(this.observer);
	new voyc.Account(this.observer);
	new voyc.AccountView(this.observer);
	new voyc.DrZinnView(this.observer);
	this.scores = new voyc.Scores();
	this.answers = new voyc.Answers();
	this.remarks = new voyc.Remarks();
	this.sync = new voyc.Sync();

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
	this.observer.subscribe('quizz-requested'     ,'drzinn' ,function(note) { self.onQuizzRequested      (note); });
	this.observer.subscribe('answer-submitted'    ,'drzinn' ,function(note) { self.onAnswerSubmitted     (note); });
	this.observer.subscribe('remark-submitted'    ,'drzinn' ,function(note) { self.onRemarkSubmitted     (note); });

	this.observer.subscribe('relogin-received'    ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('login-received'      ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('logout-received'     ,'drzinn' ,function(note) { self.onLoginReceived       (note); });
	this.observer.subscribe('restart-anonymous'   ,'drzinn' ,function(note) { self.onLoginReceived       (note); });

	this.observer.publish('setup-complete', 'drzinn', {});
}

voyc.DrZinn.prototype.onSetupComplete = function(note) {
}

voyc.DrZinn.prototype.onLoginReceived = function(note) {
	if (note.payload['status'] == 'ok' && note.payload['uname']) {
		this.readAnswers();
		this.readRemarks();
		var self = this;
		this.sync.setup(function() {
			self.observer.publish('answers-received', 'drzinn', {});
		});
		this.sync.set('answers', 'waiting');
		this.sync.set('remarks', 'waiting');
	}
	else {
		this.answers.clear();
		this.scores.clear();
		this.remarks.clear();
		this.observer.publish('answers-received', 'drzinn', {});
	}
	(new voyc.BrowserHistory).nav('home');
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

voyc.DrZinn.prototype.onQuizzRequested = function(note) {
}

voyc.DrZinn.prototype.onAnswerSubmitted = function(note) {
	var testcode = note.payload['quizz'];
	if (testcode) {
		this.writeAnswers(testcode,false);
	}
}

voyc.DrZinn.prototype.onRemarkSubmitted = function(note) {
	var testcode = note.payload['testcode'];
	var factorcode = note.payload['factorcode'];
	var remark = note.payload['remark'];
	this.writeRemark(testcode,factorcode,remark);
}

/**
	politely demand login or register
	move this to account
*/
voyc.DrZinn.prototype.requestLogin = function() {
	this.observer.publish('login-requested', 'drzinn', {});
}

voyc.DrZinn.prototype.writeAnswers = function(testcode,force) {
	var answers = this.answers.collectDirty(testcode);

	if ((answers['cnt'] >= this.options.ansblocksize) || ((answers['cnt'] > 0) && force)) {
		var svcname = 'setanswer';
		var data = {};
		data['si'] = voyc.getSessionId();
		if (!data['si']) {
			this.requestLogin();
			return;
		}
		data['tid'] = testcode;
		data['ans'] = JSON.stringify(answers.o);
		var self = this;
		this.comm.request(svcname, data, function(ok, response, xhr) {
			if (!ok) {
				response = { 'status':'system-error'};
			}
			if (response['status'] == 'ok') {
				self.observer.publish('setanswer-returned', 'drzinn', response);
			}
			else {
				self.answers.markDirty(answers, true);
			}
		});
		this.observer.publish('setanswer-posted', 'drzinn', {});
		this.answers.markDirty(answers, false);
	}
}

/**
	called only once, at startup
*/
voyc.DrZinn.prototype.readAnswers = function() {
	var svcname = 'getanswer';
	var data = {};
	data['si'] = voyc.getSessionId();
	if (!data['si']) {
		return;
	}
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			var resp = response['answers'];
			for (var testcode in resp) {
				var ans = resp[testcode];
				var pans = JSON.parse(ans);
				var q = 0;
				for (var k in pans) {
					q = parseInt(k,10) + 1;
					self.answers.set(testcode, q, pans[k]);
				}
			}
			self.answers.clearDirty();
			self.calcScores();
		}
		else {
		}
		//self.observer.publish('answers-received', 'drzinn', response);
		self.sync.set('answers', 'ready');
	});
	this.observer.publish('getanswer-posted', 'drzinn', {});
}

voyc.DrZinn.prototype.onNavRequested = function(note) {
	var testcode = note.payload.quizz;
	if (testcode) {
		this.writeAnswers(testcode,true);
	}
}

/**
	@param {?string=} testcode
*/
voyc.DrZinn.prototype.calcScores = function(testcode) {
	if (testcode) {
		if (this.answers.getState(testcode) == 'complete') {
			voyc.data.quizz[testcode].calcScores();
		}
	}
	else {
		// for every test, run the calcScores function
		for (testcode in voyc.data.tests) {
			if (this.answers.getState(testcode) == 'complete') {
				voyc.data.quizz[testcode].calcScores();
				this.scores.calcGlobals(testcode);
			}
		}
	}
}

voyc.DrZinn.prototype.writeRemark = function(testcode,factorcode,remark) {
	var svcname = 'setremark';
	var data = {};
	data['si'] = voyc.getSessionId();
	data['tid'] = testcode;
	data['fid'] = factorcode;
	data['rem'] = remark;
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			self.observer.publish('setremark-returned', 'drzinn', response);
		}
		else {
		}
	});
	this.observer.publish('setremark-posted', 'drzinn', {});
}

/**
	read all remarks for this user
	called only once, at startup
*/
voyc.DrZinn.prototype.readRemarks = function() {
	var svcname = 'getremark';
	var data = {};
	data['si'] = voyc.getSessionId();
	if (!data['si']) {
		return;
	}
	var self = this;
	this.comm.request(svcname, data, function(ok, response, xhr) {
		if (!ok) {
			response = { 'status':'system-error'};
		}
		if (response['status'] == 'ok') {
			var resp = response['remarks'];
			for (var t in resp) {
				var test = resp[t];
				for (var f in test) {
					var r = test[f];
					self.remarks.set(t, f, r);
				}
			}
		}
		else {
		}
		self.sync.set('remarks', 'ready');
	});
	this.observer.publish('getremark-posted', 'drzinn', {});
}

/* on startup */
window.addEventListener('load', function(evt) {
	voyc.drzinn = new voyc.DrZinn();
}, false);


voyc.countQuestions = function(testcode) {
	return voyc.data.quizz[testcode].test.length;
}
