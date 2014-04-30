var JsonObjectStream = require('../lib/JsonObjectStream.js')
var assert = require('assert')
var fs = require('fs')
var path = require('path')
var Writable = require('stream').Writable

var log = new Writable
log._write = function(chunk, enc, cb) {
	cb()
}

describe('JsonObjectStream', function () {

	var stream
	var jds

	beforeEach(function () {
		stream = fs.createReadStream(path.join(__dirname, 'test.json'), { highWaterMark: 3 })
		jds = new JsonObjectStream()
	})

	it('streams a json object as mini objects dfs', function (done) {

		var expectedData = [
			{ key: 'abc', parentKey: undefined, object: { b: 'la1א' }},
			{ key: 'b', parentKey: undefined, object: { b: 'lb1' }},
			{ key: 'c', parentKey: undefined, object: { b: 'lc1' }},
			{ key: '0', parentKey: 'a', object: { ar: '1' }},
			{ key: '1', parentKey: 'a', object: { ar: '2' }},
			{ key: 'a', parentKey: 'd', object: [{ ar: '1' }, { ar: '2' }]},
			{ key: 'b', parentKey: 'd', object: [ '1', 2 ]},
			{ key: 'a', parentKey: 'c', object: { b: 'la3' }},
			{ key: 'b', parentKey: 'c', object: { b: 'lb3' }},
			{ key: 'c', parentKey: 'd', object: { a: { b: 'la3' }, b: { b: 'lb3' } }},
			{ key: 'd', parentKey: undefined, object: { a: [{ ar: '1' }, { ar: '2' }], b: [ '1', 2 ], c: { a: { b: 'la3' }, b: { b: 'lb3' }}, x: 3 }},
			{ key: undefined, parentKey: undefined, object: { abc: { b: 'la1א' }, b: { b: 'lb1' }, c: { b: 'lc1' }, d: { a: [{ ar: '1' }, { ar: '2' }], b: [ '1', 2 ], c: { a: { b: 'la3' }, b: { b: 'lb3' }}, x: 3} }}]

		var count = 0

		jds.on('object', function (key, object, parentKey, level) {

			var expected = expectedData[count]

			assert.strictEqual(key, expected.key)
			assert.strictEqual(parentKey, expected.parentKey)
			assert.deepEqual(JSON.parse(object), expected.object)

			count++
		})

		jds.on('end', function () {
			assert.strictEqual(count, expectedData.length)
			done()
		})

		stream.pipe(jds).pipe(log)
	})

	it('has a utility to get the recent key from a json chunk', function () {
		var chunk = '"b": {}, "abc":  {'

		assert.strictEqual(JsonObjectStream.getLastKey(chunk).toString(), 'abc')
	})
})
