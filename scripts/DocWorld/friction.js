FrictionExample = function(position) {

	this.box = Entities.addEntity({
		type: 'Box',
		position: position,
		dimensions: {
			x: 1,
			y: 1,
			z: 1
		},
		color: {
			red: 200,
			green: 20,
			blue: 200
		},
		velocity: {
			x: 2,
			y: 0,
			z: 0
		},
		gravity: {
			x: 0,
			y: -2,
			z: 0
		},
		collisionsWillMove: true,
		friction: 0.5,
	});

}

FrictionExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.box);
}