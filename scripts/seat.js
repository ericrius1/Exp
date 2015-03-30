(function(){
	var self = this;
	this.preload = function(entityId){
    this.totalAnimationTime = 5;
    this.targetAvatarToChairDistance = .5;
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
		this.isSittingSettingHandle = "AvatarSittingState";
    Settings.setValue(this.isSittingSettingHandle, false);

	}

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		if(mouseEvent.isLeftButton){
     
      if(Settings.getValue(this.isSittingSettingHandle, false) == "false"){
        //first we need to move avatar towards chair
        this.activeUpdate = this.moveToSeat;
      }
    }
  }

  this.update = function(deltaTime){
    if(!self.activeUpdate){
      return;
    }
    self.activeUpdate(deltaTime);
   
  }

  this.moveToSeat = function(deltaTime){
    self.distance = Vec3.distance(MyAvatar.position, self.properties.position)
    if(self.distance > self.targetAvatarToChairDistance){
      self.sanitizedRotation = Quat.fromPitchYawRollDegrees(0, Quat.safeEulerAngles(self.properties.rotation).y, 0);
      MyAvatar.orientation = Quat.mix(MyAvatar.orientation, self.sanitizedRotation, 0.02);
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.properties.position, 0.01);
    } else {
      //otherwise we made it ot chair, now sit down should be out active update function
      this.elapsedTime = 0
      self.activeUpdate = self.sitDown;
    }

  }

  this.sitDown = function(deltaTime){
    self.elapsedTime += deltaTime;
    print("ELAPSED TIME... " + self.elapsedTime)
  }

  this.unload = function(){

    Script.update.disconnect(this.update);
  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

  Script.update.connect(this.update);


});