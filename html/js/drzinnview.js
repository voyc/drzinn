/**
	class voyc.DrZinnView
	@constructor
	@param {Object|null} [observer=null]

	singleton

	Draws reports on screen.
		A pie shows a distribution of scores within oneself.
		A guage shows a score compared to others.

		A pie shows two or more scores simultaneously.

		A spread shows two scores relative to each other.

		A 1-pole factor shows a single score.
		A 2-pole factor implies the existence of a second paired factor.
		A 3+pole factor is a composite of n other primary factors.

		A global factor has 2 or more composite factors.
		A global factor can be a 1-pole, averaging the scores of the composite factors.
		A global factor can be a m-pole, showing the composite scores on a pie chart.

	Terminology
		test - string id
		tst - object in voyc.data.tests

		factor - string id
		fact - object in voyc.data.factors

		pageid - string test-factor or test-quizz or test-all or all-all
*/
voyc.DrZinnView = function(observer) {
	if (voyc.DrZinnView._instance) return voyc.DrZinnView._instance;
	voyc.DrZinnView._instance = this;
	this.observer = observer;
	this.setup();
}

voyc.DrZinnView.prototype.setup = function() {
	// attach handlers to header and dialogs
	this.attachHandlers();
	
	this.currentPageId = '';
	this.openQuizzId = '';

	// initialize nav object
	var self = this;
	new voyc.BrowserHistory('page', function(pageid) {
		self.observer.publish(new voyc.Note('nav-requested', 'drzinnview', {'old':self.currentPageId, 'new':pageid, 'quizz':self.openQuizzId}));
		self.drawPage(pageid);
	});

	// attach event handlers
	this.observer.subscribe('setup-complete'    ,'drzinnview'  ,function(note) { self.onSetupComplete    (note); });
	this.observer.subscribe('answer-submitted'  ,'drzinnview'  ,function(note) { self.onAnswerSubmitted  (note); });
	this.observer.subscribe('answers-received'  ,'drzinnview'  ,function(note) { self.onAnswersReceived  (note); });
	this.observer.subscribe('quizz-requested'   ,'drzinnview'  ,function(note) { self.onQuizzRequested   (note); });
}

/**
	quick start, draw empty page
*/
voyc.DrZinnView.prototype.onSetupComplete = function(note) {
	var hist = (new voyc.BrowserHistory);
	var pageid = hist.getBookmark() || 'home';
	hist.nav(pageid);
}

/**
	after login, and answers retrieved, redraw the page
*/
voyc.DrZinnView.prototype.onAnswersReceived = function(note) {
	this.drawPage(this.currentPageId);
}

/**
	method drawPage()
	Called on nav by BrowserClass,
	on startup, on back and forward, and on every user navigation click.
	Draws the page using composeXXX() methods, each of which returns a string of HTML.
**/
voyc.DrZinnView.prototype.drawPage = function(pageid) {
	var pageid = pageid || 'home';
	this.currentPageId = pageid;
	this.openQuizzId = '';
	voyc.drzinn.calcScores();
	var s = '';
	if (pageid == 'home') {  // main refrigerator-magnet summary page
		s = this.composeHome();
	}
	else if (pageid == 'about') {
		s = this.composeAbout();
	}
	else if (pageid == 'gifts' || pageid == 'nourishments' || pageid == 'burnouts') {
		s = this.composeGifts(pageid);
	}
	else {
		s = this.composeFactor(pageid);
	}

	document.title = pageid + ' DrZinn';
	var dcontent = document.getElementById('dcontent');
	dcontent.innerHTML = s;
	this.attachHandlers(dcontent); // attach click handlers to the new content
	window.dispatchEvent(new Event('resize'));  // redraw size-dependent elements
	window.scroll(0,0);
	return;
}

/*
	following are the composeXXX() methods, which all return a string of HTML
*/

voyc.DrZinnView.prototype.composeAbout = function() {
	var s = voyc.$('about').innerHTML;
	return s;
}
	
