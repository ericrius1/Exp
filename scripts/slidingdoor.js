(function(){

  var self = this;
  var firstTime = 
  this.preload = function(entityId){
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData();

    Entities.editEntity(this.entityId, {dimensions: {x: 1, y: 1.5, z: .2}});
    
    if(!this.properties.userData){
      //if this is the door's true birth, then set it's state to closed
      this.userData = {};
      this.userData.state = "closed";
    }

  }

  this.getUserData = function(){
    if(this.properties.userData){
      this.userData = JSON.parse(this.properties.userData);
    }

  }

  this.updateUserData = function(){
    Entities.editEntity(this.entityId, {userData: JSON.stringify(this.userData)});
  }

  this.toggle = function(){
  //We ignore user click if the door is in process of opening or closing
   if(this.userData.state === "opening" || this.userData.state === "closing"){
      return;
    }
    if(this.userData.state === "closed"){
      this.direction = Quat.getRight(this.properties.rotation);
      this.targetPosition = Vec3.sum(Vec3.multiply(this.direction, 2), this.properties.position);
      this.userData.state = "opening";
    }
    if(this.userData.state === "open"){
      //reverse direction
      this.direction = Vec3.multiply(-1, Quat.getRight(this.properties.rotation));
      this.targetPosition = Vec3.sum(Vec3.multiply(this.direction, 2), this.properties.position);
      this.userData.state = "closing";
    }

    this.updateUserData();
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent){
    this.entityId = entityId;
    if(mouseEvent.isLeftButton){
      this.toggle();
    }

  }
	this.getUserData = function(){
		if(this.properties.userData){
			this.userData = JSON.parse(this.properties.userData);
		}
	}


	this.unload = function(){
		Script.update.disconnect(this.update);
		this.cleanUp();
	}

  this.cleanUp = function(){

  }
  this.update = function(){
    self.properties = Entities.getEntityProperties(self.entityId)
    self.getUserData();


    if(self.userData.state === "opening" || self.userData.state === "closing"){
      self.newPosition = Vec3.mix(self.properties.position, self.targetPosition, 0.01);
      Entities.editEntity(self.entityId, {position: self.newPosition});

      self.distanceToTarget = Vec3.distance(self.newPosition, self.targetPosition);
      print("DISTANCE TO TARGET! "+ self.distanceToTarget)
      if(self.distanceToTarget < 0.02){
        //We have reached target, now set state to either closed or open
        if(self.userData.state === "opening"){
          self.userData.state = "open";
        } else if(self.userData.state = "closing"){
          self.userData.state = "closed";
        }
        self.updateUserData();
      }
    }

  }

  Script.update.connect(this.update);




});