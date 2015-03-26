(function(){
	this.active = false
	this.defaultMaxRange = 5;
	this.acceleration = {x: 0, y: 0, z: 0};
	this.onColor = {red: 10, green: 200, blue: 10};
	this.offColor = {red: 200, green: 0, blue: 0};
	var self = this;
	//Default forward direction of mover object
	this.forward = {x: 0, y: 0, z: -1};
	this.isMoving = false;
	this.velocity = {x: 0, y: 0, z: 0};
	this.defaultThrust = 500;
	this.maxRotMixVal = 0.01;
	this.minRotMixVal = this.maxRotMixVal * 0.5;

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
		if(!this.active){
			this.activate();
		}
		else if(this.active){
			this.deactivate();
		}

	}

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		this.entityId = entityId
		if(mouseEvent.isLeftButton) {
			this.toggleMover();
		}
	}

	this.activate = function(){
		//activate a light at the movers position
		var props = Entities.getEntityProperties(this.entityId);
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
			// rotation: Quat.fromPitchYawRollDegrees(45, 0, 0)
		});

		this.active = true;

	}

	this.setUserProperties = function(){
		this.userData = getUserData(this.entityId);
		if(!this.userData){
			this.userData = {
				maxRange: this.defaultMaxRange,
				thrust: this.defaultThrust

			}
		} else {
			this.userData.maxRange = this.userData.maxRange || this.defaultMaxRange;
			this.userData.thrust = this.userData.thrust || this.defaultThrust;

		}
		this.maxRange = this.userData.maxRange;
		this.maxThrust = this.userData.thrust;
		this.minThrust = this.maxThrust * 0.2;
		updateUserData(this.entityId, this.userData)
	}

	this.deactivate = function(){
		Entities.editEntity(this.entityId, {color: this.offColor});
		this.cleanUp();
		this.active = false;
	}

	this.scriptEnding = function(){
		this.cleanUp();
	}

	this.update = function(deltaTime){
		if(!self.active){
			return;
		}
		self.props = Entities.getEntityProperties(self.entityId);
		self.moverPosition = self.props.position;
		self.moverRotation = self.props.rotation;
		self.distance = Vec3.distance(MyAvatar.position, self.moverPosition);
		if(self.distance < self.maxRange){
		// 	self.direction = Vec3.subtract(self.moverPosition, MyAvatar.position);
		// 	self.direction = Vec3.multiply(.01, Vec3.normalize(self.direction));
		// 	MyAvatar.position = Vec3.sum(MyAvatar.position, self.direction);
				self.rotationMixVal = map(self.distance, 0, self.maxRange, self.maxRotMixVal, self.minRotMixVal);
		    self.newOrientation = Quat.mix(MyAvatar.orientation, self.moverRotation, self.rotationMixVal);
		    MyAvatar.orientation = self.newOrientation;


		    self.rotatedDir = {x: self.forward.x, y: self.forward.y, z: self.forward.z};
		    self.rotatedDir = Vec3.multiplyQbyV(self.moverRotation, self.rotatedDir);

		    //first normalize, then scale velocity; (Eventually based on user data)
		    self.thrust= map(self.distance, 0, self.maxRange, self.maxThrust, self.minThrust);
		    self.direction = Vec3.normalize(self.rotatedDir);
		    self.velocity = Vec3.multiply(self.direction, self.thrust);
		    MyAvatar.addThrust(Vec3.multiply(self.velocity, deltaTime));
		}

	}

	this.unload = function(){
		Script.update.disconnect(this.update);
		this.cleanUp();
	}


	this.cleanUp = function(){
		Entities.deleteEntity(this.light);
	}

	function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

	Script.scriptEnding.connect(this.scriptEnding);
	Script.update.connect(this.update);

});