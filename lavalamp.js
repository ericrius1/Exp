(function() {
    this.entityID = null;
    this.lampOn = false;
    this.numGlobs = 3;
    this.globSize = 0.02;

    
    this.toggleLamp = function(){
      if(!this.lampOn){
        this.turnLampOn();
      } else{
        this.turnLampOff();
      }

      this.lampOn = !this.lampOn;
    }

    this.turnLampOn = function(){
      //create blobs
      print("BLOBS");
      var position = Entities.getEntityProperties(this.entityID).position;
      var globProperties = {
        type: 'Sphere',
        position: position,
        color: {red: 100, blue : 20, green: 100},
        dimensions: {x : this.globSize, y: this.globSize, z: this.globSize }
      };
      Entities.addEntity(globProperties);


    }

    this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        this.entityID = entityID;
        if(mouseEvent.isLeftButton) {
          this.toggleLamp();
        }
     
    };
})