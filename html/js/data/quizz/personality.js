/**
185 questions.  Answer a,b,c.
16 personality traits, a (sten) number from 1 to 10 for each.
5 global factors are averaged from subsets of the 16.
*/
voyc.data.quizz['personality'] = {
	id:'personality',
	title:'16PF Cattell Comprehensive Personality Interpretation', // '16 Personality Factors (16PF)',
	copyright:'Provided by IPAT',  //'&copy; Copyright 1997, 1999 by the Institute for Personality and Ability Testing, Inc.',
	directions:'This test is a product provided by IPAT testing company.  IPAT charges $60 for this test.  To schedule the test, contact Dr. Zinn to arrange for payment.\nAfter taking the test, IPAT will provide you with your (16PF) Cattell Comprehensive Personality Interpretation Report.  Near the last page of the report is a bar graph titled 16PF Primary Scores.  Down the left-hand column of that graph is a list of codes and a "sten" value for each code.\nSelect the "sten" value for each code in the form below.',
	answertype: 'sten',
	test: [
		{n: 1,  r:0, q:'A' , f:'warm'          , a:[]},
		{n: 2,  r:0, q:'B' , f:'abstract'      , a:[]},
		{n: 3,  r:0, q:'C' , f:'stable'        , a:[]},
		{n: 4,  r:0, q:'E' , f:'dominant'      , a:[]},
		{n: 5,  r:0, q:'F' , f:'lively'        , a:[]},
		{n: 6,  r:0, q:'G' , f:'rule'          , a:[]},
		{n: 7,  r:0, q:'H' , f:'bold'          , a:[]},
		{n: 8,  r:0, q:'I' , f:'sensitive'     , a:[]},
		{n: 9,  r:0, q:'L' , f:'vigilant'      , a:[]},
		{n:10,  r:0, q:'M' , f:'abstracted'    , a:[]},
		{n:11,  r:0, q:'N' , f:'private'       , a:[]},
		{n:12,  r:0, q:'O' , f:'apprehensive'  , a:[]},
		{n:13,  r:0, q:'Q1', f:'open'          , a:[]},
		{n:14,  r:0, q:'Q2', f:'selfreliant'   , a:[]},
		{n:15,  r:0, q:'Q3', f:'perfectionist' , a:[]},
		{n:16,  r:0, q:'Q4', f:'tense'         , a:[]},
	],
	calcScores: function() {
		//             0    1    2    3    4    5    6    7    8    9,  10
		var pctsten = [0,  10,  20,  30,  40,  50,  60,  70,  80,  90, 100 ];
		var testname = 'personality';
		var quizz = voyc.data.quizz[testname];
		var questions = quizz.test;
		var ans = voyc.drzinn.answers.collect(testname);
		var factorname = '';
		var raw = 0;
		var pct = 0;
		for (var i=0; i<questions.length; i++) {
			factorname = questions[i].f;
			raw = ans[i];
			pct = pctsten[raw];
			voyc.drzinn.scores.set(testname, factorname, raw, pct);
		}
	}
};

voyc.stenFromPct = function(pct) {
	return Math.ceil(pct / 10);
}
