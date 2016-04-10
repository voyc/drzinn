/*
 * class Secure
 */
function Secure() {
}

Secure.prototype = {
	// called during window.load event
	load: function() {
		// model
		this.user = new User();
		
		// view
		this.modal = new Modal();
		
		// controller
		this.observer = new Observer();
		
		// run setups
		this.observer.setup();
		this.user.setup();
		this.modal.setup();

		// ready to start
		flash.observer.publish(new Note('setup-complete', 'secure', {}));
	},
}
