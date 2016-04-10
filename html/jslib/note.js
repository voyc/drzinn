/*
	Note, as in Notification.
	A Note is passed from publisher to subscribers 
	by the Observer.
*/
Note = function(name, publisher, payload) {
	this.name = name,
	this.publisher = publisher,
	this.payload = payload,
	this.start = Date.now(),
	this.end = 0;
	this.elapsed = 0;
}

Note.prototype = {
	finish: function() {
		this.end = Date.now();
		this.elapsed = this.end - this.start;
	},
	toString: function() {
		var s = name
		return s;
	}
}
