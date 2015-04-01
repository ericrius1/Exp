(function() {

  this.preload = function(entityId) {
    this.sound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/sounds/Switches%20and%20sliders/lamp_switch_1.wav");
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData()
    if (!this.userData) {
      this.userData = {};
      this.userData.lightOn = false;
    }

  }

  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
    }
    return false;
  }

  this.updateUserData = function() {
    Entities.editEntity(this.entityId, {
      userData: JSON.stringify(this.userData)
    });
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    if (!mouseEvent.isLeftButton) {
      return;
    }
    //firist find closest light 
    this.entityId = entityId
    this.playSound();
    this.properties = Entities.getEntityProperties(this.entityId)
    this.light = this.findClosestLight();
    if (this.light) {
      this.getUserData();
      Entities.editEntity(this.light, {
        visible: !this.userData.lightOn
      });

      this.userData.lightOn = !this.userData.lightOn;
      this.updateUserData();
    }
  }

  this.playSound = function() {
    if (this.sound && this.sound.downloaded) {
      Audio.playSound(this.sound, {
        position: this.properties.position,
        volume: 0.3
      });
    } else {
      print("Warning: Couldn't play sound.");
    }
  }


  this.findClosestLight = function() {
    var entities = Entities.findEntities(this.properties.position, 0.5);
    for (var i = 0; i < entities.length; i++) {
      if (Entities.getEntityProperties(entities[i]).type === "Light") {
        return entities[i];
      }
    }
    return null;
  }

});