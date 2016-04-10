$ = function(s) {
	return document.getElementById(s);
}

appendScript = function(file) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = file;
	document.getElementsByTagName("head")[0].appendChild(script);
}

hasClass = function(ele,cls) {
	if (!ele || !ele.className) {
		return false;
	}
	return ele.className.match(new RegExp("(\\s|^)"+cls+"(\\s|$)"));
}

addClass = function(ele,cls) {
	if (!ele) {
		return false;
	}
	if (!this.hasClass(ele,cls)) {
		ele.className+=" "+cls;
	}
}

removeClass = function(ele,cls) {
	if (hasClass(ele,cls)) {
		var reg=new RegExp("(\\s|^)"+cls+"(\\s|$)");
		ele.className=ele.className.replace(reg," ")
	}
}

clone = function(obj) {
	var newObj={};
	for(i in obj) {
		if (obj[i]&&typeof obj[i]=="object") {
			newObj[i]=clone(obj[i]);
		}
		else {
			newObj[i]=obj[i];
		}
	}
	return newObj;
}

center = function(elem, container) {
	// center a div within a container
	var g = document.getElementById(elem);
	g.style.margin = 'auto auto';
	var gHt = g.offsetHeight;
	var gWid = g.offsetWidth;
	
	var f = document.getElementById(container);
	var fHt = f.offsetHeight;
	var fWid = f.offsetWidth;

	// center horizontally
	var w = fWid - gWid;
	if (w) {
		var left = Math.floor(w / 2);
		var pct = Math.floor((left/fWid) * 100);
		g.style.margin = 'auto ' + pct + '%';
	}		

	// center vertically
	var h = fHt - gHt;
	if (h) {
		var top = Math.floor(h / 2);
		g.style.top = top + 'px';
	}
}

// return a multi-line string display of an object's members
dumpObject = function(obj,depth) {
	incIndent = function() {
		numIndent++;
		indentstr = composeIndentStr(numIndent);
	}
	decIndent = function() {
		numIndent--;
		indentstr = composeIndentStr(numIndent);
	}
	composeIndentStr = function(num) {
		var s = '';
		for (var i=0; i<num; i++) {
			s += "&nbsp;&nbsp;&nbsp;"
		}
		return s;
	}
	dumpObjectR = function(obj) {
		var t;
		for (var x in obj) {
			t = obj[x];
			if (typeof(t) == "string") {
				t = '&apos;' + t + '&apos;';
			}
			if (typeof(t) == "object") {
				str += indentstr+x+"= {<br/>";
				incIndent();
				dumpObjectR(t);
				decIndent();
				str += indentstr+"}<br/>";
			}
			else {
				str += indentstr+x+"="+t+"<br/>";
			}
		}
	}
	var numIndent = 0;
	var indentstr = '';
	var str = '';
	dumpObjectR(obj);
	return str;
}
