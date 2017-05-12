peg.tests = {
	learningstyle: {
		display: 'My Learning Style',
		quizz: 'torres',
		company: 'Torres',
	},
	temperament: {
		display: 'My Temperament',
		minscore: 0,
		maxscore: 10,
		step: .5,
		pole: 2,
		dimensions: 'paired', // single or paired
		vendorstyle: 'paired', // oneway, paired or offcenter
		pairedscore: true,
		quizz: 'kiersey',
		company: '',
		derived: false,
		hassubs: false,
		mean: 50,
		low: 30,
		high: 70,

		// low: between 0 and 30
		// avg: between 31 and 70
		// high: between 71 and 100

	},
	motivation: {
		display: 'My Motivations',
		minscore: 0,
		maxscore: 10,
		mean: 5,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		pairedscore: false,
		quizz: 'runner',
		company: '',
		derived: false,
		hassubs: false,
	},
//	zinn: {
//		display: 'My Motivation',
//		minscore: 0,
//		maxscore: 10,
//		mean: 5,
//		step: 1,
//		pole: 2,
//		dimensions: 'paired', // single or paired
//		vendorstyle: 'paired', // oneway, paired or offcenter
//		pairedscore: true,
//		company: 'Dr Zinn, Encinitas CA, www.drzinn.com',
//		derived: true,
//		hassubs: false,
//	},
	personality: {
		//display: '16PF',
		display: 'My Personality',
		minscore: 0,
		maxscore: 10,
		mean: 5,
		step: 1,
		pole: 2,
		dimensions: 'paired', // single or paired
		vendorstyle: 'offcenter', // oneway, paired or offcenter
		pairedscore: false,
		company: 'Raymond Cattell',
		derived: false,
		hassubs: false,
	},
	eji: {
		display: 'My Emotional Intelligence',
		//display: 'Emotional Judgement Inventory',
		minscore: 0,
		maxscore: 100,
		mean: 50,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		testname: 'Emotional Judgement Inventory',
		company: 'IPAT Inc., Champaign IL, www.ipat.com',
		derived: false,
		hassubs: false,
	},
	soi: {
		display: 'The Structure of My Intellect',
		minscore: 0,
		maxscore: 100,
		mean: 50,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		pairedscore: false,
		company: 'SOI Systems',
		derived: false,
		hassubs: false,
	},
}