/*
	method composeHome()
	draw the home page, a refrigerator-magnet-like summary screen
*/
voyc.DrZinnView.prototype.composeHome = function() {
	var s = "<h1>My Authentic Self</h3>";
	s += "<panel id='temperament' class='panel red'><h3>My Temperament</h3>";
	s += "<p>";
	s += "<chart factor='temperament-extravert'></chart>";
	s += "<chart factor='temperament-sensible'></chart><br/>";
	s += "<chart factor='temperament-thinking'></chart>";
	s += "<chart factor='temperament-judicious'></chart>";
	s += "<br/><button class='anchor' nav='temperament-quizz'>Take the test</button>";
	s += "</p></panel>";

	s += "<panel id='motivation' class='panel red'><h3>My Motivation</h3>";
	s += "<p>";
	s += "<chart factor='motivation-adventure'></chart>";
	s += "<chart factor='motivation-personal'></chart>";
	s += "<br/><button class='anchor' nav='motivation-quizz'>Take the test</button>";
	s += "</p></panel>";

	//s += "<panel class='panel red'><h3>My Learning Style</h3>";
	//s += "<p>";
	//s += "<img src='i/vak.jpg'/>";
	//s += "<br/><button class='anchor' nav='learningstyle-quizz'>Take the test</button>";
	//s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Personality</h3>";
	s += "<p>";
	s += "<chart factor='personality-extraversion'></chart>";
	s += "<chart factor='personality-anxiety'></chart>";
	s += "<chart factor='personality-tough'></chart><br/>";
	s += "<chart factor='personality-independence'></chart>";
	s += "<chart factor='personality-selfcontrol'></chart>";
	s += "<br/><button class='anchor' nav='personality-quizz'>Take the test</button>";
	s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Emotional Intelligence</h3>";
	s += "<p>";
	s += "<chart factor='eji-summary'></chart>";
	s += "<br/><button class='anchor' nav='eji-quizz'>Take the test</button>";
	s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Intellect</h3>";
	s += "<p>";
	s += "<chart factor='soi-figural'></chart>";
	s += "<chart factor='soi-symbolic'></chart><br/>";
	s += "<chart factor='soi-semantic'></chart>";
	s += "<br/><button class='anchor' nav='soi-quizz'>Take the test</button>";
	s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Gifts</h3>";
	s += "<p>";
	s += "<img src='i/gift.jpg' nav='gifts'/>";
	s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Nourishments</h3>";
	s += "<p>";
	s += "<img src='i/nourishment.jpg' nav='nourishments'/>";
	s += "</p></panel>";

	s += "<panel class='panel red'><h3>My Burnouts</h3>";
	s += "<p style='margin:38px 0'>";
	s += "<img src='i/burnout.jpg' nav='burnouts'/>";
	s += "</p></panel>";

	s += "<p><button class='anchor' nav='all-all'>Print all details</button></p>";

	return s;
}

/*
	method composePanel()
	A panel is a set of graphs in a box.
*/
voyc.DrZinnView.prototype.composePanel = function(test, factors) {
	var s = '';
	s += "<panel class='panel red'><h3></h3>";
	s += "<p>";
	var fact = {};
	for (var i=0; i<factors.length; i++) {
		fact = voyc.data.factors[test][factors[i]]; 
		s += "<chart factor='" + fact.test + "-" + fact.factor + "'></chart>";
	}
	s += "</p></panel>";
	return s;
}

voyc.DrZinnView.prototype.composeFactor = function(pageid) {
	var a = pageid.split('-');
	var test = a[0];
	var factor = a[1];
	var s = '';
	if (test == 'all') {
		s += this.composeAllAll();
	}
	else if (factor == 'all') {
		s += this.composeTestAll(test);
	}
	else if (factor == 'quizz') {
		s += this.composeQuizz(test,factor);
		var quizzid = voyc.data.tests[test].quizz;
		this.observer.publish(new voyc.Note('quizz-requested', 'drzinnview', {'quizzid':quizzid}));
	}
	else {
		s += this.composeTestFactor(test,factor);
	}
	return s;
}

