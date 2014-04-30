var EventEmitter = require('events').EventEmitter
var util = require('util')
var log = require('./log.js')

module.exports = Node

util.inherits(Node, EventEmitter)
function Node(id) {

	if (!(this instanceof Node))
		return new Node(options);

	EventEmitter.call(this)

	this.size = 3
	this.id = id
	this._value = undefined
	this._added = false
	this.level = 0
	this._initProps()
}

Node.prototype.key = function(key) {
	if (key === undefined)
		return this._key

	this._key = key
}

Node.prototype.value = function (object) {

	if (object === undefined) return this._value

	this._value = object
	this.type = typeof this._value

	if (this.type !== 'object') return

	this._initProps()

	if (util.isArray(this._value)) {
		this.type = 'array'
		this.properties += 'length: ' + this._value.length + ' (number)';
		return ;
	}

	this.properties += '<ul>'
	this.simpleProperties = 0

	for (var p in this._value) {
		var value = this._value[p]
		var type = typeof value

		if (type === 'object') continue

		this.simpleProperties++

		this.properties += '<li>' + p + ': '

		if (value === undefined) {
			this.properties += 'undefined'
		} else if (value === null) {
			this.properties += 'null'
		} else {
			this.properties += value.toString()
			this.properties += ' (' + type + ')'
		}

		this.properties += '</li>'
	}

	this.properties += '</ul>'
}

Node.prototype.addChild = function(child) {

	if (child === undefined) throw new Error('undefined child')

	log.debug('adding child %s (%s) to %s (%s)', child.id, child.level, this.id, this.level)

	if (child.level && child.level < this.level) throw new Error(this.level + ' > ' + child.level)


	if (child.parent){
		if (child.parent !== this)
			throw new Error('already added somewhere else')

		return
	}

	child.parent = this

	if (!this.children) this.children = []

	this.children.push(child)

	this.size = this.children.length * 3

	this.emit('new child', this, child)
}

Node.prototype._initProps = function () {
	this.properties = '<h3>' + this.id + '</h3>'
}