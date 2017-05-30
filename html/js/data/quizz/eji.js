voyc.data.quizz['eji'] = {
	title:'Emotional Judgement Inventory (EJI)',
	
	copyright:'Provided by IPAT.',  // '© Copyright 2000, 2003 OPP® Limited, Elsfield Hall, 15-17 Elsfield Way, Oxford OX2 8EP, UK. All rights reserved.',
	directions:'This test is a product offered by ipat, a commercial testing company.  ipat charges $60 to administer this test.  To schedule the test, contact Dr. Zinn at 847 236 4712, and make arrangements for payment.\nAfter taking the test, IPAT will provide you with your Emotional Judgement Inventory Report.  At the bottom of the last page of this report you will see a short table of "Scales".\nEnter the "T-Score" for each "Scale" into the form below.',
	answertype: 'pct',
	test: [
		{n:1,  r:0, q:'AW', f:'aware'         , a:[]},
		{n:2,  r:0, q:'IS', f:'identifyown'   , a:[]},
		{n:3,  r:0, q:'IO', f:'identifyothers', a:[]},
		{n:4,  r:0, q:'MS', f:'manageown'     , a:[]},
		{n:5,  r:0, q:'MO', f:'manageothers'  , a:[]},
		{n:6,  r:0, q:'PS', f:'problemsolving', a:[]},
		{n:7,  r:0, q:'EX', f:'express'       , a:[]},
		{n:8,  r:0, q:'IM', f:'impression'    , a:[]},
	],
	calcScores: function() {
		var testname = 'eji';
		var quizz = voyc.data.quizz[testname];
		var questions = quizz.test;
		var ans = voyc.drzinn.answers.collect(testname);
		var factorname = '';
		var raw = 0;
		var pct = 0;
		for (var i=0; i<questions.length; i++) {
			factorname = questions[i].f;
			raw = ans[i];
			pct = raw;
			voyc.drzinn.scores.set(testname, factorname, raw, pct);
		}
	}
}

/*
The original test looks like this.
80 questions.  Each answer is a value from 1 thru 7 as follow:
	{v:1, t:'1 I Absolutely Disagree'},
	{v:2, t:'2 I Strongly Disagree'},
	{v:3, t:'3 I Slightly Disagree'},
	{v:4, t:'4 Not Sure'},
	{v:5, t:'5 I Slightly Agree'},
	{v:6, t:'6 I Strongly Agree'},
	{v:7, t:'7 I Absolutely Agree'},
8 scores, or "areas", each with a Raw Score and a T-Score, each with a value of 0 thru 100.
T-Score is shown on the graphs.
*/
