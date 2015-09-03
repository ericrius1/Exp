(function() {
  var self = this;
  var lightCol = {
    red: 255,
    green: 48,
    blue: 0
  };
  var doorbellSound = SoundCache.getSound("https://s3.amazonaws.com/hifi-public/sounds/doorbell.wav");
  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    this.entityId = entityId;
    if (mouseEvent.isLeftButton) {
      this.ring()
    }
  }

  this.ring = function() {
    var position = Entities.getEntityProperties(this.entityId).position
    if (doorbellSound && doorbellSound.downloaded) {
      Audio.playSound(doorbellSound, {
        position: position,

      });
    } else {
      print("COULD NOT PLAY SOUND!");
    }
    if (!this.bellLight) {
      this.bellLight = Entities.addEntity({
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
    } else{
      Entities.editEntity(this.bellLight, {intensity: 10});
    }

    Script.setTimeout(function() {
      Entities.editEntity(self.bellLight, {intensity: 0});
    }, 200);
  }

  this.unload = function(){
    Entities.deleteEntity(this.bellLight);
  }

})