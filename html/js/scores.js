// manage the scores for one user
function Scores() {
	this.scores = [];
}

Scores.prototype.set = function(testid, factorid, rawscore) {
	var score = this.find(testid, factorid);
	if (!score) alert(testid + ' ' + factorid);
	score.raw = rawscore;
	this.calcScore(score);
}

Scores.prototype.get = function(testid, factorid) {
	var score = this.find(testid, factorid);
	if (score) {
		return {
			raw: score.raw,
			pct: score.pct,
			offset: score.offset,
			dir: score.dir,
			range: score.range,
		}
	}
	else return null;
}

Scores.prototype.read = function(name) {
	// load scores for current user
	this.scores = exampleScores[name];
	this.initScores();
}

Scores.prototype.write = function() {
	// save scores for current user
}

Scores.prototype.find = function(testid, factorid) {
	var score;
	for (var i=0; i<this.scores.length; i++) {
		score = this.scores[i];
		if (score.testid == testid && score.factorid == factorid) {
			return score;
		}
	}
	return null;
}

Scores.prototype.initScores = function() {
	var score;
	for (var i=0; i<this.scores.length; i++) {
		score = this.scores[i];
		this.calcScore(score);
	}
	return null;
}

Scores.prototype.calcScore = function(score) {
	var max = peg.tests[score.testid].maxscore;
	var mean = 50;
	score.pct = Math.round((score.raw / max) * 100);
	var offset = mean - score.pct;
	score.dir = (offset > 0) ? 1 : (offset < 0) ? -1 : 0;
	score.offset = Math.abs(offset);
}

Scores.prototype.reorder = function() {
	if (peg.options.orderby == 'significance') {
		this.scores.sort(function(a, b){return b.offset-a.offset});
	}
	else if (peg.options.orderby == 'test') {
		this.scores.sort(function(a, b){return a.order-b.order});
	}
};


