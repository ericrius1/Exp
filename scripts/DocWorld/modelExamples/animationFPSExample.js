ModelAnimationExample = function(entityPosition, panelPosition) {
	this.updateInterval = 4000;
	//var url = "https://hifi-public.s3.amazonaws.com/eric/models/windmillNoAnimation.fbx";
	var url = "file:///Users/ericlevin/Desktop/windmill.fbx?v1";
	this.values = [5, 15, 30, 60, 120, 240];
	this.currentValueIndex = 0;
	var animationSettings = {
		fps: this.minFPS,
		running: true,
	}

	this.model = Entities.addEntity({
		type: "Model",
		animationSettings: JSON.stringify(animationSettings),
		position: entityPosition,
		modelURL: url,
		animationURL: url,
		dimensions: {
			x: 0.2,
			y: 0.5,
			z: 0.2
		},
		animationIsPlaying: false
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
		text: "model fps"
	});
}

ModelAnimationExample.prototype.play = function() {
	var self = this;
	if(self.currentValueIndex === self.values.length) {
		self.currentValueIndex = 0;
	}
	var fps = self.values[self.currentValueIndex++];
	Entities.editEntity(self.model, {
		animationSettings: JSON.stringify({fps: fps, running: true})
	});
	Entities.editEntity(self.panel, {
		text: "model fps\n" + fps
	})
	Script.setTimeout(function(){
		self.play();
	}, self.updateInterval);
}

ModelAnimationExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.model);
	Entities.deleteEntity(this.panel);

}