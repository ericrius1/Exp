(function(){
  var self = this;
  this.preload = function(entityId){
    this.entityId = entityId;
    Entities.editEntity(this.entityId, {stageSunModelEnabled: true});
  }

  this.update = function(){
    self.properties = Entities.getEntityProperties(self.entityId);
    Entities.editEntity(self.entityId, {stageHour: self.properties.stageHour+0.12});
  }

  this.unload = function(){
    Entities.editEntity(self.entityId, {stageHour: 0});
    Script.update.disconnect(self.update);
  }

  Script.update.connect(this.update);
})