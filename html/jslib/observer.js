/*
	Observer
	Passes Note objects from publishers to subscribers.
*/
Observer = function() {
	this.stack = [];
}

Observer.prototype = {
	subscribe: function(notename, subscriber, callback) {
		//console.log('note '+notename+' subscribed to by '+subscriber);
	
		// first time subscribed, create the callback-array
		if (!this.stack[notename]) {
			this.stack[notename] = [];
		}

		// add this callback to the callback-array for this notename
		this.stack[notename].push( {'subscriber':subscriber, 'callback':callback});
	},

	publish: function(note) {
		// if no one has subscribed to this notename, exit now
		if (!this.stack[note.name]) {
		   	console.log('note '+note.name+' published by '+note.publisher+' but unsubscribed');
			return;
		}
		
		// call each callback in the callback-array
		console.log('note '+note.name+' published by '+note.publisher);
		var callbackarray = this.stack[note.name];
		var cb,msg;
		var passing = [];
		passing.push(note);
		var self = this;
		setTimeout(function() {
			for (var i in callbackarray) {
				cb = callbackarray[i];
				console.log('note '+note.name+' published to handler '+cb.subscriber);
				cb.callback.apply(self, passing);
			}
		}, 0);
	}
}
