/**
 * class voyc.Scores
 * @constructor
 * Manage the scores for one user
 */
voyc.Scores = function() {
	if (voyc.Scores._instance) return voyc.Scores._instance;
	voyc.Scores._instance = this;

	this.scores = [];
}

voyc.Scores.prototype.clear = function() {
	this.scores = [];
}

voyc.Scores.prototype.hasScores = function() {
	return (this.scores.length > 0);
}

voyc.Scores.prototype.set = function(testid, factorid, raw, pct) {
	var score = this.find(testid, factorid);
	if (!score) {
		score = {testid:testid, factorid:factorid, raw: 0, pct:0};
		this.scores.push(score);
	}
	score.raw = raw;
	score.pct = pct;
}

voyc.Scores.prototype.get = function(testid, factorid) {
	var score = this.find(testid, factorid);
	if (score) {
		return {
			raw: score.raw,
			pct: score.pct,
		}
	}
	//else return null;
	else {
		return {
			raw: -1,
			pct: -1,
		}
	}
}

voyc.Scores.prototype.find = function(testid, factorid) {
	var score;
	for (var i=0; i<this.scores.length; i++) {
		score = this.scores[i];
		if (score.testid == testid && score.factorid == factorid) {
			return score;
		}
	}
	return null;
}

voyc.Scores.prototype.calcGlobals = function(testcode) {
	var fact = {};
	var score = {};
	for (var factorname in voyc.data.factors[testcode]) {
		fact = voyc.data.factors[testcode][factorname];
		if (fact.components) {
			score = this.get(fact.test, fact.factor);
			if (voyc.data.quizz[testcode].answertype == 'stanine') {
				score.raw = this.calcGlobalRaw(fact);
				score.pct = voyc.pctFromStanine(score.raw);
			}
			else {
				score.pct = this.calcGlobal(fact);
			}
			this.set(fact.test, fact.factor, score.pct, score.pct);
		}
	}
}

voyc.Scores.prototype.calcGlobal = function(fact) {
	var compscore = {};
	var cnt = 0;
	var tot = 0;
	var factorname = '';
	for (var i=0; i<fact.components.length; i++) {
		factorname = fact.components[i];
		compscore = this.get(fact.test, factorname);
		tot += compscore.pct;
		cnt++;
	}
	return Math.round(tot/cnt);
}

voyc.Scores.prototype.calcGlobalRaw = function(fact) {
	var compscore = {};
	var cnt = 0;
	var tot = 0;
	var factorname = '';
	for (var i=0; i<fact.components.length; i++) {
		factorname = fact.components[i];
		compscore = this.get(fact.test, factorname);
		tot += compscore.raw;
		cnt++;
	}
	return Math.round(tot/cnt);
}

voyc.Scores.prototype.reorder = function() {
	var options = {};
	options.orderby = 'test';
	if (options.orderby == 'significance') {
		this.scores.sort(function(a, b){return b.offset-a.offset});
	}
	else if (options.orderby == 'test') {
		this.scores.sort(function(a, b){return a.order-b.order});
	}
};

