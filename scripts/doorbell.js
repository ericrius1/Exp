(function(){

  var doorbellSound = SoundCache.getSound("https://s3.amazonaws.com/hifi-public/sounds/doorbell.wav");
  print('doorbell download')
	this.clickReleaseOnEntity = function(entityId, mouseEvent){
    this.entityId = entityId;
		if(mouseEvent.isLeftButton){
			this.ring()
		}
	}

	this.ring = function(){
    var position = Entities.getEntityProperties(this.entityId).position 
    if(doorbellSound && doorbellSound.downloaded){
		  Audio.playSound(doorbellSound, {
        position: position,

      });
    } else {
      print("COULD NOT PLAY SOUND!");
    }
	}


})