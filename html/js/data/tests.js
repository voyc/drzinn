voyc.data.tests = {
	'temperament': {
		display: 'My Temperament',
		code: 'tem',
		minscore: 0,
		maxscore: 10,
		step: .5,
		pole: 2,
		dimensions: 'paired', // single or paired
		vendorstyle: 'paired', // oneway, paired or offcenter
		pairedscore: true,
		quizz: 'temperament',
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
	'motivation': {
		display: 'My Motivations',
		code: 'mot',
		minscore: 0,
		maxscore: 10,
		mean: 5,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		pairedscore: false,
		quizz: 'motivation',
		company: '',
		derived: false,
		hassubs: false,
	},
	'personality': {
		//display: '16PF',
		display: 'My Personality',
		code: 'per',
		minscore: 0,
		maxscore: 10,
		mean: 5,
		step: 1,
		pole: 2,
		dimensions: 'paired', // single or paired
		vendorstyle: 'offcenter', // oneway, paired or offcenter
		pairedscore: false,
		quizz: 'personality',
		company: 'Raymond Cattell',
		derived: false,
		hassubs: false,
	},
	'learningstyle': {
		display: 'My Learning Style',
		code: 'lrn',
		minscore: 0,
		maxscore: 10,
		mean: 5,
		step: 1,
		pole: 3,
		maxlow:20,
		minhigh:46,
		dimensions: 'paired', // single or paired
		vendorstyle: 'offcenter', // oneway, paired or offcenter
		pairedscore: false,
		quizz: 'learningstyle',
		company: 'Torres',
		derived: false,
		hassubs: false,
	},
	'eji': {
		display: 'My Emotional Intelligence',
		//display: 'Emotional Judgement Inventory',
		code: 'eji',
		minscore: 0,
		maxscore: 100,
		mean: 50,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		testname: 'Emotional Judgement Inventory',
		quizz: 'eji',
		company: 'IPAT Inc., Champaign IL, www.ipat.com',
		derived: false,
		hassubs: false,
	},
	'soi': {
		display: 'My Intellect',
		code: 'soi',
		minscore: 0,
		maxscore: 100,
		mean: 50,
		step: 1,
		pole: 1,
		dimensions: 'single', // single or paired
		vendorstyle: 'oneway', // oneway, paired or offcenter
		pairedscore: false,
		quizz: 'soi',
		company: 'SOI Systems',
		derived: false,
		hassubs: false,
	},
}
