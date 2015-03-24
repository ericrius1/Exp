(function() {
  this.entityId = null;
  this.properties = null;
  this.lightId = null;

  this.preload = function(entityId) {
    this.entityId = entityId;
    print("I JUST GOT ATTACHED TO AN ENTITY");
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent){
    print("I JUST GOT CLICKED ON");
  }
})
