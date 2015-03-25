(function(){
	this.moverOn = false
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
			dimensions: {x: 10, y:10, z:10},
			color: {red: 200, green: 10, blue: 200},
			intensity: 5
		})

	}

	this.turnMoverOff = function(){
		this.cleanUp();
	}

	this.scriptEnding = function(){
		this.cleanUp();
	}

	this.cleanUp = function(){
		Entities.deleteEntity(this.light);
	}

	Script.scriptEnding.connect(this.scriptEnding);

});