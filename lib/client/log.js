var INFO = 2
var DEBUG = 3
var level = INFO

module.exports = function() {
	if (level >= INFO)
		console.log.apply(console, arguments)
}

module.exports.setLevel = function(l) {
	level = l
}

module.exports.debug = function() {
	if (level >= DEBUG)
		console.log.apply(console, arguments)
}

module.exports.info = function() {
	if (level >= INFO)
		console.log.apply(console, arguments)
}