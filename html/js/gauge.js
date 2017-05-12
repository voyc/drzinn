// http://bernii.github.io/gauge.js/

function drawgauge(elem, data) {
	// elem is required, an HTML element to contain the chart canvas
	var canvas = elem.childNodes[0];
	
	// first-time, create the canvas object
	if (typeof(canvas) == 'undefined') {
		canvas = document.createElement('canvas');
		canvas.className = 'graphcanvas';
		elem.appendChild(canvas);
	}
	
	var pdata = data;
	// initial data is attached to the elem
	//var pdata = {};
	//if (typeof(data) == 'undefined') {
	//	pdata = JSON.parse(elem.getAttribute('data'));
	//}
	//else {
	//	pdata = data;
	//	elem.setAttribute('data', JSON.stringify(pdata));
	//}
	//if (!pdata) {
	//	return -1; // error
	//}
	
	var style = window.getComputedStyle(elem);
	var w = canvas.width  = parseInt(style.width);
	var h = canvas.height = parseInt(style.height);
	var r = Math.floor(Math.min(w, h)/2);
	var w2 = parseInt(canvas.width/2);
	var h2 = parseInt(canvas.height/2);
	var r2 = parseInt(r * .75);
	var ctx = canvas.getContext("2d");

	// draw outer ring: three pie pieces: low medium high, red, yellow, green
	var sections = [
		{ pct:.30, c:'red' },
		{ pct:.70, c:'yellow' },
		{ pct:1, c:'green' },
	];
	var startarc = .50; // pct of circle, 0=1=90 degrees east, .75=straight up north
	var endarc = 1.00;
	var startpos = Math.PI*2*startarc;
	var endpos = Math.PI*2*endarc;
	for (var i=0; i<sections.length; i++) {
		endpos = Math.PI*2*(startarc + (sections[i].pct * (endarc-startarc)));
		ctx.fillStyle = sections[i].c;
		ctx.beginPath();
		ctx.moveTo(w2,h2);
		ctx.arc(w2,h2,r,startpos,endpos,false);
		ctx.lineTo(w2,h2);
		ctx.fill();
		startpos = endpos;
	}
	
	// draw inner ring: one pie piece, half the pie
	startpos = Math.PI*2*startarc;
	endpos = Math.PI*2*endarc;
	ctx.fillStyle = 'RGB(194,194,194)';
	ctx.beginPath();
	ctx.moveTo(w2,h2);
	ctx.arc(w2,h2,r2,startpos,endpos,false);
	ctx.lineTo(w2,h2);
	ctx.fill();
	
	// draw needle
	var p = pdata[0].p;
	var pct = p / 100;
	var angle = startarc + (pct * (endarc-startarc));
	var radians = Math.PI*2*angle;
	var strokeWidth = 4;

	var x = Math.round(r * Math.cos(radians));
	var y = Math.round(r * Math.sin(radians));
	var startX = Math.round(strokeWidth * Math.cos(radians - Math.PI / 2));
	var startY = Math.round(strokeWidth * Math.sin(radians - Math.PI / 2));
	var   endX = Math.round(strokeWidth * Math.cos(radians + Math.PI / 2));
	var   endY = Math.round(strokeWidth * Math.sin(radians + Math.PI / 2));

	ctx.fillStyle = 'black';

	ctx.save();
	ctx.translate(w2,h2);
	ctx.beginPath();
	ctx.arc(0, 0, 4, 0, Math.PI * 2, false);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(x, y);
	ctx.lineTo(endX, endY);
	ctx.fill();
	ctx.restore();

	// draw label name underneath
	var label = pdata[0].l;
	x = w2;
	y = h2 + 30;
	ctx.fillStyle = 'black';
	ctx.font = '12pt Arial';
	x -= ctx.measureText(label).width / 2;
	ctx.fillText(label, x, y);
	return;
}
