var Duplex = require('stream').Duplex
var util = require('util')

module.exports = ReplayStream

// TODO this is really a bad stream since it buffers stuff in memory
// I should find another solution for this and client refresh

util.inherits(ReplayStream, Duplex)
function ReplayStream() {

	Duplex.call(this)
	this.steps = []
	this.currentIndex = 0	
}

ReplayStream.prototype._write = function(chunk, enc, cb) {
	this.steps.push(chunk)
	cb()
}

ReplayStream.prototype._read = function(size) {
	console.log(this.currentIndex, this.steps.length)
	if (this.steps.length === 0)
		return this.push(null)

	if (this.currentIndex === this.steps.length) {
		this.push(null)
		this.currentIndex = 0
		return
	}

	var current = this.steps[this.currentIndex++]
	if (current)
		return this.push(current)	
}