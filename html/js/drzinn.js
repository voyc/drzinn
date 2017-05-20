/**
 * class voyc.DrZinn
 * @param {Object=} observer
 * @constructor
 * A singleton object
 */
voyc.DrZinn = function () {
	if (voyc.DrZinn._instance) return voyc.DrZinn._instance;
	voyc.DrZinn._instance = this;
	this.setup();
}

voyc.DrZinn.prototype.setup = function () {
	this.observer = new voyc.Observer();
	new voyc.User(this.observer);
	new voyc.Account(this.observer);
	new voyc.AccountView(this.observer);
	new voyc.DrZinnView(this.observer);

	// set drawPage method as the callback in BrowserHistory object
	//var self = this;
	//new voyc.BrowserHistory('name', function(pageid) {
	//	var event = pageid.split('-')[0];
	//	self.observer.publish(new voyc.Note(event+'-requested', 'model', {page:pageid}));
	//});

	// server communications
	var url = '/svc/';
	if (window.location.origin == 'file://') {
		url = 'http://model.hagstrand.com/svc';  // for local testing
	}
	this.comm = new voyc.Comm(url, 'acomm', 2, true);

	// attach handlers to HTML elements in the base html
//	this.attachHandlers();

	// attach app events
	var self = this;
	this.observer.subscribe('setup-complete'      ,'model' ,function(note) { self.onSetupComplete       (note); });
	this.observer.subscribe('relogin-received'    ,'model' ,function(note) { self.onReloginReceived     (note); });
	this.observer.subscribe('profile-requested'   ,'model' ,function(note) { self.onProfileRequested    (note); });
	this.observer.subscribe('profile-submitted'   ,'model' ,function(note) { self.onProfileSubmitted    (note); });
	this.observer.subscribe('setprofile-posted'   ,'model' ,function(note) { self.onSetProfilePosted    (note); });
	this.observer.subscribe('setprofile-received' ,'model' ,function(note) { self.onSetProfileReceived  (note); });
	this.observer.subscribe('getprofile-received' ,'model' ,function(note) { self.onGetProfileReceived  (note); });

//	(new voyc.BrowserHistory).nav('home');

	this.observer.publish(new voyc.Note('setup-complete', 'model', {}));
	//(new voyc.3).nav('home');
}

voyc.DrZinn.prototype.onSetupComplete = function(note) {
}

voyc.DrZinn.prototype.onReloginReceived = function(note) {

	peg.scores = new Scores();
	peg.scores.read('joe');

	(new voyc.BrowserHistory).nav('home');
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
		self.observer.publish(new voyc.Note('getprofile-received', 'model', response));
	});
	this.observer.publish(new voyc.Note('getprofile-posted', 'model', {}));
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

		self.observer.publish(new voyc.Note('setprofile-received', 'model', response));

		if (response['status'] == 'ok') {
			console.log('setprofile success' + response['message']);
		}
		else {
			console.log('setprofile failed');
		}
	});

	this.observer.publish(new voyc.Note('setprofile-posted', 'model', {}));
}

voyc.DrZinn.prototype.onSetProfilePosted = function(note) {
	console.log('setprofile posted');
}

voyc.DrZinn.prototype.onSetProfileReceived = function(note) {
	console.log('setprofile received');
}

/* on startup */
window.addEventListener('load', function(evt) {
	new voyc.DrZinn();
}, false);
