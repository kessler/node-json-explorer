var Duplex = require('stream').Duplex
var util = require('util')

module.exports = Accumulator

util.inherits(Accumulator, Duplex)
function Accumulator() {

	Duplex.call(this)
	this.steps = []
	this.currentIndex = 0	
}

Accumulator.prototype._write = function(chunk, enc, cb) {
	this.steps.push(chunk)
	cb()
}

Accumulator.prototype._read = function(size) {
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