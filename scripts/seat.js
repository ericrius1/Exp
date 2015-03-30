(function(){
	var self = this;
	this.preload = function(entityId){
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

  this.update = function(){
    if(!self.activeUpdate){
      return;
    }
    self.activeUpdate();
   
  }

  this.moveToSeat = function(){
    self.distance = Vec3.distance(MyAvatar.position, self.properties.position)
    if(self.distance > self.targetAvatarToChairDistance){
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.properties.position, 0.01);
    } else {
      //otherwise we made it ot chair, now sit down should be out active update function
      self.activeUpdate = self.sitDown;
    }

  }

  this.sitDown = function(){
    

  }

  this.unload = function(){

    Script.update.disconnect(this.update);
  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

  Script.update.connect(this.update);


});