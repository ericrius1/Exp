(function() {
  var self = this;
  var defaultLightColor = {
    red: 255,
    green: 48,
    blue: 0
  };

  this.preload = function(entityId){
    this.defaultIntensity = 15;
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData()
    if(!this.userData){
      this.userData = {};
    }
    if(!this.userData.hasLight){
      print("CREATE LIGHT!!! (THIS SHOULD NOT BE A THING ON IMPORT");
      this.createLight();
      this.userData.hasLight = true;
      this.userData.lightOn = true;
    } else {
      this.recreateLight();
    }

    this.updateUserData();
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

  this.createLight = function(){
    var position = Entities.getEntityProperties(this.entityId).position;
    this.light = Entities.addEntity({
      type: "Light",
      position: position,
      dimensions: {
        x: 2,
        y: 2,
        z: 2
      },
      color: defaultLightColor,
      intensity: this.defaultIntensity
      // rotation: {x : 0, y: Math.PI/2, z: 0}
    });
    this.userData.intensity = this.defaultIntensity;
    this.updateUserData();

  }

  this.recreateLight = function(){
     var position = Entities.getEntityProperties(this.entityId).position;
     this.light = Entities.addEntity({
      type: "Light",
      position: position,
      dimensions: this.userData.lightDimensions,
      color: this.userData.lightColor,
      intensity: this.userData.intensity
      // rotation: {x : 0, y: Math.PI/2, z: 0}
    });

  }
  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    this.entityId = entityId;
    if (mouseEvent.isLeftButton) {
      this.toggle();
    }
  }

  this.toggle = function() {
    this.properties = Entities.getEntityProperties(this.entityId);
    this.lightProperties = Entities.getEntityProperties(this.light);
    this.getUserData();
    print("USER DATA INTENSITY " + this.userData.intensity);
    if(this.userData.lightOn){
      Entities.editEntity(this.light, {intensity: 0, position: this.properties.position});
    } else {
      Entities.editEntity(this.light, {intensity: this.userData.intensity, position: this.properties.position});
    }
    if(this.properties.intensity > 1){
      //we onlyl want to save this if light is on
      this.userData.intensity = this.lightProperties.intensity;
    }
    this.userData.lightOn = !this.userData.lightOn;
    this.userData.lightDimensions = this.lightProperties.dimensions;
    this.userData.lightColor = this.lightProperties.color;
    this.updateUserData();
  }



  this.unload = function(){
    Entities.deleteEntity(this.light);
  }

})