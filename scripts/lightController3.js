(function() {

  this.preload = function(entityId) {
    this.entityId = entityId;

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
    //firist find closest light 
    this.entityId = entityId
    this.properties = Entities.getEntityProperties(this.entityId)
    this.light = this.findClosestLight();
  }

  this.findClosestLight = function() {
    var entities = Entities.findEntities(this.properties.position, 1);
    for (var i = 0; i < entities.length; i++) {
      if (Entities.getEntityProperties(entities[i]).type === "Light") {
        return entities[i];
      }
    }
    return [];
  }

});