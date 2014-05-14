var EventEmitter = require('events').EventEmitter
var util = require('util')
var log = require('./log.js')

module.exports = Node

util.inherits(Node, EventEmitter)
function Node(id) {

	if (!(this instanceof Node))
		return new Node(options);

	EventEmitter.call(this)

	this.sizeFactor = 2
	this.size = this.sizeFactor
	this.id = id
	this._value = undefined
	this._added = false
	this.level = 0
	this.toggled = true
	this.fullyLoaded = false
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

	if (util.isArray(this._value)) {
		this.type = 'array'
	}

	this.emit('value set', this, this._value, this.type)
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

	if (this.toggled && !this.children) this.children = []
	if (!this.toggled && !this._children) this._children = []

	if (this.toggled)
		this.children.push(child)
	else
		this._children.push(child)

	this.size += this.sizeFactor

	this.emit('new child', this, child)
}

Node.prototype.childrenLength = function () {
	if (this.children) return this.children.length

	if (this._children) return this._children.length

	return 0
}

Node.prototype.toggle = function () {
	log.debug(this.toggled, this.children, this._children)
	if (this.toggled) {
		this._children = this.children;
		this.children = null;
		this.toggled = false
	} else {
		this.children = this._children;
		this._children = null;
		this.toggled = true
	}
}