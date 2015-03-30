(function(){
	var self = this;
	this.preload = function(entityId){
    this.targetAvatarToChairDistance = .5;
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
		this.isSittingSettingHandle = "AvatarSittingState";
	}

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		if(mouseEvent.isLeftButton){
     
      if(Settings.getValue(this.isSittingSettingHandle, false) == "false"){
        //first we need to move avatar towards chair
        Script.update.connect(this.goToSeat);
        this.activeUpdateFunction = this.goToSeat;
      }
		}
	}

	this.goToSeat = function(){
    self.distance = Vec3.distance(MyAvatar.position, self.properties.position)
    print(self.distance)
    if(self.distance > self.targetAvatarToChairDistance){
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.properties.position, 0.1);
    } else {
      //otherwise we made it ot chair, now sit down
      Script.update.disconnect(self.goToSeat);
      Script.update.connect(self.sitDown);
      self.activeUpdateFunction = self.sitDown;
    }
	}

  this.sitDown = function(){
    print("YAAAAAA")

  }

  this.unload = function(){

    Script.update.disconnect(this.sitDown);
  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }



});