/**
	class voyc.Remarks
	@constructor
	singleton
	
*/
voyc.Remarks = function () {
	if (voyc.Remarks._instance) return voyc.Remarks._instance;
	voyc.Remarks._instance = this;

	this.remarks = {};
	this.setup();
}

voyc.Remarks.prototype.setup = function() {
	for (testcode in voyc.data.tests) {
		this.remarks[testcode] = [];
	}
}

voyc.Remarks.prototype.clear = function() {
	this.setup();
}

/**
	Set one remark.
	@param {string} testcode - Name of test.
	@param {string} factorcode - Name of factor.
	@param {string} remark - A free-form text string.
*/
voyc.Remarks.prototype.set = function(testcode,factorcode, remark) {
	this.remarks[testcode][factorcode] = remark;
}

/**
	Return one remark.
	@param {string} testcode - Name of test.
	@param {string} factorcode - Name of factor.
*/
voyc.Remarks.prototype.get = function(testcode,factorcode) {
	var a = this.remarks[testcode][factorcode];
	if (!Boolean(a)) {
		a = '';
	}
	return a;
}