voyc.DrZinnView.prototype.composeTestFactor = function(test,factor) {
	var pageid = test + '-' + factor;
	var s = '';
	s += "<p><button class='anchor' nav='home'>Return to main page</button></p>";
	s += "<h1>" + this.getTestTitle(test) + "</h1>";
	s += "<div class='narrative'>";
	s += this.composeFactorStory(test, factor, true);
	s += "</div>";
	s += "<p><button class='anchor' nav='" + this.getPageId(test, 'all') + "'>Show all " + this.getTestTitle(test) + " Details</button></p>";
	return s;
}

voyc.DrZinnView.prototype.composeFactorStory = function(test, factor, showComponents) {
	var s = '';
	var pageid = test + '-' + factor;
	s += "<h2><headline factor='" + pageid + "'>" + this.composeHeadline(test, factor) + "</headline></h2>";
	s += "<chart factor='" + pageid + "'></chart>";
	s += "<story factor='" + pageid + "'>" + this.composeStory(test, factor, showComponents) + "</story>";
	return s;
}

voyc.DrZinnView.prototype.composeTestAll = function(test) {
	var s = "";
	s += "<div class='narrative'>";
	s += "<h1>" + this.getTestTitle(test) + "</h1>";
	for (var k in voyc.data.factors[test]) {
		s += this.composeFactorStory(test, k, false);
	}
	s += "</div>";
	return s;
}

voyc.DrZinnView.prototype.composeAllAll = function() {
	var s = '';
	for (var test in voyc.data.tests) {
		s += "<h1>" + voyc.data.tests[test].display + "</h1>";
		for (var k in voyc.data.factors[test]) {
			s += this.composeFactorStory(test, k, false);
		}
	}
	return s;
}

voyc.DrZinnView.prototype.composeStory = function(test, factor, showComponents) {
	var fact = voyc.data.factors[test][factor];
	
	var score = voyc.drzinn.scores.get(test, factor);
		
	// determine range: low, high, medium
	var range = '';
	var low = 35;
	var high = 65;
	if (score.pct < low)
		range = 'low';
	else if (score.pct > high)
		range = 'high';
	else {
		range = 'medium';
	}

	var sAlways = '';
	var sDefault = '';
	var sGift = '';
	var sNourishment = '';
	var sBurnout = '';
	
	// compose always section
	var item = {};
	for (var j=0; j<voyc.data.always.length; j++) {
		item = voyc.data.always[j];
		if (item.test == test && item.factor == factor) {
			sAlways += '<p>' + item.narrative + '</p>';
		}
	}

	// compose defaults section
	for (var j=0; j<voyc.data.defaults.length; j++) {
		item = voyc.data.defaults[j];
		if (item.test == test && item.factor == factor) {
			sDefault += '<p>' + item.narrative + '</p>';
		}
	}

	// compose gift section
	for (var j=0; j<voyc.data.gifts.length; j++) {
		item = voyc.data.gifts[j];
		if (item.test == test && item.factor == factor && item.range == range) {
			sGift += '<p><span class="gift">Gift:</span> ' + item.narrative + '</p>';
		}
	}

	// compose nourishment section
	for (var j=0; j<voyc.data.nourishments.length; j++) {
		item = voyc.data.nourishments[j];
		if (item.test == test && item.factor == factor && item.range == range) {
			sNourishment += '<p><span class="nourishment">Nourishment:</span> ' + item.narrative + '</p>';
		}
	}

	// compose burnout section
	for (var j=0; j<voyc.data.burnouts.length; j++) {
		item = voyc.data.burnouts[j];
		if (item.test == test && item.factor == factor && item.range == range) {
			sBurnout += '<p><span class="burnout">Burnout:</span> ' + item.narrative + '</p>';
		}
	}

	// combine the five sections
	var s = sGift + sNourishment + sBurnout;
	if (!s.length) {
		s = sDefault;
	}
	s = sAlways + s;

	// add personal comments in textarea
	s += '<p><textarea placeholder="enter personal notes here"></textarea></p>';

	// add panel of components
	if (fact.global && showComponents) {
		s += '<p>This is a composite factor made up of the following component factors.</p>'
		s += this.composePanel(test, fact.components);
	}
	
	//s = this.changePerson(s);
	return s;
}

