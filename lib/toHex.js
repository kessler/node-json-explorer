module.exports = toHex

var hexDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F']

function toHex(number) {

	var result = ''
	var q, next

	do {
		result = hexDigits[number % 16] + result
		number = Math.floor( number / 16 )
	} while (number > 1)

	return result
}