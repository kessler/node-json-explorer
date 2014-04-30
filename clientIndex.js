var DocumentLoadedEvent = require('./lib/client/DocumentLoadedEvent.js')
var Node = require('./lib/client/Node.js')
var d3 = require('d3-browserify')
var log = require('./lib/client/log.js')
var Force = require('./lib/client/layout/Force.js')

DocumentLoadedEvent.onEvent(main)
DocumentLoadedEvent.listen()


function main() {

	var force = new Force(window.innerWidth - 100, window.innerHeight - 100)
	force.init(d3.select('body'))
	//add(root)

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
		console.log(force._nodes)
		console.log(force._links)
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
			force.addNode(n1, n2)
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

		if (data.key === 'root') return

		var current = stack.pop()

		var parent = stack[stack.length - 1]

		current.value(data.object)

		//log.debug(current.label)
		if (parent)
			parent.addChild(current)
	}
}