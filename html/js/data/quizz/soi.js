voyc.data.quizz['soi'] = {
	title:'Structure of Intelligence',
	copyright:'Provided by SOI Systems, Inc.',  // '&copy; Copyright 2007 Robert Meeker'
	directions:'This test is a product offered by SOI Systems Inc., a commercial testing company.  SOI Systems charges $60 to administer this test.  To schedule the test, contact Dr. Zinn at 847 236 4712, and make arrangements for payment.\nAfter taking the test, SOI Systems will provide you with your Personal SOI Career Analysis Report.  Near page 9 of this report you will see a bar graph titled "SOI Test Results".\nSelect the "Stanine" for each bar on the form below.',
	answertype: 'stanine',
	test: [
		{n: 1,  r:0, q:'CFU',  a:[]},
		{n: 2,  r:0, q:'CFC',  a:[]},
		{n: 3,  r:0, q:'MFU',  a:[]},
		{n: 4,  r:0, q:'EFU',  a:[]},
		{n: 5,  r:0, q:'EFC',  a:[]},
		{n: 6,  r:0, q:'CFS',  a:[]},
		{n: 7,  r:0, q:'CFT',  a:[]},
		{n: 8,  r:0, q:'NFU',  a:[]},
		{n: 9,  r:0, q:'DFU',  a:[]},
		{n:10,  r:0, q:'CSS',  a:[]},
		{n:11,  r:0, q:'MSUv', a:[]},
		{n:12,  r:0, q:'MSSv', a:[]},
		{n:13,  r:0, q:'MSUa', a:[]},
		{n:14,  r:0, q:'MSSa', a:[]},
		{n:15,  r:0, q:'ESC',  a:[]},
		{n:16,  r:0, q:'ESS',  a:[]},
		{n:17,  r:0, q:'NSS',  a:[]},
		{n:18,  r:0, q:'NST',  a:[]},
		{n:19,  r:0, q:'NSI',  a:[]},
		{n:20,  r:0, q:'CSR',  a:[]},
		{n:21,  r:0, q:'DSR',  a:[]},
		{n:22,  r:0, q:'CMUr', a:[]},
		{n:23,  r:0, q:'CMUm', a:[]},
		{n:24,  r:0, q:'CMR',  a:[]},
		{n:25,  r:0, q:'CMS',  a:[]},
		{n:26,  r:0, q:'DMU',  a:[]},
		{n:27,  r:0, q:'MMI',  a:[]},
	],
	calcScores: function() {
		//                 1    2    3    4    5    6    7    8    9
		//               0    4   11   23   40   50   77   89   96   100 
		var pctnine = [0,  2,   7,  17,  31,  45,  63,  83,  92,  98 ];
		var testname = 'soi';
		var quizz = voyc.data.quizz[testname];
		var questions = quizz.test;
		var ans = voyc.drzinn.answers.collect(testname);
		var factorname = '';
		var raw = 0;
		var pct = 0;
		for (var i=0; i<questions.length; i++) {
			factorname = questions[i].q;
			raw = ans[i];
			pct = pctnine[raw];
			voyc.drzinn.scores.set(testname, factorname, raw, pct);
		}
	}
}

voyc.pctFromStanine = function(stanine) {
	var pctnine = [0,  2,   7,  17,  31,  45,  63,  83,  92,  98 ];	
	return pctnine[stanine];
}
voyc.stanineFromPct = function(pct) {
	var pctnine = [0,  2,   7,  17,  31,  45,  63,  83,  92,  98 ];	
	for (var i=0; i<pctnine.length; i++) {
		if (pct < pctnine[i]) {
			return i-1;
		}
	}
	return -1;
}
