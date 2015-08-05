GravityExample = function(entityPosition, panelPosition) {
	this.updateInterval = 4000;
	this.startingEntityPosition = entityPosition;
	this.values = [-20, -9.8, 0, 5];
    this.currentValuesIndex = 0;

	this.entity = Entities.addEntity({
		type: 'Sphere',
		dimensions: {
			x: 0.5,
			y: 0.5,
			z: 0.5
		},
		color: {
			red: 200,
			green: 20,
			blue: 200
		},
		collisionsWillMove: true,
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
		lineHeight: 0.14
	});

}

GravityExample.prototype.play = function() {
	var self = this;
	var currentValue =  self.values[self.currentValuesIndex++]
	if(self.currentValuesIndex === self.values.length) {
		self.currentValuesIndex = 0;
	}
	print("CURRENT VALUE " + currentValue)
	Entities.editEntity(self.entity, {
	    position: self.startingEntityPosition,
		gravity: {
			x: 0,
			y: currentValue,
			z: 0
		},
		velocity: {
			x: 0, 
			y: -.01,
			z: 0
		},
	});
	Entities.editEntity(self.panel, {
		text: "Gravity \n" + currentValue
	});
	Script.setTimeout(function() {
		self.play();
	}, self.updateInterval)
}

GravityExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.entity);
	Entities.deleteEntity(this.panel);
}