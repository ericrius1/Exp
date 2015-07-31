(function(){
    var baseURL = "http://dynamoidapps.com/HighFidelity/Cosm/";
    var self = this;

    var version = 2;
    this.preload = function(entityId) {
		this.soundPlaying = false;
        this.entityId = entityId;
        self.getUserData();
        this.soundURL = baseURL + "Audio/" + self.userData.name + ".wav";
        this.soundOptions = {stereo: true, loop: true, localOnly: true, volume: 0.2};
        this.sound = SoundCache.getSound(this.soundURL);
	


    }

//    this.update = function(){
//         if (self.sound.downloaded && !playing) {
//            print("play sound");
//             playing=true;
//            Audio.playSound(self.sound, self.soundOptions);
//        }
//    }


    this.getUserData = function() {
        this.properties = Entities.getEntityProperties(this.entityId);
        if (self.properties.userData) {
            this.userData = JSON.parse(this.properties.userData);
        } else {
            this.userData = {};
        }
    }

//      Script.update.connect(this.update);


    this.enterEntity = function(entityID) {
            print("entering audio zone");
            if (self.sound.downloaded) {
                print("play sound");
               	this.soundPlaying = Audio.playSound(self.sound, self.soundOptions);
				
            } else {
                print("not downloaded");
            }
    }



    this.leaveEntity = function(entityID) {
		print("leaving audio area "  + self.userData.name);
		 if (self.soundPlaying != null) {
                 print("not null");
             }
		 if (Audio.isInjectorPlaying(self.soundPlaying)) {
            
			Audio.stopInjector(self.soundPlaying);
			print("Stopped sound " + self.userData.name);
    	}
		else{
			print("Sound not playing");
		}
    }




});