var exampleScores = {
	joe: [
		{ testid:'temperament',     factorid:'extravert',      raw: 7   },
		{ testid:'temperament',     factorid:'sensible',       raw: 0.5 },
		{ testid:'temperament',     factorid:'thinking',       raw: 3.5 },
		{ testid:'temperament',     factorid:'judicious',      raw: 8   },

		{ testid:'motivation',          factorid:'adventure',      raw:4    },
		{ testid:'motivation',          factorid:'personal',       raw:2    },
		{ testid:'motivation',          factorid:'definitions',    raw: 2   },
		{ testid:'motivation',          factorid:'feelings',       raw: 4   },
		{ testid:'motivation',          factorid:'efficiency',     raw: 7   },
		{ testid:'motivation',          factorid:'curiosity',      raw: 2   },
		{ testid:'motivation',          factorid:'authority',      raw: 6   },
		{ testid:'motivation',          factorid:'resistance',     raw: 7   },
		{ testid:'motivation',          factorid:'wariness',       raw: 3   },
		{ testid:'motivation',          factorid:'tools',          raw: 5   },
		{ testid:'motivation',          factorid:'affection',      raw: 9   },
		{ testid:'motivation',          factorid:'acclaim',        raw: 1   },
		{ testid:'motivation',          factorid:'pressure',       raw: 6   },
		{ testid:'motivation',          factorid:'direct',         raw:10   },
		{ testid:'motivation',          factorid:'avoidance',      raw: 0   },
		{ testid:'motivation',          factorid:'disappointment', raw: 5   },

		{ testid:'personality',        factorid:'extraversion',   raw: 7.2 },
		{ testid:'personality',        factorid:'anxiety',        raw: 1.5 },
		{ testid:'personality',        factorid:'tough',          raw: 6.5 },
		{ testid:'personality',        factorid:'independence',   raw: 6.7 },
		{ testid:'personality',        factorid:'selfcontrol',    raw: 2.6 },
		{ testid:'personality',        factorid:'warm',           raw: 4   },
		{ testid:'personality',        factorid:'abstract',       raw: 9   },
		{ testid:'personality',        factorid:'stable',         raw: 2   },
		{ testid:'personality',        factorid:'dominant',       raw: 4   },
		{ testid:'personality',        factorid:'lively',         raw: 7   },
		{ testid:'personality',        factorid:'rule',           raw: 2   },
		{ testid:'personality',        factorid:'bold',           raw: 6   },
		{ testid:'personality',        factorid:'sensitive',      raw: 7   },
		{ testid:'personality',        factorid:'vigilant',       raw: 1   },
		{ testid:'personality',        factorid:'abstracted',     raw: 4   },
		{ testid:'personality',        factorid:'private',        raw: 8   },
		{ testid:'personality',        factorid:'apprehensive',   raw: 1   },
		{ testid:'personality',        factorid:'open',           raw: 6   },
		{ testid:'personality',        factorid:'selfreliant',    raw: 7   },
		{ testid:'personality',        factorid:'perfectionist',  raw: 3   },
		{ testid:'personality',        factorid:'tense',          raw: 6   },

		{ testid:'eji',         factorid:'summary',        raw:50   },
		{ testid:'eji',         factorid:'aware',          raw:80   },
		{ testid:'eji',         factorid:'identifyown',    raw:29   },
		{ testid:'eji',         factorid:'identifyothers', raw:47   },
		{ testid:'eji',         factorid:'manageown',      raw:91   },
		{ testid:'eji',         factorid:'manageothers',   raw:31   },
		{ testid:'eji',         factorid:'problemsolving', raw:60   },
		{ testid:'eji',         factorid:'express',        raw:77   },
		{ testid:'eji',         factorid:'impression',     raw:18   },

		{ testid:'soi',         factorid:'figural',        raw:20   },
		{ testid:'soi',         factorid:'symbolic',       raw:50   },
		{ testid:'soi',         factorid:'semantic',       raw:70   },
		{ testid:'soi',         factorid:'comprehension',  raw:20   },
		{ testid:'soi',         factorid:'memory',         raw:50   },
		{ testid:'soi',         factorid:'evaluation',     raw:70   },
		{ testid:'soi',         factorid:'problemsolving', raw:50   },
		{ testid:'soi',         factorid:'creativity',     raw:70   },
		{ testid:'soi',         factorid:'CFU',            raw:18   },
		{ testid:'soi',         factorid:'CFC',            raw:49   },
		{ testid:'soi',         factorid:'CFS',            raw:77   },
		{ testid:'soi',         factorid:'CFT',            raw:25   },
		{ testid:'soi',         factorid:'CSR',            raw:62   },
		{ testid:'soi',         factorid:'CMU_R',          raw:89   },
		{ testid:'soi',         factorid:'CMU_M',          raw:12   },
		{ testid:'soi',         factorid:'CMR',            raw:45   },
		{ testid:'soi',         factorid:'CMS',            raw:83   },
		{ testid:'soi',         factorid:'MFU',            raw:22   },
		{ testid:'soi',         factorid:'MSUv',           raw:59   },
		{ testid:'soi',         factorid:'MSSv',           raw:91   },
		{ testid:'soi',         factorid:'MSUa',           raw:29   },
		{ testid:'soi',         factorid:'MSSa',           raw:39   },
		{ testid:'soi',         factorid:'MSI',            raw:67   },
		{ testid:'soi',         factorid:'MMI',            raw:15   },
		{ testid:'soi',         factorid:'EFU',            raw:53   },
		{ testid:'soi',         factorid:'EFC',            raw:80   },
		{ testid:'soi',         factorid:'ESC',            raw:22   },
		{ testid:'soi',         factorid:'ESS',            raw:55   },
		{ testid:'soi',         factorid:'NFU',            raw:88   },
		{ testid:'soi',         factorid:'NSS',            raw:20   },
		{ testid:'soi',         factorid:'NST',            raw:50   },
		{ testid:'soi',         factorid:'NSI',            raw:90   },
		{ testid:'soi',         factorid:'DFU',            raw:17   },
		{ testid:'soi',         factorid:'DMU',            raw:42   },
		{ testid:'soi',         factorid:'DSR',            raw:71   },
	],

	sally: [
		{ testid:'temperament',     factorid:'extravert',      raw: 4.5 },
		{ testid:'temperament',     factorid:'sensible',       raw: 7   },
		{ testid:'temperament',     factorid:'thinking',       raw: 0.5 },
		{ testid:'temperament',     factorid:'judicious',      raw: 3.5 },

		{ testid:'motivation',          factorid:'adventure',      raw: 6   },
		{ testid:'motivation',          factorid:'personal',       raw: 1   },
		{ testid:'motivation',          factorid:'definitions',    raw: 8   },
		{ testid:'motivation',          factorid:'feelings',       raw: 2   },
		{ testid:'motivation',          factorid:'efficiency',     raw: 4   },
		{ testid:'motivation',          factorid:'curiosity',      raw: 7   },
		{ testid:'motivation',          factorid:'authority',      raw: 2   },
		{ testid:'motivation',          factorid:'resistance',     raw: 6   },
		{ testid:'motivation',          factorid:'wariness',       raw: 7   },
		{ testid:'motivation',          factorid:'tools',          raw: 3   },
		{ testid:'motivation',          factorid:'affection',      raw: 5   },
		{ testid:'motivation',          factorid:'acclaim',        raw: 9   },
		{ testid:'motivation',          factorid:'pressure',       raw: 1   },
		{ testid:'motivation',          factorid:'direct',         raw: 6   },
		{ testid:'motivation',          factorid:'avoidance',      raw:10   },
		{ testid:'motivation',          factorid:'disappointment', raw: 0   },

		{ testid:'personality',        factorid:'extraversion',   raw: 4.6 },
		{ testid:'personality',        factorid:'anxiety',        raw: 7.2 },
		{ testid:'personality',        factorid:'tough',          raw: 1.5 },
		{ testid:'personality',        factorid:'independence',   raw: 6.5 },
		{ testid:'personality',        factorid:'selfcontrol',    raw: 6.7 },
		{ testid:'personality',        factorid:'warm',           raw: 6   },
		{ testid:'personality',        factorid:'abstract',       raw: 8   },
		{ testid:'personality',        factorid:'stable',         raw: 9   },
		{ testid:'personality',        factorid:'dominant',       raw: 2   },
		{ testid:'personality',        factorid:'lively',         raw: 4   },
		{ testid:'personality',        factorid:'rule',           raw: 7   },
		{ testid:'personality',        factorid:'bold',           raw: 2   },
		{ testid:'personality',        factorid:'sensitive',      raw: 6   },
		{ testid:'personality',        factorid:'vigilant',       raw: 7   },
		{ testid:'personality',        factorid:'abstracted',     raw: 1   },
		{ testid:'personality',        factorid:'private',        raw: 4   },
		{ testid:'personality',        factorid:'apprehensive',   raw: 8   },
		{ testid:'personality',        factorid:'open',           raw: 1   },
		{ testid:'personality',        factorid:'selfreliant',    raw: 6   },
		{ testid:'personality',        factorid:'perfectionist',  raw: 7   },
		{ testid:'personality',        factorid:'tense',          raw: 3   },

		{ testid:'eji',         factorid:'summary',        raw:60   },
		{ testid:'eji',         factorid:'aware',          raw:38   },
		{ testid:'eji',         factorid:'identifyown',    raw:80   },
		{ testid:'eji',         factorid:'identifyothers', raw:29   },
		{ testid:'eji',         factorid:'manageown',      raw:47   },
		{ testid:'eji',         factorid:'manageothers',   raw:91   },
		{ testid:'eji',         factorid:'problemsolving', raw:31   },
		{ testid:'eji',         factorid:'express',        raw:60   },
		{ testid:'eji',         factorid:'impression',     raw:77   },

		{ testid:'soi',         factorid:'figural',        raw:70   },
		{ testid:'soi',         factorid:'symbolic',       raw:20   },
		{ testid:'soi',         factorid:'semantic',       raw:50   },
		{ testid:'soi',         factorid:'comprehension',  raw:70   },
		{ testid:'soi',         factorid:'memory',         raw:20   },
		{ testid:'soi',         factorid:'evaluation',     raw:50   },
		{ testid:'soi',         factorid:'problemsolving', raw:70   },
		{ testid:'soi',         factorid:'creativity',     raw:50   },
		{ testid:'soi',         factorid:'CFU',            raw:71   },
		{ testid:'soi',         factorid:'CFC',            raw:18   },
		{ testid:'soi',         factorid:'CFS',            raw:49   },
		{ testid:'soi',         factorid:'CFT',            raw:77   },
		{ testid:'soi',         factorid:'CSR',            raw:25   },
		{ testid:'soi',         factorid:'CMU_R',          raw:62   },
		{ testid:'soi',         factorid:'CMU_M',          raw:89   },
		{ testid:'soi',         factorid:'CMR',            raw:12   },
		{ testid:'soi',         factorid:'CMS',            raw:45   },
		{ testid:'soi',         factorid:'MFU',            raw:83   },
		{ testid:'soi',         factorid:'MSUv',           raw:22   },
		{ testid:'soi',         factorid:'MSSv',           raw:59   },
		{ testid:'soi',         factorid:'MSUa',           raw:91   },
		{ testid:'soi',         factorid:'MSSa',           raw:29   },
		{ testid:'soi',         factorid:'MSI',            raw:39   },
		{ testid:'soi',         factorid:'MMI',            raw:67   },
		{ testid:'soi',         factorid:'EFU',            raw:15   },
		{ testid:'soi',         factorid:'EFC',            raw:53   },
		{ testid:'soi',         factorid:'ESC',            raw:80   },
		{ testid:'soi',         factorid:'ESS',            raw:22   },
		{ testid:'soi',         factorid:'NFU',            raw:55   },
		{ testid:'soi',         factorid:'NSS',            raw:88   },
		{ testid:'soi',         factorid:'NST',            raw:20   },
		{ testid:'soi',         factorid:'NSI',            raw:50   },
		{ testid:'soi',         factorid:'DFU',            raw:90   },
		{ testid:'soi',         factorid:'DMU',            raw:17   },
		{ testid:'soi',         factorid:'DSR',            raw:42   },
	],

	alan: [
		{ testid:'temperament',     factorid:'extravert',      raw: 2.5 },
		{ testid:'temperament',     factorid:'sensible',       raw: 6   },
		{ testid:'temperament',     factorid:'thinking',       raw: 7   },
		{ testid:'temperament',     factorid:'judicious',      raw: 0.5 },

		{ testid:'motivation',          factorid:'adventure',      raw: 3   },
		{ testid:'motivation',          factorid:'personal',       raw: 7   },
		{ testid:'motivation',          factorid:'definitions',    raw: 5   },
		{ testid:'motivation',          factorid:'feelings',       raw: 8   },
		{ testid:'motivation',          factorid:'efficiency',     raw: 2   },
		{ testid:'motivation',          factorid:'curiosity',      raw: 4   },
		{ testid:'motivation',          factorid:'authority',      raw: 7   },
		{ testid:'motivation',          factorid:'resistance',     raw: 2   },
		{ testid:'motivation',          factorid:'wariness',       raw: 6   },
		{ testid:'motivation',          factorid:'tools',          raw: 7   },
		{ testid:'motivation',          factorid:'affection',      raw: 3   },
		{ testid:'motivation',          factorid:'acclaim',        raw: 5   },
		{ testid:'motivation',          factorid:'pressure',       raw: 9   },
		{ testid:'motivation',          factorid:'direct',         raw: 1   },
		{ testid:'motivation',          factorid:'avoidance',      raw: 6   },
		{ testid:'motivation',          factorid:'disappointment', raw:10   },

		{ testid:'personality',        factorid:'extraversion',   raw: 2.4 },
		{ testid:'personality',        factorid:'anxiety',        raw: 3.7 },
		{ testid:'personality',        factorid:'tough',          raw: 7.2 },
		{ testid:'personality',        factorid:'independence',   raw: 1.5 },
		{ testid:'personality',        factorid:'selfcontrol',    raw: 6.5 },
		{ testid:'personality',        factorid:'warm',           raw: 2   },
		{ testid:'personality',        factorid:'abstract',       raw: 5   },
		{ testid:'personality',        factorid:'stable',         raw: 4   },
		{ testid:'personality',        factorid:'dominant',       raw: 9   },
		{ testid:'personality',        factorid:'lively',         raw: 2   },
		{ testid:'personality',        factorid:'rule',           raw: 4   },
		{ testid:'personality',        factorid:'bold',           raw: 7   },
		{ testid:'personality',        factorid:'sensitive',      raw: 2   },
		{ testid:'personality',        factorid:'vigilant',       raw: 6   },
		{ testid:'personality',        factorid:'abstracted',     raw: 7   },
		{ testid:'personality',        factorid:'private',        raw: 1   },
		{ testid:'personality',        factorid:'apprehensive',   raw: 4   },
		{ testid:'personality',        factorid:'open',           raw: 8   },
		{ testid:'personality',        factorid:'selfreliant',    raw: 1   },
		{ testid:'personality',        factorid:'perfectionist',  raw: 6   },
		{ testid:'personality',        factorid:'tense',          raw: 7   },

		{ testid:'eji',         factorid:'summary',        raw:80   },
		{ testid:'eji',         factorid:'aware',          raw:77   },
		{ testid:'eji',         factorid:'identifyown',    raw:18   },
		{ testid:'eji',         factorid:'identifyothers', raw:80   },
		{ testid:'eji',         factorid:'manageown',      raw:29   },
		{ testid:'eji',         factorid:'manageothers',   raw:47   },
		{ testid:'eji',         factorid:'problemsolving', raw:91   },
		{ testid:'eji',         factorid:'express',        raw:31   },
		{ testid:'eji',         factorid:'impression',     raw:60   },

		{ testid:'soi',         factorid:'figural',        raw:50   },
		{ testid:'soi',         factorid:'symbolic',       raw:70   },
		{ testid:'soi',         factorid:'semantic',       raw:20   },
		{ testid:'soi',         factorid:'comprehension',  raw:50   },
		{ testid:'soi',         factorid:'memory',         raw:70   },
		{ testid:'soi',         factorid:'evaluation',     raw:20   },
		{ testid:'soi',         factorid:'problemsolving', raw:50   },
		{ testid:'soi',         factorid:'creativity',     raw:70   },
		{ testid:'soi',         factorid:'CFU',            raw:42   },
		{ testid:'soi',         factorid:'CFC',            raw:71   },
		{ testid:'soi',         factorid:'CFS',            raw:18   },
		{ testid:'soi',         factorid:'CFT',            raw:49   },
		{ testid:'soi',         factorid:'CSR',            raw:77   },
		{ testid:'soi',         factorid:'CMU_R',          raw:25   },
		{ testid:'soi',         factorid:'CMU_M',          raw:62   },
		{ testid:'soi',         factorid:'CMR',            raw:89   },
		{ testid:'soi',         factorid:'CMS',            raw:12   },
		{ testid:'soi',         factorid:'MFU',            raw:45   },
		{ testid:'soi',         factorid:'MSUv',           raw:83   },
		{ testid:'soi',         factorid:'MSSv',           raw:22   },
		{ testid:'soi',         factorid:'MSUa',           raw:59   },
		{ testid:'soi',         factorid:'MSSa',           raw:91   },
		{ testid:'soi',         factorid:'MSI',            raw:29   },
		{ testid:'soi',         factorid:'MMI',            raw:39   },
		{ testid:'soi',         factorid:'EFU',            raw:67   },
		{ testid:'soi',         factorid:'EFC',            raw:15   },
		{ testid:'soi',         factorid:'ESC',            raw:53   },
		{ testid:'soi',         factorid:'ESS',            raw:80   },
		{ testid:'soi',         factorid:'NFU',            raw:22   },
		{ testid:'soi',         factorid:'NSS',            raw:55   },
		{ testid:'soi',         factorid:'NST',            raw:88   },
		{ testid:'soi',         factorid:'NSI',            raw:20   },
		{ testid:'soi',         factorid:'DFU',            raw:50   },
		{ testid:'soi',         factorid:'DMU',            raw:90   },
		{ testid:'soi',         factorid:'DSR',            raw:17   },
	],
}
