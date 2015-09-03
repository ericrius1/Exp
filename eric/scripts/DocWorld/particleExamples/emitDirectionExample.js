ParticleDirectionExample = function(entityPosition, panelPosition) {
	this.startingEntityPosition = entityPosition;
	this.updateInterval = 500;

	this.count = 0;
	this.base = Entities.addEntity({
		type: 'Sphere',
		position: entityPosition,
		dimensions: {
			x: 0.2,
			y: 0.2,
			z: 0.2
		},
		color: {
			red: 200,
			green: 20,
			blue: 200
		},
	});

	var animationSettings = JSON.stringify({
		fps: 30,
		frameIndex: 0,
		running: true,
		firstFrame: 0,
		lastFrame: 10,
		loop: true
	});
	this.emitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: entityPosition,
		textures: "http://www.hyperlogic.org/images/particle.png",
		emitRate: 111,
		emitStrength: 10,
		color: {
			red: 50,
			green: 150,
			blue: 160
		},
		localGravity: 0
	});

	this.panel = Entities.addEntity({
		type: "Text",
		position: panelPosition,
		dimensions: {
			x: 1.65,
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

ParticleDirectionExample.prototype.play = function() {
	var self = this;
	var directionZ =Math.sin(self.count/10).toFixed(2);
	var directionY =Math.sin(self.count/20).toFixed(2);
	var directionX =Math.sin(self.count/5).toFixed(2);
	var emitDirection = {x: directionX, y: directionY, z: directionZ};
	Entities.editEntity(
		self.emitter, {
			emitDirection: emitDirection
		}
	);
	Entities.editEntity(
		self.panel, {
			text: "emitDirection: \n" + JSON.stringify(emitDirection)
		});
	Script.setTimeout(function() {
		self.play();
	}, self.updateInterval)

	self.count++;


}

ParticleDirectionExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.base);
	Entities.deleteEntity(this.emitter);
	Entities.deleteEntity(this.panel);
}