var Transform = require('stream').Transform
var util = require('util')
var jt = require('./jsonTokens.js')
var debug = require('debug')('json-explorer')
var assert = require('assert')

module.exports = JsonObjectStream

util.inherits(JsonObjectStream, Transform)

function JsonObjectStream(options) {

	if (!(this instanceof JsonObjectStream))
		return new JsonObjectStream(options);

	Transform.call(this, options);

	this._writableState.objectMode = false;
	this._readableState.objectMode = false;

	this._stack = []

	this._counter = 0
	this._expectedBracerEnd
	this._state
}

JsonObjectStream.prototype._transform = function(chunk, encoding, cb) {
	debug('chunk')

	if (encoding === 'buffer')
		encoding = undefined

	var currentLevel = 0

	for (var i = 0, pos = 0; i < chunk.length; i++) {
		var ci = chunk[i]

		// start of object
		if (ci === jt.OBJECT_START || ci === jt.ARRAY_START) {
			debug('object start')

			this._updatePart(chunk, pos, i, encoding)

			var key
			var parentKey
			var parent = this._peekStack(1)

			if (parent) {
				parentKey = parent.key
				currentLevel = parent.level + 1

				try {

					// when current object is a member of an array
					// its key semantics will be { "a": [ '0', '1' etc] }
					// in order to achieve this I parse the key from the parent's
					// parent (the "A"), which is the entry of the object containing
					// the array (if indeed one such entry exists)
					if (parent.isArray) {
						key = '' + parent.arrayLength++
					} else {
						key = JsonObjectStream.getLastKey(parent.content)
					}

				} catch (e) {
					return this.emit('error', e)
				}

				if (!key) {
					return this.emit('error', new Error('parent exist but key not found, json must be invalid'))
				}
			}

			var newEntry = new Entry(String.fromCharCode(ci), key, (ci === jt.OBJECT_START ? jt.OBJECT_END : jt.ARRAY_END), parent)
			newEntry.level = currentLevel

			this.emit('object start', key, parentKey, currentLevel)

			this._stack.push(newEntry)

			pos = i + 1

		// full object
		} else if (ci === jt.OBJECT_END || ci === jt.ARRAY_END) {
			debug('object')

			this._updatePart(chunk, pos, i, encoding)

			var entry = this._stack.pop()

			try {
				entry.assertEndOk(ci)
			} catch (e) {
				return thir.emit('error', e)
			}

			entry.concat(String.fromCharCode(ci))

			this._update(entry.content)

			this.emit('object', entry.key, entry.content, entry.parentKey, entry.level)

			this.push( entry.content )

			pos = i + 1
		}
	}

	this._updatePart(chunk, pos, i, encoding)

	cb();
}

JsonObjectStream.prototype._peekStack = function (offset) {
	return this._stack[this._stack.length - offset]
}

JsonObjectStream.prototype._updatePart = function(chunk, lastPos, currentPos, encoding) {

	if (lastPos >= currentPos) return
	this._update(chunk.slice(lastPos, currentPos).toString(encoding))
}

JsonObjectStream.prototype._update = function(rawString) {

	var current = this._stack[this._stack.length - 1]

	// write the delta of characters from last event (start / end)
	if (current)
		current.concat(rawString)
}

JsonObjectStream.prototype._flush = function(cb) {
	// TODO: do i need to handle leftovers???
	cb();
}

JsonObjectStream.getLastKey = function (chunk) {

	var state = 0

	var start, end, colon

	var result = ''

	var i = chunk.length
	var c

	// iterate over chunk, from the end, look for ':', then look for '"', then store any text until running into next '"'

	for (; i > 0; i--) {
		c = chunk[i]

		if (c === ':') {
			colon = i
			i--
			break
		}
	}

	for (; i > 0 && colon !== undefined; i--) {
		c = chunk[i]

		if (c === '"') {
			end = i
			i--
			break
		}
	}

	for (; i > 0 && end !== undefined; i--) {
		c = chunk[i]

		if (c === '"') {
			start = i + 1
			break
		}
	}

	if (start === undefined) {
		throw new Error('invalid json ' + chunk.toString())
	}

	return chunk.substring(start, end)
}

function Entry(content, key, expectedBracerEnd, parent) {
	this.content = content
	this.key = key
	this.expectedBracerEnd = expectedBracerEnd
	this.parentKey = parent ? parent.key : undefined
	this.isObject = this.expectedBracerEnd === jt.OBJECT_END
	this.isArray = this.expectedBracerEnd === jt.ARRAY_END
	this.arrayLength = 0
	this.isRoot = false
	this.level = 0
}

Entry.prototype.concat = function(something) {
	this.content += something
}

Entry.prototype.assertEndOk = function(end) {
	if (end !== this.expectedBracerEnd) {
		var message = util.format('expected %s but instead got %s, seems like json is invalid', String.fromCharCode(this.expectedBracerEnd), String.fromCharCode(end))
		throw new Error(message)
	}
}