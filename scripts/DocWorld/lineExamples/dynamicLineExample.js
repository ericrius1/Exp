LineDynamicExample = function(entityPosition, panelPosition) {
	this.updateInterval = 30;
	this.linePoints = [];
	this.count = 0;
	for(var x = 0; x < 1; x+=.1) {
		this.linePoints.push({x: x, y: 0, z: 0})
	}

	this.line = Entities.addEntity({
		type: "Line",
		position: entityPosition,
		color: {red: 10, green: 10, blue: 200},
		dimensions: {x: 20, y: 20, z: 20},
		linePoints: this.linePoints,
		lineWidth: 4
	});

	this.panel = Entities.addEntity({
		type: "Text",
		position: panelPosition,
		dimensions: {
			x: 0.65,
			y: 0.6,
			z: 0.01
		},
		backgroundColor: {
			red: 255,
			green: 255,
			blue: 255
		},
		textColor: {
			red: 0,
			green: 255,
			blue: 0
		},
		lineHeight: 0.1,
		text: "dynamic line"
	});
}

LineDynamicExample.prototype.play = function() {
	var self = this;
	var points = Entities.getEntityProperties(self.line).linePoints;
	points[0].y = Math.sin(self.count/10);
	points[points.length-1].y = Math.sin(self.count/10);
	Entities.editEntity(self.line, {linePoints: points});

	Script.setTimeout(function() {
		self.play();
	}, self.updateInterval);
	self.count++;
}

LineDynamicExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.line);

}