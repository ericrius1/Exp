function() {
  this.entityId = null;
  this.properties = null;
  this.lightId = null;

  this.preload = function(entityId) {
    this.entityId = entityId;
    print(this.entityId);
  }
}
