(function(){
	this.moverOn = false
	this.MAX_RANGE = 3;
	this.MIN_RANGE = 1;
	this.velocity = {x: 0, y: 0, z: 0};
	this.acceleration = {x: 0, y: 0, z: 0};
	this.onColor = {red: 10, green: 200, blue: 10};
	this.offColor = {red: 200, green: 0, blue: 0};
	this.rotationMixVal = 0.01;
	var self = this;
	this.toggleMover = function(){
		if(!this.moverOn){
			this.turnMoverOn();
		}
		else if(this.moverOn){
			this.turnMoverOff();
		}

		this.moverOn = !this.moverOn;
	}

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		this.entityId = entityId;
		if(mouseEvent.isLeftButton) {
			this.toggleMover();
		}
	}

	this.turnMoverOn = function(){
		//activate a light at the movers position
		var props = Entities.getEntityProperties(this.entityId)
		this.moverPosition = props.position;
		this.moverRotation = props.rotation;
		this.light = Entities.addEntity({
			type: "Light",
			position: this.moverPosition,
			isSpotlight: false,
			dimensions: {x: 10, y:10, z:10},
			color: {red: 200, green: 10, blue: 200},
			intensity: 5,
			// rotation: {x : 0, y: Math.PI/2, z: 0}
		})

		//change color
		Entities.editEntity(this.entityId, {
			color: this.onColor, 
			dimensions: {x: .1, y: .1, z: 1},
			// rotation: Quat.fromPitchYawRollDegrees(45, 0, 0)
		});

		// this.debugMesh = Entities.addEntity({
		// 	type: "Sphere",
		// 	position: this.moverPosition,
		// 	dimensions: {x : 5, y: 5, z:5},
		// 	color: {red: 0, green: 100, blue: 0}
		// })


	}

	this.turnMoverOff = function(){
		Entities.editEntity(this.entityId, {color: this.offColor});
		this.cleanUp();
	}

	this.scriptEnding = function(){
		this.cleanUp();
	}

	this.update = function(deltaTime){
		if(!self.moverOn){
			return;
		}
		self.distance = Vec3.distance(MyAvatar.position, self.moverPosition);

		if(self.distance < self.MAX_RANGE && self.distance > self.MIN_RANGE){
		// 	self.direction = Vec3.subtract(self.moverPosition, MyAvatar.position);
		// 	self.direction = Vec3.multiply(.01, Vec3.normalize(self.direction));
		// 	MyAvatar.position = Vec3.sum(MyAvatar.position, self.direction);

		    var newOrientation = Quat.mix(MyAvatar.orientation, self.moverRotation, self.rotationMixVal);
		    MyAvatar.orientation = newOrientation;
		}

	}

	this.cleanUp = function(){
		Entities.deleteEntity(this.light);
	}

	Script.scriptEnding.connect(this.scriptEnding);
	Script.update.connect(this.update);

});