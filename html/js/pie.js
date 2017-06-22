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
	var w = canvas.width  = parseInt(style.width,10);
	var h = canvas.height = parseInt(style.height,10);
	var w2 = parseInt(canvas.width/2,10);
	var h2 = parseInt(canvas.height/2,10);
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

	// if no scores, draw a circle
	if (pdata[0].c == pdata[1].c) {
		ctx.strokeStyle = '#444444';
		ctx.beginPath();
		ctx.arc(w2,h2,h2,0,2*Math.PI);
		ctx.stroke();
	}
	
	// repeat to draw the labels
	ctx.strokeStyle = '#000000';
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
			if (pdata[i].r) {
				ctx.font = 'Bold 12pt Arial';
			}

			// measure text	
			var tsize = ctx.measureText(pdata[i].l);

			// go right and left from center
			if (x<w2) {
				x -= tsize.width;
			}

			// keep text from going off-screen
			var tw = tsize.width;
			if (x+tw > w) {
				x = w - tw;
			}
			if (x < 0) {
				x = 0;
			}

			// insert minimal vertical space between labels
			// compare y to centerline
			// if y is between h2 and h2 - half the text height
			if (pdata.length == 2) {
				tsize.height = 20;  // faking it
				var th2 = tsize.height / 2;
				if ((y<h2) && (y>(h2-th2))) {
					y = h2 - th2;
				}
				else if ((y>=h2) && (y < (h2+th2))) {
					y = h2 + th2;
				}
			}
			
			ctx.shadowColor = pdata[i].c;
			ctx.shadowOffsetX = .5; 
			ctx.shadowOffsetY = .5; 
			ctx.shadowBlur = 0;
			ctx.textBaseline = 'middle';
			ctx.fillText(pdata[i].l, x, y);
		}
		
		// draw image label
		if (typeof pdata[i].i != 'undefined') {
			var img = document.getElementById(pdata[i].i);
			ctx.drawImage(img, x-(img.width/2), y-(img.height/2), img.width, img.height);
		}
	}
}
