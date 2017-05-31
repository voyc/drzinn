/**
	class voyc.Answers
	@constructor
	singleton
	
	The question sequence number is one-based.
	The question index is zero-based.
	The zero-based index is used internally here and also in the database.
	Clients using get() and put() use a one-based sequence number.
	In the database and in this.answers, the question 
*/
voyc.Answers = function () {
	if (voyc.Answers._instance) return voyc.Answers._instance;
	voyc.Answers._instance = this;

	this.answers = {};
	this.dirty = {};

	this.setup();
}

voyc.Answers.prototype.setup = function() {
	for (testcode in voyc.data.tests) {
		this.answers[testcode] = [];
		this.dirty[testcode] = [];
	}
}

voyc.Answers.prototype.clear = function() {
	this.setup();
}

voyc.Answers.prototype.clearDirty = function() {
	for (testcode in voyc.data.tests) {
		this.dirty[testcode] = [];
	}
}

/**
	Set one answer.
	@param {string} testcode - Name of test.
	@param {number} q - A one-based sequence number.
	@param {number} a - A one-based sequence number.
*/
voyc.Answers.prototype.set = function(testcode,q,a) {
	var qndx = q - 1;
	this.answers[testcode][qndx] = a;
	this.dirty[testcode][qndx] = true;
//	if (isComplete) {
//		this.calcScores();
//	}
//	this.observer.publish(new voyc.Note('answer-submitted', 'drzinnview', {'q':q, 'a':a}));
}

/**
	Return one answer.
	@param {string} testcode - Name of test.
	@param {number} q - A one-based sequence number.
*/
voyc.Answers.prototype.get = function(testcode,q) {
	var qndx = q - 1;
	var a = this.answers[testcode][qndx];
	if (!Boolean(a)) {
		a = 0;
	}
	return a;
}

/**
	Return the complete array of answers for a test.
	@param {string} testcode - Name of test.
*/
voyc.Answers.prototype.collect = function(testcode) {
	return this.answers[testcode];
}

/**
	Return an array of answers that have been marked dirty.
	@param {string} testcode - Name of test.
*/
voyc.Answers.prototype.collectDirty = function(testcode) {
	var o = {};
	var cnt = 0;
	for (var i=0; i<this.dirty[testcode].length; i++) {
		if (this.dirty[testcode][i]) {
			o[i] = this.answers[testcode][i];
			cnt++;
		}
	}
	return {'cnt':cnt, 'o':o};
}

/**
	Mark multiple answers as either dirty or clean.
	@param {string} testcode - Name of test.
	@param {Object} answers - Array of answers, as returned from collectDirty()
	@param {boolean} dirty - True or false.
*/
voyc.Answers.prototype.markDirty = function(testcode, answers, dirty) {
	for (var q in answers['o']) {
		this.dirty[testcode][q] = dirty;
	}
}

/**
	Count answers for one test.
	@param {string} testcode - Name of test.
*/
voyc.Answers.prototype.count = function(testcode) {
	var cnt = 0;
	var test = voyc.data.quizz[testcode].test;
	for (var i=0; i<test.length; i++) {
		if (this.answers[testcode][i]) {
			cnt++;
		}
	}
	return cnt;
}

/**
	Return state string for one test.
	@param {string} testcode - Name of test.
*/
voyc.Answers.prototype.getState = function(testcode) {
	var state = 'notstarted';
	var cq = voyc.countQuestions(testcode);
	var ca = this.count(testcode);
	if (ca > 0) {
		if (ca == cq) {
			state = 'complete';
		}
		else {
			state = 'inprogress';
		}
	}
	return state;
}