voyc.DrZinnView.prototype.composeHeadline = function(test, factor) {
	var fact = voyc.data.factors[test][factor];
	
	var score = voyc.drzinn.scores.get(test, factor);
		
	var range = this.getRange(test, factor, score);

	// reverse range for paired factors
	var displayrange = range;
	var factorhigh = fact.left;
	var factorlow = fact.right;
	var pcthigh = score.pct;
	var pctlow = 100 - score.pct;

	if (this.getPole(fact) == 2) {
		if (range == 'medium') {
			displayrange = 'balanced';
		}
		else if (range == 'low') {
			displayrange = 'high';
			factorhigh = fact.right;
			factorlow = fact.left;
			pcthigh = 100 - score.pct;
			pctlow = score.pct;
		}
	}
	
	var drange = voyc.data.strings[displayrange];
	var dname = factorhigh;
	if (displayrange == 'balanced') {
		dname = fact.left + ' and ' + fact.right;
	}
	s = voyc.data.strings[displayrange] + ' ' + dname;
	return s;
}

voyc.DrZinnView.prototype.composeQuizz = function(test,factor) {
	var pageid = test + "-" + factor;
	
	var quizzid = voyc.data.tests[test].quizz;
	var quizz = voyc.data.quizz[quizzid];
	
	var s = '';
	s += "<div class='qcontainer narrative'>";
	
	// fixed header
	s += "<div class='qheader'>";
	s += "<p><button class='anchor' nav='home'>Return to main page</button></p>";
	s += "<h1><headline class='h3'>" + quizz.title + "</headline></h1>";
	//s += "<p><button class='anchor' nav='home'>Instructions</button></p>";
	s += "<p><progress id='testprogress' max=10 value=0></progress> <span id='numanswers'>0</span> of <span id='numquestions'>0</span><span id='teststatus'></span><p>";
	s += "<p class='qcopyright'>" + quizz.copyright + "</p>";
	s += "</div>";
	
	// scrolling quizz area
	s += "<div class='qscroller'>";
	s += this.composeQuizzScroller(quizzid);
	s += "</div>";
	
	return s;
}

