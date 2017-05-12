Peg.prototype.composeQuizzScroller = function(quizzid) {
	this.openquizzid = quizzid;
	var quizz = peg.q[quizzid];
	/*
		stored in database per user
		each array matches the corresponding test array
		what about adding, removing and reorganizing questions in the test?
		do we need to keep a sequence for each question?
		NO.  If we reorganize a test, we will do a onetime fix of the answer table in the database.
		this. answers = {
			kiersey: [0,0,0,0],
			runner: [],
			torres: [],
		};
	*/
	if (!this.answers) {
		this.answers = {};
	}
	if (!this.answers[quizzid]) {
		this.answers[quizzid] = [];
	}
//	this.updateProgress();

	var pat = "<div id='q%n%' class='qblock'><div id='q%n%_t'>%n%. %t%</div>%a%</div>";
	var pata = "<div id='q%n%_a%v%' class='ans'>%a%</div>";
	var s = '';
	var t = '';
	var p = '';
	var a = '';
	var test = quizz.test;
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
	return s;
}

Peg.prototype.answer = function(id) {
	var x = id;
	
	// change the style of all the other answers
	var a = id.split('_');
	var ae = document.querySelectorAll('[id='+a[0]+'] .ans');
	for (var i=0; i<ae.length; i++) {
		ae[i].classList.remove('chosen');
	}

	// change the style
	document.getElementById(id).classList.toggle('chosen');

	// store the answer

	var n = parseInt(a[0].substring(1));
	var v = parseInt(a[1].substring(1));

	this.answers[this.openquizzid][n] = v;
	
	this.updateProgress();
	return;
}

Peg.prototype.updateProgress = function() {
	var cnt = this.countAnswers();
	var tot = peg.q[this.openquizzid].test.length;
	document.getElementById('testprogress').max = tot;
	document.getElementById('testprogress').value = cnt;
}

Peg.prototype.countAnswers = function() {
	var cnt = 0;
	var test = peg.q[this.openquizzid].test;
	for (i=1; i<=test.length; i++) {
		//if (test[i].r > 0) {
		if (this.answers[this.openquizzid][i] > 0) {
			cnt++;
		}
	}
	return cnt;
}