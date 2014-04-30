module.exports = function(node) {
	if (node.type === 'array')
		return 'lightgreen'

	if (node.type === 'string')
		return 'lightorange'

	if (node.type === 'number')
		return 'lightred'

	return 'lightblue'
}