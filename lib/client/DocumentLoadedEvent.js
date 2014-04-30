module.exports = DocumentLoadedEvent

var defaults = DocumentLoadedEvent.defaults = {
	checkInterval: 50,
	events: ['complete']
}

var callbacks = []

function DocumentLoadedEvent() {

}

DocumentLoadedEvent.listen = function() {

	function isDocumentReady() {
		for (var i = 0; i < defaults.events.length; i++)
			if (document.readyState === defaults.events[i])
				return true

		return false
	}

	function fireCallbacks() {
		for (var i = 0; i < callbacks.length; i++)
			setTimeout(callbacks[i], 0)
	}

	// if document is already loaded go ahead and fire up, otherwise wait for document finish loading
	if (isDocumentReady()) {
	    fireCallbacks()
	}
	else {
	    var iRef = setInterval(function() {

	        if (isDocumentReady()) {
	            clearInterval(iRef)
	            fireCallbacks()
	        }

	    }, defaults.checkInterval)
	}
}

DocumentLoadedEvent.onEvent = function(callback) {
	callbacks.push(callback)
}