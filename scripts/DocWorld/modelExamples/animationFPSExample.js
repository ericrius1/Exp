ModelAnimationExample = function(entityPosition, panelPosition) {
	this.updateInterval = 30;
	var url = "https://hifi-public.s3.amazonaws.com/eric/models/windmill.fbx";
	this.model = Entities.addEntity({
		type: "Model",
		position: entityPosition,
		modelURL: url,
		animationURL: url,
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
		lineHeight: 0.1,
	});
}

ModelAnimationExample.prototype.play = function() {
	
}

ModelAnimationExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.model);

}