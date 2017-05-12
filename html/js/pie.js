function drawpie(elem, data) {
	// elem is required, an HTML element to contain the chart canvas
	var canvas = elem.childNodes[0];
	
	// first-time, create the canvas object
	if (typeof(canvas) == 'undefined') {
		canvas = document.createElement('canvas');
		canvas.className = 'graphcanvas';
		elem.appendChild(canvas);
	}
	
	// initial data is attached to the elem
	var pdata = {};
	if (typeof(data) == 'undefined') {
		pdata = JSON.parse(elem.getAttribute('data'));
	}
	else {
		pdata = data;
		elem.setAttribute('data', JSON.stringify(pdata));
	}
	if (!pdata) {
		return -1; // error
	}
	
	var style = window.getComputedStyle(elem);
	var w = canvas.width  = parseInt(style.width);
	var h = canvas.height = parseInt(style.height);
	var w2 = parseInt(canvas.width/2);
	var h2 = parseInt(canvas.height/2);
	var r = Math.floor(Math.min(w, h)/2);

	// calc total p and largest p
	var pTotal = 0;
	var pLarge = -1;
	var iLarge = -1;
	for(var i = 0; i < pdata.length; i++) {
		pTotal += pdata[i].p;
		if (pLarge < pdata[i].p) {
			pLarge = pdata[i].p;
			iLarge = i;
		}
	}

	// draw each piece of the pie
	var startpos = .75; // pct of circle, 0=1=90 degrees east, .75=straight up north
	var lastend = Math.PI*2*startpos;
	var ctx = canvas.getContext("2d");
	for (var i = 0; i < pdata.length; i++) {
		// draw pie piece
		ctx.fillStyle = pdata[i].c;
		ctx.beginPath();
		ctx.moveTo(w2,h2);
		ctx.arc(w2,h2,h2,lastend,lastend+(Math.PI*2*(pdata[i].p/pTotal)),false);
		ctx.lineTo(w2,h2);
		ctx.fill();
		
		// save ending point for beginning of next piece
		lastend += Math.PI*2*(pdata[i].p/pTotal);
	}
	
	// repeat to draw the labels
	var lastend = Math.PI*2*startpos;
	for (var i = 0; i < pdata.length; i++) {
		// find midpoint on the circumference of this pie piece
		var centerangle = lastend + Math.PI*2*((pdata[i].p/pTotal)/2);
		x = w2 + r/2 * Math.cos(centerangle);
		y = h2 + r/2 * Math.sin(centerangle);
		//ctx.fillStyle = 'black';
		//ctx.fillRect(x-1,y-1,2,2);
		
		// save ending point for beginning of next piece
		lastend += Math.PI*2*(pdata[i].p/pTotal);
		
		// draw text label
		if (typeof pdata[i].l != 'undefined') {
			// if there are two pieces, bold the larger one
			ctx.fillStyle = 'black';
			ctx.font = '12pt Arial';
			if (i == iLarge) {
				ctx.font = 'Bold 14pt Arial';
			}
			
			// go right and left from center
			if (x<w2) {
				x -= ctx.measureText(pdata[i].l).width;
			}

			// keep text from going off-screen
			var tw = ctx.measureText(pdata[i].l).width;
			if (x+tw > w) {
				x = w - tw;
			}
			if (x < 0) {
				x = 0;
			}
			
			
			ctx.fillText(pdata[i].l, x, y);
		}
		
		// draw image label
		if (typeof pdata[i].i != 'undefined') {
			var img = document.getElementById(pdata[i].i);
			ctx.drawImage(img, x-(img.width/2), y-(img.height/2), img.width, img.height);
		}
	}
}
