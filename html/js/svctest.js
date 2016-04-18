svctest = {};
svctest.svcs = {
	register:		{uname:1, email:1, pword:1, rmrq:0, both:0, pnew:0, si:0, rm:0, tic:0},
	verify:			{uname:0, email:0, pword:1, rmrq:0, both:0, pnew:0, si:1, rm:0, tic:1},
	login:			{uname:0, email:0, pword:1, rmrq:1, both:1, pnew:0, si:0, rm:0, tic:0},
	relogin:		{uname:0, email:0, pword:0, rmrq:0, both:0, pnew:0, si:0, rm:1, tic:0},
	logout:			{uname:0, email:0, pword:0, rmrq:0, both:0, pnew:0, si:1, rm:0, tic:0},
	changepassword:	{uname:0, email:0, pword:1, rmrq:0, both:0, pnew:1, si:1, rm:0, tic:0},
	changeusername:	{uname:1, email:0, pword:1, rmrq:0, both:0, pnew:0, si:1, rm:0, tic:0},
	changeemail:	{uname:0, email:1, pword:1, rmrq:0, both:0, pnew:0, si:1, rm:0, tic:0},
	forgot:			{uname:0, email:0, pword:0, rmrq:0, both:1, pnew:0, si:0, rm:0, tic:0},
	reset:			{uname:0, email:0, pword:0, rmrq:0, both:0, pnew:1, si:1, rm:0, tic:1},
	stub:			{uname:0, email:0, pword:0, rmrq:0, both:0, pnew:0, si:1, rm:0, tic:0},
}
svctest.fields = {
	uname:	{type:'text'    , display:'username'},
	email:	{type:'text'    , display:'email'},
	pword:	{type:'text'    , display:'password'},
	rmrq:	{type:'checkbox', display:'remember me requested'},
	both:	{type:'text'    , display:'username or email'},
	pnew:	{type:'text'    , display:'new password'},
	si:		{type:'text'    , display:'session-id'},
	rm:		{type:'text'    , display:'remember-me'},
	tic:	{type:'text'    , display:'temporary id code'},
}

window.onload = function() {
	// initialize the UI
	drawScreen();
	attachDomEventHandlers();
	$('register').click();  // select first radio button
	
	// initialize the server communications
	svctest.comm = new Comm('http://accounts.hagstrand.com/svc/', '', 0); 
}

drawScreen = function() {
	// draw an input for each field
	var field,r,p;
	for (var k in svctest.fields) {
		field = svctest.fields[k];

		p = document.createElement('div');
		p.className = 'line';
		$('fields').appendChild(p);

		if (k == 'si' || k == 'rm') {
			r = document.createElement('input');
			r.type = 'button';
			r.className = 'copybtn';
			r.id = k+'btn';
			r.value = 'copy';
			p.appendChild(r);
		}

		r = document.createElement('label');
		r.innerHTML = k + ':&nbsp;';
		p.appendChild(r);

		r = document.createElement('input');
		r.type = field.type;
		r.id = k;
		r.placeholder = field.display;
		p.appendChild(r);

		r = document.createElement('span');
		r.innerHTML = '&nbsp;*';
		r.className = 'red';
		r.style.visibility = 'hidden';
		r.id = k+'req';
		p.appendChild(r);
	}

	// draw a radio button for each svc
	var svc,r,p;
	for (var k in svctest.svcs) {
		svc = svctest.svcs[k];

		p = document.createElement('div');
		p.className = 'line';
		$('svcs').appendChild(p);

		r = document.createElement('input');
		r.type = 'radio';
		r.name = 'svc';
		r.id = k;
		p.appendChild(r);

		r = document.createElement('label');
		r.innerHTML = k;
		r.setAttribute('for', k);
		p.appendChild(r);
	}
}

attachDomEventHandlers = function() {
	// attach click handler to each radio button
	var svc,r,f;
	for (var k in svctest.svcs) {
		svc = svctest.svcs[k];
		r = $(k);
		r.addEventListener('click', function(event) {
			var svc = svctest.svcs[event.target.id];
			for (var m in svc) {
				var f = svc[m];
				if (f == 0) {
					$(m+'req').style.visibility = 'hidden';
				}
				else if (f == 1) {
					$(m+'req').style.visibility = 'visible';
				}
			}
		});
	}

	// attach click handler to copy buttons
	$('stbtn').addEventListener('click', function(event) {
		$('si').value = svctest.response.si;
	});
	$('rmbtn').addEventListener('click', function(event) {
		$('rm').value = svctest.response.rm;
	});

	// attach click handler to submit button
	$('callserver').addEventListener('click', function(event) {
		// get name of svc from selected checkbox
		var svcname = document.querySelector('input[name="svc"]:checked').id;

		// move required inputs into postdata object
		var postdata = {};
		var svc = svctest.svcs[svcname];
		var f;
		for (var m in svc) {
			f = svc[m];
			if (f) {
				if (svctest.fields[m].type == 'checkbox') {
					postdata[m] = ($(m).checked) ? 't' : 'f';
				}
				else {
					postdata[m] = $(m).value;
				}
			}
		}
		
		// display postdata
		$('postdata').innerHTML = dumpObject(postdata);
		$('response').innerHTML = '';
		
		// call the service
		// one indicator for svc in progress/success/fail
		// in the div with the submit button
		$('ok').innerHTML = 'waiting...';
		
		svctest.comm.request(svcname, postdata, function(ok,response,xhr) {
			$('ok').innerHTML = (ok) ? 'ok: true' : 'ok: false';
			
			// save and display the response
			svctest.response = response;
			$('response').innerHTML = dumpObject(response);
		});
	});
}
