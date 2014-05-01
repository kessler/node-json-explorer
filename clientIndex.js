var DocumentLoadedEvent = require('./lib/client/DocumentLoadedEvent.js')
var Node = require('./lib/client/Node.js')
var d3 = require('d3-browserify')
var log = require('./lib/client/log.js')
var urlParser = require('url')
var querystring = require('querystring')

var Force = require('./lib/client/layout/Force.js')
var Tree = require('./lib/client/layout/Tree.js')

DocumentLoadedEvent.onEvent(main)
DocumentLoadedEvent.listen()

function main() {

	var url = urlParser.parse(window.document.location.href)
	url.query = querystring.parse(url.query)
	
	log.debug('layout: %s', url.query.layout)

	// TODO move code to a factory module or something
	var layout
	if (url.query.layout === 'tree')
		layout = new Tree(window.innerWidth - 100, window.innerHeight - 100)
	else if (url.query.layout === 'force')
		layout = new Force(window.innerWidth - 100, window.innerHeight - 100)
	else
		throw new Error('unknown layout ' + url.query.layout)
	
	layout.init(d3.select('body'))

	var count = 1

	var host = window.document.location.host.replace(/:.*/, '');

	var ws = new WebSocket('ws://' + host + ':{{port}}');

	ws.onopen = function() {

	}

	ws.onmessage = function (event) {

		var data = JSON.parse(event.data)

		if (data.event === 1)
			handleObjectStart(data)
		else
			handleObject(data)
	}

	ws.onclose = function () {		
		console.log('close')
	}

	ws.onerror = function(err) {
		console.error(err)
	}

	var index = {}

	var stack = []

	function handleObjectStart(data) {
		log.debug('handleObjectStart %s <- %s', data.key, data.parentKey)

		//if (data.key === 'root') return

		var parent = stack[stack.length - 1]

		var id

		if (parent) {
			id = parent.id + '.' + data.key
		} else if (data.key === undefined) {
			// TODO: check why i'm transmitting this from the server
			//id = '$'
			return;
		} else {
			id = data.key
		}

		var n = new Node(id)
		n.key(data.key)
		n.level = data.level

		n.on('new child', function (n1, n2) {
			layout.addNode(n1, n2)
		})

		if (n.id in index) {
			stack.push(index[n.id])
		} else {
			index[n.id] = n
			stack.push(n)
		}
	}

	function handleObject(data) {
		log.debug('handleObject %s <- %s', data.key, data.parentKey)

		if (data.key === undefined) return

		var current = stack.pop()

		var parent = stack[stack.length - 1]
		
		current.value(data.object)

		// completed objects will never be sent again from the server, so clear them
		delete index[current.id]
		
		current.fullyLoaded = true

		if (data.level >= 2)
			current.toggle()

		if (parent) {
			setTimeout(addChildLater(parent, current), data.level * 1300)
		}
	}

	function addChildLater(parent, child) {
		return function () {
			parent.addChild(child)
		}
	}
}