voyc.DrZinnView.prototype.composeGifts = function(which) {
	var s = '';

	// loop through scores
	var score, test, factor, range;
	for (var i=0; i<voyc.drzinn.scores.scores.length; i++) {
		score = voyc.drzinn.scores.scores[i];
		test = voyc.data.tests[score.testid];
		factor = voyc.data.factors[score.testid][score.factorid];

		// determine range: low, high, average
		var range = '';
		var low = 35;
		var high = 65;
		if (score.pct < low)
			range = 'low';
		else if (score.pct > high)
			range = 'high';
		else {
			range = 'average';
		}

		// compose gift section
		var gift, navid, linkdisplay;
		if (which == 'gifts') {
			for (var j=0; j<voyc.data.gifts.length; j++) {
				gift = voyc.data.gifts[j];
				
				if (gift.test == factor.test && gift.factor == factor.factor && gift.range == range) {
					navid = gift.test + '-' + gift.factor;
					linkdisplay = voyc.data.tests[gift.test].display + ' - ' + voyc.data.factors[gift.test][gift.factor].left;
					s += "<p>" + gift.narrative + " <button class=anchor nav='" + navid + "'>" + linkdisplay + "</button></p>";
				}
			}
		}

		// compose nourishment section
		if (which == 'nourishments') {
			for (var j=0; j<voyc.data.nourishments.length; j++) {
				gift = voyc.data.nourishments[j];
				if (gift.test == factor.test && gift.factor == factor.factor && gift.range == range) {
					navid = gift.test + '-' + gift.factor;
					linkdisplay = voyc.data.tests[gift.test].display + ' - ' + voyc.data.factors[gift.test][gift.factor].left;
					s += "<p>" + gift.narrative + " <button class=anchor nav='" + navid + "'>" + linkdisplay + "</button></p>";
				}
			}
		}

		// compose burnout section
		if (which == 'burnouts') {
			for (var j=0; j<voyc.data.burnouts.length; j++) {
				gift = voyc.data.burnouts[j];
				if (gift.test == factor.test && gift.factor == factor.factor && gift.range == range) {
					navid = gift.test + '-' + gift.factor;
					linkdisplay = voyc.data.tests[gift.test].display + ' - ' + voyc.data.factors[gift.test][gift.factor].left;
					s += "<p>" + gift.narrative + " <button class=anchor nav='" + navid + "'>" + linkdisplay + "</button></p>";
				}
			}
		}
	}

	if (which == 'gifts') {
		s = "<h2>My Gifts</h2><container>" + s + "</container>";
	}
	if (which == 'nourishments') {
		s = "<h2>My Nourishments</h2><container>" + s + "</container>";
	}
	if (which == 'burnouts') {
		s = "<h2>My Burnouts</h2><container>" + s + "</container>";
	}

	return s;
}

/**
	Populate HTML after it has been rendered.
	First time, call this with no element, do the whole page including header and hidden.
	Subsequently, specify the element which has changed.
	@param {Element|null} [element=null]
**/
voyc.DrZinnView.prototype.attachHandlers = function(element) {
	var elem = element || document;
	
	// click on a chart
	var charts = elem.querySelectorAll('chart');
	for (var i=0; i<charts.length; i++) {
		charts[i].addEventListener('click', function(e) {
			if (voyc.drzinn.user.isAnonymous()) {
				return;
			}
			(new voyc.BrowserHistory).nav(e.currentTarget.getAttribute('factor'));
		}, false);
	}
	
	// click on a nav item
	var self = this;
	var navs = elem.querySelectorAll('[nav]');
	for (var i=0; i<navs.length; i++) {
		navs[i].addEventListener('click', function(e) {
			//var pageid = e.currentTarget.getAttribute('nav');
			(new voyc.BrowserHistory).nav(e.currentTarget.getAttribute('nav'));
		}, false);
	}

	// click on a quizz answer
	var ae = elem.querySelectorAll('div.ans');
	for (var i=0; i<ae.length; i++) {
		ae[i].addEventListener('click', function(e) {
			self.onAnswerClick(e);
		}, false);
	}

	// input on on a quizz answer
	var ae = elem.querySelectorAll('input.ansh');
	for (var i=0; i<ae.length; i++) {
		ae[i].addEventListener('input', function(e) {
			self.onAnswerInput(e);
		}, false);
	}

	// ctrl-click on progressbar, developer hot-key
	var tp = elem.querySelector('[id=testprogress]');
	if (tp) {
		tp.addEventListener('click', function(e) {
			if (e.ctrlKey) {
				self.animateQuizz();
			}
		}, false);
	}
}

