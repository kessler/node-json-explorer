var d3 = require('d3-browserify')
var log = require('../log.js')
var d3Tip = require('d3-tip')(d3)

module.exports = Force

function Force(w, h) {
	this._w = w
	this._h = h
	this._nodeClass = '.node'
	this._linkClass = '.link'
}

Force.prototype.init = function(element) {

	this._force = d3.layout.force()
	    .charge(this.__charge())
	    .linkDistance(this.__linkDistance())
	    .on('tick', this.__tick())
	    .size([this._w, this._h]);

	this._vis = element.append('svg:svg')
		    .attr('width', this._w)
		    .attr('height', this._h);

	this._node = this._vis.selectAll(this._nodeClass)
	this._link = this._vis.selectAll(this._linkClass)

	this._nodes = this._force.nodes()
	this._links = this._force.links()

	this._tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-7, 0])
	.html(function(d) {
		return d.properties
	})

	this._vis.call(this._tip)
}

Force.prototype.addNode = function (n1, n2) {
	log.debug('add %s, %s', n1.id, n2 ? n2.id : '')

	if (!n1._added) {
		n1._added = true
		this._nodes.push(n1)
	}

	if (n2) {

		if (!n2._added) {
			n2._added = true
			this._nodes.push(n2)
		}

		this._links.push({ source: n1, target: n2})
	}

	this.update()
}

Force.prototype.update = function() {
	this._node = this._vis.selectAll('.node');
	this._link = this._vis.selectAll('.link');

	this._node = this._node.data(this._nodes, this.__getNodeId())

	this._node.exit().remove();

	var nodeEnter = this._node.enter().append('g')
		.attr('class', 'node')
		.on('click', this.__onNodeClick())
	  	.call(this._force.drag);

	nodeEnter.append('svg:circle')
		.attr('r', this.__getNodeSize())
		.on('mouseover', this._tip.show)
      	.on('mouseout', this._tip.hide)
		.style('fill', this.__getNodeColor());

	nodeEnter.append('svg:text')
		.attr('dy', '.35em')
		.attr('dx', '7')
		.on('mouseover', this._tip.show)
      	.on('mouseout', this._tip.hide)
		.text(this.__getNodeText());

	// Update the links…
	this._link = this._link.data(this._links, this.__getLinkId());

	this._link.exit().remove();

	// Enter any new links.
	this._link.enter().insert('svg:line', 'g.node')
  		.attr('class', 'link');

	this._force.start()
}

Force.prototype.__tick = function () {
	var self = this

	return function () {

		self._link
			.attr('x1', self.__getLinkSourceX())
			.attr('y1', self.__getLinkSourceY())
			.attr('x2', self.__getLinkTargetX())
			.attr('y2', self.__getLinkTargetY())

		self._node.attr('transform', self.__transformNode());
	}
}

Force.prototype.__charge = function() {
	return function(d) {
		return d.level > 0 ? d.level * -30 : -30
	}
}

Force.prototype.__linkDistance = function() {
	return function(d) {
		return d.source.size + d.target.size
	}
}

Force.prototype.__getNodeId = function() {
	return function (d) {
		return d.id
	}
}

Force.prototype.__getNodeText = function() {
	return function (d) {
		var label
		var key = d.key()
		if (key) {
			if (key.length > 20)
				label = key.substr(0, 20) + '...'
			else
				label = key
		} else {
			label = '(!)'
		}

		return label
	}
}

Force.prototype.__getNodeSize = function() {
	return function (d) {
		return 1 / (d.level + 1) * 10 + d.size
	}
}

Force.prototype.__getNodeColor = function() {
	return function (d) {
		return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
	}
}

Force.prototype.__transformNode = function() {
	return function (d) {
		return 'translate(' + d.x + ',' + d.y + ')';
	}
}

Force.prototype.__getLinkId = function() {
	return function (l) {
		return l.target.id
	}
}

Force.prototype.__getLinkSourceX = function () {
	return function(l) {
		return l.source.x
	}
}

Force.prototype.__getLinkSourceY = function () {
	return function(l) {
		return l.source.y
	}
}

Force.prototype.__getLinkTargetX = function () {
	return function(l) {
		return l.target.x
	}
}

Force.prototype.__getLinkTargetY = function () {
	return function(l) {
		return l.target.y
	}
}

Force.prototype.__onNodeClick = function() {
	return function (d) {
		console.log(d)
	}
}

Force.prototype.__onTextMouseOver = function() {
	return function (d) {
		console.log(d)
	}
}


function log10(val) {
  return Math.log(val) / Math.LN10;
}