// index of exampleusers matches index of pct
voyc.data.exampleusers = ['alanwatts', 'carljung', 'elonmusk'];
voyc.data.examples = {
	'temperament': {
		'extravert'           : { pct:[ 70, 40, 20], answers:[ 1, 8,15,22,29,36,43,50,57,64] },                                // 10
		'sensible'            : { pct:[ 15, 70, 60], answers:[ 2, 9,16,23,30,37,44,51,58,65, 3,10,17,24,31,38,45,52,59,66] },  // 20
		'thinking'            : { pct:[ 40,  0, 70], answers:[ 4,11,18,25,32,39,46,53,60,67, 5,12,19,26,33,40,47,54,61,68] },  // 20
		'judicious'           : { pct:[ 80, 35,  5], answers:[ 6,13,20,27,34,41,48,55,62,69, 7,14,21,28,35,42,49,56,63,70] },  // 20
	},
	'motivation': {       // the order here is the order of the original paper answer key.  The order in factors.js is the display order.
		'definitions'         : { pct:[ 20, 80, 50], answers:[ 3, 4,19,39,82,110] },
		'efficiency'          : { pct:[ 40, 20, 80], answers:[ 8,46,47,58,59,83,84] },
		'authority'           : { pct:[ 70, 40, 20], answers:[15,16,17,30,35,54,55,56,57,116] },
		'wariness'            : { pct:[ 20, 70, 40], answers:[18,36,37,38,67,68,118] },
		'feelings'            : { pct:[ 60, 20, 70], answers:[1,2,7,77,78,79,81,107,108,109] },
		'curiosity'           : { pct:[ 70, 60, 20], answers:[9,20,44,45,48,49,85,86,87,102] },
		'resistance'          : { pct:[ 30, 70, 60], answers:[21,22,23,24,50,80,90,91,98,119] },
		'tools'               : { pct:[ 50, 30, 70], answers:[5,6,103,104,105] },
		'affection'           : { pct:[ 90, 50, 30], answers:[26,27,28,29,42,63,112,113,114,115] },
		'pressure'            : { pct:[ 10, 90, 50], answers:[60,61,62,99,100,101,106,111,120,121] },
		'avoidance'           : { pct:[ 60, 10, 90], answers:[13,14,25,64,69,70,92,93,94,95] },
		'disappointment'      : { pct:[100, 60, 10], answers:[43,65,66,96,97,117] },
		'acclaim'             : { pct:[  0,100, 60], answers:[10,11,12,31,32,33,34,72,73,74] },
		'direct'              : { pct:[ 50,  0,100], answers:[40,41,51,52,53,71,75,76,88,89] },
	},
	'personality': {
		'warm'                : { pct:[ 40, 60, 20], answers:[] },
		'abstract'            : { pct:[ 90, 80, 50], answers:[] },
		'stable'              : { pct:[ 20, 90, 40], answers:[] },
		'dominant'            : { pct:[ 40, 20, 90], answers:[] },
		'lively'              : { pct:[ 70, 40, 20], answers:[] },
		'rule'                : { pct:[ 20, 70, 40], answers:[] },
		'bold'                : { pct:[ 60, 20, 70], answers:[] },
		'sensitive'           : { pct:[ 70, 60, 20], answers:[] },
		'vigilant'            : { pct:[ 10, 70, 60], answers:[] },
		'abstracted'          : { pct:[ 40, 10, 70], answers:[] },
		'private'             : { pct:[100, 40, 10], answers:[] },
		'apprehensive'        : { pct:[ 10, 80, 40], answers:[] },
		'open'                : { pct:[ 60, 10, 80], answers:[] },
		'selfreliant'         : { pct:[ 70, 60, 10], answers:[] },
		'perfectionist'       : { pct:[ 30, 70, 60], answers:[] },
		'tense'               : { pct:[ 60, 30, 70], answers:[] },
	},
	'eji': {
		'aware'               : { pct:[ 80, 38, 77], answers:[] },
		'identifyown'         : { pct:[ 29, 80, 18], answers:[] },
		'identifyothers'      : { pct:[ 47, 29, 80], answers:[] },
		'manageown'           : { pct:[ 91, 47, 29], answers:[] },
		'manageothers'        : { pct:[ 31, 91, 47], answers:[] },
		'problemsolving'      : { pct:[ 60, 31, 91], answers:[] },
		'express'             : { pct:[ 77, 60, 31], answers:[] },
		'impression'          : { pct:[ 18, 77, 60], answers:[] },
	},
	'soi': { // stanine
		'CFU'                 : { pct:[ 18, 71, 42], answers:[] },
		'CFC'                 : { pct:[ 49, 18, 71], answers:[] },
		'CFS'                 : { pct:[ 77, 49, 18], answers:[] },
		'CFT'                 : { pct:[ 25, 77, 49], answers:[] },
		'CSR'                 : { pct:[ 62, 25, 77], answers:[] },
		'CMUr'                : { pct:[ 89, 62, 25], answers:[] },
		'CMUm'                : { pct:[ 12, 89, 62], answers:[] },
		'CMR'                 : { pct:[ 45, 12, 89], answers:[] },
		'CMS'                 : { pct:[ 83, 45, 12], answers:[] },
		'MFU'                 : { pct:[ 22, 83, 45], answers:[] },
		'MSUv'                : { pct:[ 59, 22, 83], answers:[] },
		'MSSv'                : { pct:[ 91, 59, 22], answers:[] },
		'MSUa'                : { pct:[ 29, 91, 59], answers:[] },
		'MSSa'                : { pct:[ 39, 29, 91], answers:[] },
		'MSI'                 : { pct:[ 67, 39, 29], answers:[] },
		'MMI'                 : { pct:[ 15, 67, 39], answers:[] },
		'EFU'                 : { pct:[ 53, 15, 67], answers:[] },
		'EFC'                 : { pct:[ 80, 53, 15], answers:[] },
		'ESC'                 : { pct:[ 22, 80, 53], answers:[] },
		'ESS'                 : { pct:[ 55, 22, 80], answers:[] },
		'NFU'                 : { pct:[ 88, 55, 22], answers:[] },
		'NSS'                 : { pct:[ 20, 88, 55], answers:[] },
		'NST'                 : { pct:[ 50, 20, 88], answers:[] },
		'NSI'                 : { pct:[ 90, 50, 20], answers:[] },
		'DFU'                 : { pct:[ 17, 90, 50], answers:[] },
		'DMU'                 : { pct:[ 42, 17, 90], answers:[] },
		'DSR'                 : { pct:[ 71, 42, 17], answers:[] },
	},
	'learningstyle': { // pct
		'visual'              : { pct:[ 20, 80, 35], answers:[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
		'auditory'            : { pct:[ 50, 10, 35], answers:[11,12,13,14,15,16,17,18,19,20] },
		'kinesthetic'         : { pct:[ 30, 10, 30], answers:[21,22,23,24,25] },
	}

};