/**
	for developers
	answer all questions of a quizz
*/
voyc.DrZinnView.prototype.animateQuizz = function() {
	var username = voyc.drzinn.user.username;
	var userndx = -1;
	for (var i=0; i<voyc.data.exampleusers.length; i++) {
		if (voyc.data.exampleusers[i] == username) {
			userndx = i;
			break;
		}
	}
	var testcode = this.openQuizzId;
	var quizz = voyc.data.quizz[testcode];
	var a = 0;
	var q = 0;

	// for a testuser, enter the standard answers for that user
	if (userndx > -1) {
		var example = voyc.data.examples[this.openQuizzId];
		var ans = {};
		var pct = 0;
		var raw = 0;
		var q = 0;
		var a = 0;
		for (var factorcode in example) {
			pct = example[factorcode].pct[userndx];
			ans = example[factorcode].answers;
			if (ans.length) {
				raw = Math.round(pct * ans.length / 100);
				for (var i=0; i<ans.length; i++) {
					q = ans[i];
					a = (i < raw) ? 1 : 2;
					voyc.drzinn.answers.set(testcode,q,a)
				}
			}
			else {
				if (quizz.answertype == 'pct') {
					raw = pct;
				}
				if (quizz.answertype == 'stanine') {
					raw = voyc.stanineFromPct(pct);
				}
				if (quizz.answertype == 'sten') {
					raw = voyc.stenFromPct(pct);
				}
				++q;
				voyc.drzinn.answers.set(testcode,q,raw)
			}
		}
	}
	// for any other user, enter a random answer for all unanswered questions except the last one
	else {
		// 
		var maxa = 0;
		var test = quizz.test;
		for (var i=0; i<test.length-1; i++) {
			q = i + 1;
			if (!voyc.drzinn.answers.get(testcode,q)) {
				maxa = this.getMaxAnswers(quizz,i);
				a = Math.ceil(maxa * Math.random());
				voyc.drzinn.answers.set(testcode,q,a);
			}
		}
	}
	this.updateProgress();
	this.highlightAll();
	this.observer.publish(new voyc.Note('answer-submitted', 'drzinnview', {'quizz':this.openQuizzId, 'q':q, 'a':a}));
}

voyc.DrZinnView.prototype.getMaxAnswers = function(quizz,ndx) {
	switch (quizz.answertype) {
		case 'explicit': return quizz.test[ndx].a.length;
		case 'stanine':  return 9;
		case 'sten':     return 10;
		case 'pct':      return 100;
	}
	return -1;
}

/**
	method populateHTML()
	called on window resize event
	redraws variable sized elements
**/
voyc.DrZinnView.prototype.populateHTML = function() {
	var charts = document.querySelectorAll('chart');
	for (var i=0; i<charts.length; i++) {
		this.populateChart(charts[i]);
	}
}

voyc.DrZinnView.prototype.populateChart = function(elem) {
	var c1 = 'RGB(0,255,255)';
	var c2 = 'RGB(255,255,0)';

	var a = elem.getAttribute('factor').split('-');
	var test = a[0];
	var factor = a[1];
	var fact = voyc.data.factors[test][factor];
	var tst = voyc.data.tests[test];

	if (this.getPole(fact) == 1) {
		var scoreleft = voyc.drzinn.scores.get(test, factor).pct;
		var	labelleft = fact.aleft || fact.left;
		var w = elem.offsetWidth;
		if (w > 400) {
			//labelleft = fact.left + ' (' + voyc.pct(scoreleft,tst.maxscore) + '%)';
			labelleft = fact.left + ' (' + scoreleft + '%)';
		}

		var data = [];
		data[0] = {
			l:labelleft,
			c:0,
			p:scoreleft
		};

		drawgauge(elem, data);
	}
	else if (this.getPole(fact) == 2) {
		var score = voyc.drzinn.scores.get(test, factor);
		var range = this.getRange(test, factor, score);
		var scoreleft = score.pct;
		var scoreright = 100 - scoreleft;
		
		var labelleft = fact.aleft || fact.left;
		var labelright = fact.aright || fact.right;
		var w = elem.offsetWidth;
		if (w > 400) {
			labelleft =   fact.left + ' (' + scoreleft  + '%)';
			labelright = fact.right + ' (' + scoreright + '%)';
		}

		if (score.pct < 0) {
			range = 'balanced';
			scoreleft  = 50;
			scoreright = 50;
			c1 = c2 = '#ffffff';
		}
		
		var data = [];
		data[0] = {
			l:labelleft,
			c:c1,
			p:scoreleft,
			r:(range == 'high') ? 1 : 0,
		};
		data[1] = {
			l:labelright,
			c:c2,
			p:scoreright,
			r:(range == 'low') ? 1 : 0,
		};

		drawpie(elem, data);
	}
}

