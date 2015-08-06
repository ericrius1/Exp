LightIntensityExample = function(entityPosition, panelPosition) {
	this.updateInterval = 100;
	this.count = 0;
	this.maxIntensity = 10;
	var color = {
		red: 200,
		green: 50,
		blue: 200
	}
	this.bulb = Entities.addEntity({
		type: "Sphere",
		dimensions: {
			x: 0.05,
			y: 0.05,
			z: 0.05
		},
		position: entityPosition,
		color: color
	});

	this.light = Entities.addEntity({
		type: "Light",
		position: entityPosition,
		color: color,
		dimensions: {
			x: 5,
			y: 5,
			z: 5
		}
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
		text: "light intensity"
	});
}

LightIntensityExample.prototype.play = function() {
	var self = this;
	var intensity = ( self.maxIntensity/2 + Math.sin(self.count/10) * self.maxIntensity/2).toFixed(2);
	Entities.editEntity(self.light, {intensity: intensity});
	Entities.editEntity(self.panel, {
		text: "light intensity: \n" + intensity
	});
	self.count++;

	Script.setTimeout(function() {
		self.play();
	}, self.updateInterval);
}

LightIntensityExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.light);
	Entities.deleteEntity(this.panel);
	Entities.deleteEntity(this.bulb);

}