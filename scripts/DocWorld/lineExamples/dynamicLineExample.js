LineDynamicExample = function(entityPosition, panelPosition) {
	this.updateInterval = 30;

	this.line = Entities.addEntity({
		type: "Line",
		position: entityPosition,
		color: {red: 200, green: 50, blue: 200},
		dimensions: {x: 5, y: 5, z: 5}
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
		lineHeight: 0.1
	});
}

LineDynamicExample.prototype.play = function() {
	var self = this;
	Entities.editEntity(self.line, {
		linePoints: [{
			x: 0,
			y: 0,
			z: 0
		}, {
			x: 1,
			y: 1,
			z: 1
		}]
	});
}

LineDynamicExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.line);

}