/**
	utilities
**/
voyc.pct = function(n,max) {
	return parseInt((n / max) * 100,10);
}

voyc.DrZinnView.prototype.getPole = function(factor) {
	var n = factor.pole || voyc.data.tests[factor.test].pole;
	return n;
}

voyc.DrZinnView.prototype.getRange = function(test, factor, score) {
	// determine range: low, high, medium
	var range = '';
	var low = 35;
	var high = 65;
	if (score.pct < low)
		range = 'low';
	else if (score.pct > high)
		range = 'high';
	else {
		range = 'medium';
	}
	return range;
}

/**
	getPageid(test,factor)
	getPageTitle(test,factor)
	
	Examples:
		pageid                  pagetitle
		temperament-all         Temperament All
		temperament-extravert   Temperament Extravert
**/
voyc.DrZinnView.prototype.getPageId = function(test, factor) {
	return test + '-' + factor;
}

voyc.DrZinnView.prototype.getPageTitle = function(test, factor) {
	return voyc.data.tests[test].display + '-' + voyc.data.factors[factor].left;
}

voyc.DrZinnView.prototype.getTestTitle = function(test) {
	return voyc.data.tests[test].display;
}

/**
	obsolete
*/
voyc.DrZinnView.prototype.changePerson = function(s) {
	return;
	var t = s;
	t = t.replace(/your/g, 'my');
	t = t.replace(/Your/g, 'My');
	t = t.replace(/yours/g, 'mine');
	t = t.replace(/You are/g, 'I am');
	t = t.replace(/you are/g, 'I am');
	t = t.replace(/You were/g, 'I was');
	t = t.replace(/you were/g, 'I was');
	t = t.replace(/You/g, 'I');
	t = t.replace(/you/g, 'I');
	return t;
}

voyc.DrZinnView.prototype.composeQuizzScroller = function(quizzid) {
	this.openQuizzId = quizzid;
	var quizz = voyc.data.quizz[quizzid];

	var s = '';
	s += "<p>" + quizz.directions.replace(/\n/g, '</p><p>') + "</p>";

	var t = '';
	var p = '';
	var a = '';
	var test = quizz.test;
	if (quizz.answertype == 'stanine' || quizz.answertype == 'sten') {
		var numAnswers = (quizz.answertype == 'stanine') ? 9 : 10;
		var pat = "<div id='q%n%' class='qblock'><div id='q%n%_t' class='quest questh'>%n%. %t%</div>%a%</div>";
		var pata = "<div id='q%n%_a%v%' class='ans ansh'>%a%</div>";
		for (var i=0; i<test.length; i++) {
			a = '';
			for (var j=1; j<=numAnswers; j++) {
				t = pata;
				t = t.replace(/%n%/g, test[i].n);
				t = t.replace(/%a%/g, j.toString());
				t = t.replace(/%v%/g, j.toString());
				a += t;
			}
			p = pat;
			p = p.replace(/%n%/g, test[i].n);
			p = p.replace(/%t%/g, test[i].q);
			p = p.replace(/%a%/g, a);
			s += p;
		}
	}
	else if (quizz.answertype == 'pct') {
		var pat = "<div id='q%n%' class='qblock'><div id='q%n%_t' class='quest questh'>%n%. %t%</div>";
		pat += "<input id='q%n%' class='ansh' type='number' min='0' max='100' steps='1' value='0'/></div>";
		for (var i=0; i<test.length; i++) {
			p = pat;
			p = p.replace(/%n%/g, test[i].n);
			p = p.replace(/%t%/g, test[i].q);
			s += p;
		}
	}
	else if (quizz.answertype == 'explicit') {
		var pat = "<div id='q%n%' class='qblock'><div id='q%n%_t' class='quest'>%n%. %t%</div>%a%</div>";
		var pata = "<div id='q%n%_a%v%' class='ans'>%a%</div>";
		for (var i=0; i<test.length; i++) {
			a = '';
			for (var j=0; j<test[i].a.length; j++) {
				t = pata;
				t = t.replace(/%n%/g, test[i].n);
				t = t.replace(/%a%/g, test[i].a[j].t);
				t = t.replace(/%v%/g, test[i].a[j].v);
				a += t;
			}
			p = pat;
			p = p.replace(/%n%/g, test[i].n);
			p = p.replace(/%t%/g, test[i].q);
			p = p.replace(/%a%/g, a);
			s += p;
		}
	}
	return s;
}

