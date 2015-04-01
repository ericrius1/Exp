(function() {
  var self = this;
  var lightCol = {
    red: 255,
    green: 48,
    blue: 0
  };

  this.preload = function(entityId){
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.userData = this.getUserData() || {};
    if(!this.userData.hasLight){
      this.createLight();
      this.userData.hasLight = true;
      this.userData.lightOn = false;
      this.updateUserData();
    }

  }

  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
      return true;
    }
    return false;
  }

  this.updateUserData = function() {
    Entities.editEntity(this.entityId, {
      userData: JSON.stringify(this.userData)
    });
  }

  this.createLight = function(){
    var position = Entities.getEntityProperties(this.entityId).position;
    this.light = Entities.addEntity({
      type: "Light",
      position: position,
      isSpotlight: false,
      dimensions: {
        x: 5,
        y: 5,
        z: 5
      },
      color: lightCol,
      intensity: 10
      // rotation: {x : 0, y: Math.PI/2, z: 0}
    });
    this.userData.intensity = 10;
    this.updateUserData();

  }
  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    this.entityId = entityId;
    if (mouseEvent.isLeftButton) {
      if(!this.userData.light)
      this.toggle();
    }
  }

  this.toggle = function() {
    var position = Entities.getEntityProperties(this.entityId).position;
    this.getUserData();
    if(this.userData.lightOn){
      Entities.editEntity(this.light, {intensity: 0, position: position});
    } else {
      Entities.editEntity(this.light, {intensity: this.userData.intensity, position: position});
    }
    this.userData.lightOn = !this.userData.lightOn;
    this.userData.intensity = this.properties.intensity;
    this.updateUserData();
  }



  this.unload = function(){
    Entities.deleteEntity(this.light);
  }

})