(function(){
	this.moverOn = false
	this.defaultMaxRange=3;
	this.velocity = {x: 0, y: 0, z: 0};
	this.acceleration = {x: 0, y: 0, z: 0};
	this.onColor = {red: 10, green: 200, blue: 10};
	this.offColor = {red: 200, green: 0, blue: 0};
	this.rotationMixVal = 0.01;
	var self = this;
	this.defaultRotation = {x: 0, y: 0, z: -1};
	this.velocity = {x: 0, y: 0, z: 0};
	this.motorTimescale = 0.2;
	this.isMoving = false;
	this.largeTimescale = 1000000;
	this.velocityFactor = 3;
	MyAvatar.motorReferenceFrame = "world";

	function getUserData(entityId) {
		var properties = Entities.getEntityProperties(entityId);
		if(properties.userData){
			return JSON.parse(properties.userData);
		} else {
			return null;
		}
	}

	function updateUserData(entityId, userData){
		Entities.editEntity(entityId, {userData: JSON.stringify(userData) });
	}
	

	this.toggleMover = function(){
		if(!this.moverOn){
			this.turnMoverOn();
		}
		else if(this.moverOn){
			this.turnMoverOff();
		}

	}

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		this.entityId = entityId
		if(mouseEvent.isLeftButton) {
			this.toggleMover();
		}
	}

	this.turnMoverOn = function(){
		//activate a light at the movers position
		var props = Entities.getEntityProperties(this.entityId);
		this.userData = getUserData(this.entityId);
		this.setUserProperties();

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
			dimensions: {x: .1, y: .1, z: 0.5},
			// rotation: Quat.fromPitchYawRollDegrees(45, 0, 0)ssss
		});

		this.rotatedDir = {x: this.defaultRotation.x, y: this.defaultRotation.y, z: this.defaultRotation.z};
		this.rotatedDir = Vec3.multiplyQbyV(this.moverRotation, this.rotatedDir);

		//first normalize, then scale velocity; (Eventually based on user data)
		this.velocity = Vec3.normalize(this.rotatedDir);
		this.velocity = Vec3.multiply(this.velocity, this.velocityFactor);

		this.moverOn = true;


		// this.debugMesh = Entities.addEntity({
		// 	type: "Sphere",
		// 	position: this.moverPosition,
		// 	dimensions: {x : 5, y: 5, z:5},
		// 	color: {red: 0, green: 100, blue: 0}
		// })


	}

	this.setUserProperties = function(){
		if(!this.userData){
			this.userData = {}
		}
		if(this.userData.ability !== "mover"){
			this.userData.ability = "mover";
		}
		if(!this.userData.maxRange){
			this.userData.maxRange = this.defaultMaxRange;
			this.maxRange = this.defaultMaxRange
		} else if (this.userData.maxRange) {
			this.maxRange = this.userData.maxRange;
		}
		updateUserData(this.entityId, this.userData)
	}

	this.turnMoverOff = function(){
		Entities.editEntity(this.entityId, {color: this.offColor});
		this.cleanUp();
		this.moverOn = false;
		this.maybeStopAvatar();
	}

	this.scriptEnding = function(){
		this.cleanUp();
	}

	this.update = function(deltaTime){
		if(!self.moverOn){
			return;
		}

		self.distance = Vec3.distance(MyAvatar.position, self.moverPosition);
		if(self.distance < self.maxRange){
		// 	self.direction = Vec3.subtract(self.moverPosition, MyAvatar.position);
		// 	self.direction = Vec3.multiply(.01, Vec3.normalize(self.direction));
		// 	MyAvatar.position = Vec3.sum(MyAvatar.position, self.direction);

		    var newOrientation = Quat.mix(MyAvatar.orientation, self.moverRotation, self.rotationMixVal);
		    MyAvatar.orientation = newOrientation;

		    //now start moving avatar with a velocity that mathes orientation of object
		    if(!self.isMoving){
		    	self.startAvatar();
		    }


		}
		else if(self.isMoving){
			self.maybeStopAvatar();
		}

	}

	this.startAvatar = function(){

	  MyAvatar.motorVelocity =  this.velocity;
	  MyAvatar.motorTimescale = this.motorTimescale;
	  this.isMoving = true;
	}

	this.unload = function(){
		Script.update.disconnect(this.update);
		this.cleanUp();
	}

	//PROBLEM: Only stop avatar if it is not in the field of any nearby movers
	this.maybeStopAvatar = function(){
		var nearbyMoverEntities = Entities.findEntities(MyAvatar.position, 100);
		nearbyEntities = nearbyMoverEntities.filter(function(entity){
			var props = Entities.getEntityProperties(entity);
			if(props.userData){
				var userData = JSON.parse(props.userData);
				return userData.ability === "mover";
			}
		});
		print("NEARBY ENTITIES " + JSON.stringify(nearbyEntities));
		MyAvatar.motorVelocity = 0;
		MyAvatar.motorTimescale = this.largeTimescale;
		this.isMoving = false;
	}

	this.cleanUp = function(){
		Entities.deleteEntity(this.light);
	}

	Script.scriptEnding.connect(this.scriptEnding);
	Script.update.connect(this.update);

});