voyc.DrZinnView.prototype.onAnswerSubmitted = function(note) {
}

voyc.DrZinnView.prototype.onQuizzRequested = function(note) {
	this.highlightAll();
}

voyc.DrZinnView.prototype.highlightAll = function() {
	// loop thru the quizz and highlight all answered answers
	if (this.openQuizzId) {
		var answers = voyc.drzinn.answers.collect(this.openQuizzId);
		var q = 0;
		var a = 0;
		for (var i=0; i<answers.length; i++) {
			q = i+1;
			a = answers[i];
			if (a) {
				if (voyc.data.quizz[this.openQuizzId].answertype == 'pct') {
					document.querySelector('input[id=q'+q+']').value = a;
				}
				else {
					this.highlightAnswer(q,a);
				}
			}
		}
		var isComplete = this.updateProgress();
	}
}

voyc.DrZinnView.prototype.onAnswerClick = function(e) {
	var id = e.currentTarget.id;
	var a = id.split('_');
	var q = parseInt(a[0].substring(1),10);
	var a = parseInt(a[1].substring(1),10);
	this.highlightAnswer(q,a);
	voyc.drzinn.answers.set(this.openQuizzId,q,a);
	this.updateProgress();
	this.observer.publish(new voyc.Note('answer-submitted', 'drzinnview', {'quizz':this.openQuizzId, 'q':q, 'a':a}));
}

voyc.DrZinnView.prototype.onAnswerInput = function(e) {
	var id = e.currentTarget.id;
	var q = parseInt(id.substring(1),10);
	var a = parseInt(e.currentTarget.value,10);
	voyc.drzinn.answers.set(this.openQuizzId,q,a);
	this.updateProgress();
	this.observer.publish(new voyc.Note('answer-submitted', 'drzinnview', {'quizz':this.openQuizzId, 'q':q, 'a':a}));
}

/**
*/
voyc.DrZinnView.prototype.updateProgress = function() {
	var cnt = voyc.drzinn.answers.count(this.openQuizzId);
	var tot = voyc.countQuestions(this.openQuizzId);
	document.getElementById('testprogress').value = cnt;
	document.getElementById('testprogress').max = tot;
	document.getElementById('numanswers').innerHTML = cnt;
	document.getElementById('numquestions').innerHTML = tot;
	document.getElementById('teststatus').innerHTML = (cnt == tot) ? ' - Completed!' : '';
	return (cnt == tot);
}

/**
	both q and a are non-zero
*/
voyc.DrZinnView.prototype.highlightAnswer = function(q,a) {
	// change the style of all the answers
	var ae = document.querySelectorAll('[id=q'+q+'] .ans');
	for (var i=0; i<ae.length; i++) {
		ae[i].classList.remove('chosen');
	}

	// change the style of selected answer
	document.getElementById('q'+q+'_a'+a).classList.toggle('chosen');
}

/**
	window handlers
**/
window.addEventListener('load', function() {
}, false);

window.addEventListener('resize', function() {
	(new voyc.DrZinnView).populateHTML();
}, false);
