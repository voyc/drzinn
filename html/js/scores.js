/**
 * class voyc.Scores
 * @constructor
 * Manage the scores for one user
 */
voyc.Scores = function() {
	this.scores = [];
}

voyc.Scores.prototype.set = function(testid, factorid, rawscore) {
	var score = this.find(testid, factorid);
	if (!score) alert(testid + ' ' + factorid);
	score.raw = rawscore;
	this.calcScore(score);
}

voyc.Scores.prototype.get = function(testid, factorid) {
	var score = this.find(testid, factorid);
	if (score) {
		return {
			raw: score.raw,
			pct: score.pct,
			//offset: score.offset,
			//dir: score.dir,
			//range: score.range,
		}
	}
	//else return null;
	else {
		return {
			raw: -1,
			pct: -1,
			//offset: 0,
			//dir: 0,
			//range: 0,
		}
	}
}

voyc.Scores.prototype.read = function(name) {
	// load scores for current user
	//this.scores = exampleScores[name];
	//this.initScores();
}

voyc.Scores.prototype.clear = function() {
	// load scores for current user
	this.scores = [];
	//this.initScores();
}

voyc.Scores.prototype.write = function() {
	// save scores for current user
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

voyc.Scores.prototype.initScores = function() {
	//for (var i=0; i<this.scores.length; i++) {
	//	score = this.scores[i];
	//	this.calcScore(score);
	//}
	//for (var i=0; i<this.scores.length; i++) {
	//	score = this.scores[i];
	//	if (score.components) {
	//		score.pct = this.calcGlobal(score);
	//	}
	//}
	var fact = {};
	var score = {};
	console.log([this.scores.length]);
	for (var testname in voyc.data.factors) {
		for (var factorname in voyc.data.factors[testname]) {
			fact = voyc.data.factors[testname][factorname];
			if (fact.components) {
				score = this.get(fact.test, fact.factor);
				score.pct = this.calcGlobal(fact);
				this.scores.push({testid:fact.test, factorid:fact.factor, raw:score.pct, pct:score.pct});
				console.log([fact.test, fact.factor, score.pct]);
			}
		}
	}
	return null;
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

voyc.Scores.prototype.calcScore = function(score) {
	var max = voyc.data.tests[score.testid].maxscore;
	var mean = 50;
	//score.pct = Math.round((score.raw / max) * 100);
	var offset = mean - score.pct;
	score.dir = (offset > 0) ? 1 : (offset < 0) ? -1 : 0;
	score.offset = Math.abs(offset);
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
		'definitions'         : { pct:[ 20, 80, 50], answers:[ 3, 4,19,39,82,110] },                  //  6
		'efficiency'          : { pct:[ 40, 20, 80], answers:[ 8,46,47,58,59,83,84] },                //  7
		'authority'           : { pct:[ 70, 40, 20], answers:[15,16,17,30,35,54,55,56,57,116] },      // 10
		'wariness'            : { pct:[ 20, 70, 40], answers:[18,36,37,38,67,68,118] },               //  7
		'feelings'            : { pct:[ 60, 20, 70], answers:[1,2,7,77,78,79,81,107,108,109] },       // 10
		'curiosity'           : { pct:[ 70, 60, 20], answers:[9,20,44,45,48,49,85,86,87,102] },       // 10
		'resistance'          : { pct:[ 30, 70, 60], answers:[21,22,23,24,50,80,90,91,98,119] },      // 10
		'tools'               : { pct:[ 50, 30, 70], answers:[5,6,103,104,105] },                     //  5
		'affection'           : { pct:[ 90, 50, 30], answers:[26,27,28,29,42,63,112,113,114,115] },   // 10
		'pressure'            : { pct:[ 10, 90, 50], answers:[60,62,99,100,101,106,111,120,121] },    //  9
		'avoidance'           : { pct:[ 60, 10, 90], answers:[13,14,25,64,70,92,93,94,95] },          //  9
		'disappointment'      : { pct:[100, 60, 10], answers:[43,65,66,96,97,117] },                  //  6
		'acclaim'             : { pct:[ 00,100, 60], answers:[10,11,12,31,32,33,34,72,73,74] },       // 10
		'direct'              : { pct:[ 50, 00,100], answers:[40,41,51,52,53,71,75,76,88,89] },       // 10
	},
	'personality': {
		'warm'                : { pct:[  4,  6,  2], answers:[] },
		'abstract'            : { pct:[  9,  8,  5], answers:[] },
		'stable'              : { pct:[  2,  9,  4], answers:[] },
		'dominant'            : { pct:[  4,  2,  9], answers:[] },
		'lively'              : { pct:[  7,  4,  2], answers:[] },
		'rule'                : { pct:[  2,  7,  4], answers:[] },
		'bold'                : { pct:[  6,  2,  7], answers:[] },
		'sensitive'           : { pct:[  7,  6,  2], answers:[] },
		'vigilant'            : { pct:[  1,  7,  6], answers:[] },
		'abstracted'          : { pct:[  4,  1,  7], answers:[] },
		'private'             : { pct:[  8,  4,  1], answers:[] },
		'apprehensive'        : { pct:[  1,  8,  4], answers:[] },
		'open'                : { pct:[  6,  1,  8], answers:[] },
		'selfreliant'         : { pct:[  7,  6,  1], answers:[] },
		'perfectionist'       : { pct:[  3,  7,  6], answers:[] },
		'tense'               : { pct:[  6,  3,  7], answers:[] },
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
	'soi': {
		'CFU'                 : { pct:[ 18, 71, 42], answers:[] },
		'CFC'                 : { pct:[ 49, 18, 71], answers:[] },
		'CFS'                 : { pct:[ 77, 49, 18], answers:[] },
		'CFT'                 : { pct:[ 25, 77, 49], answers:[] },
		'CSR'                 : { pct:[ 62, 25, 77], answers:[] },
		'CMU_R'               : { pct:[ 89, 62, 25], answers:[] },
		'CMU_M'               : { pct:[ 12, 89, 62], answers:[] },
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
	}
};
