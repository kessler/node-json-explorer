var INFO = 2
var DEBUG = 3
var level = INFO

module.exports.setLevel = function(l) {
	level = l
}

module.exports.debug = function() {
	if (level >= DEBUG)
		console.log.apply(console, arguments)
}