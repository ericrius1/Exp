(function(){
	this.moverOn = false
	this.MAX_RANGE = 10;
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
		this.moverPosition = Entities.getEntityProperties(this.entityId).position;
		this.light = Entities.addEntity({
			type: "Light",
			position: this.moverPosition,
			isSpotlight: false,
			dimensions: {x: 10, y:10, z:10},
			color: {red: 200, green: 10, blue: 200},
			intensity: 5
		})

		// this.debugMesh = Entities.addEntity({
		// 	type: "Sphere",
		// 	position: this.moverPosition,
		// 	dimensions: {x : 5, y: 5, z:5},
		// 	color: {red: 0, green: 100, blue: 0}
		// })


	}

	this.turnMoverOff = function(){
		this.cleanUp();
	}

	this.scriptEnding = function(){
		this.cleanUp();
	}

	this.update = function(deltaTime){
		if(!self.moverOn){
			return;
		}
		print(Vec3.distance(MyAvatar.position, self.moverPosition));
		if(Vec3.distance(MyAvatar.position, self.moverPosition) < self.MAX_RANGE){
			print("WITHIN RANGE!");
		}

	}

	this.cleanUp = function(){
		Entities.deleteEntity(this.light);
	}

	Script.scriptEnding.connect(this.scriptEnding);
	Script.update.connect(this.update);

});