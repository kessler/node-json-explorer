#!/usr/bin/env node

var http = require('http')
var child = require('child_process')
var findPort = require('find-port')
var os = require('os')
var rc = module.require('rc')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var WebSocketServer = require('ws').Server
var JsonObjectStream = require('./lib/JsonObjectStream.js')
var Duplex = require('stream').Duplex
var debug = require('debug')('json-explorer')
var nomnom = require('nomnom')
var ReplayStream = require('./lib/ReplayStream.js')
var Writable = require('stream').Writable

nomnom.option('layout', {
	abbr: 'l',
	default: 'tree',
	help: 'which layout to use, available: tree, force'
})

var opts = nomnom.parse()

var replayStream = new ReplayStream()

var devnull = new Writable
devnull._write = function(c,e,cb) {
	cb()
}

var config = rc('json-explorer', {})

if (config.usage) {
	console.log('--port to override automatic port selection')
	process.exit(0)
}

if (config.port) {
	cat(config.port)
} else {
	findPort(8080, 8181, function(ports) {
		if (ports.length === 0)
			throw new Error('no available ports found between 8080 - 8181')
		else
			cat(ports.pop())
	})
}

function cat(port) {
	var now = Date.now()
	var client = fs.readFileSync(path.join(__dirname, 'clientIndex.min.js')).toString('utf8').replace('{{port}}', port)
	var container = fs.readFileSync(path.join(__dirname, 'container.html')).toString('utf8').replace('{{cache_bust}}', now)

	var server = http.createServer(handler)
	

	var wss = new WebSocketServer({ server: server })

	wss.on('connection', function(ws) {		
		var jos = new JsonObjectStream()

		debug('ws connection')

		jos.on('object start', function(key, parentKey, level) {
			var message = {
				event: 1,
				key: key,
				parentKey: parentKey,
				level: level
			}

			ws.send(JSON.stringify(message), function() { /* ignore errors */ })
		})

		jos.on('object', function(key, object, parentKey, level) {
			var message = {
				event: 2,
				level: level,
				object: JSON.parse(object),
				key: key,
				parentKey: parentKey
			}

			ws.send(JSON.stringify(message), function() { /* ignore errors */ })
		})

		jos.on('end', function () {
			debug('jos end')
			ws.close()
			//process.exit()
		})

		//TODO refactor
		if (replayStream.steps.length > 0) {
			replayStream.pipe(jos).pipe(devnull)
		} else {
			
			process.stdin.pipe(jos).pipe(replayStream)
		}

		ws.on('close', function() {
			debug('ws closed')
		})
	})

	server.listen(port)

	var command = 'open'

	if (process.platform === 'win32')
		command = 'start'

	child.exec(command + ' http://localhost:' + port + '?layout=' + opts.layout)

	function handler(request, response) {

		if (request.url === '/clientIndex.min.js?cb=' + now) {

			response.setHeader('Content-Type', 'application/javascript')
			response.setHeader('Content-Length', Buffer.byteLength(client))
			response.end(client)

		} else {

			response.setHeader('Content-Type', 'text/html')
			response.setHeader('Content-Length', Buffer.byteLength(container))
			response.end(container)
		}
	}
}

function renderScripts(scripts) {
	var results = ''

	for (var script in scripts) {
		results += '<script src="/' + script + '"></script>'
	}

	return results
}