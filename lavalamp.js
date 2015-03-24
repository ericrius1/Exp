(function() {
    this.entityID = null;
    this.lampOn = false;
    this.numGlobs = 1;
    this.globSize = 0.02;
    this.globs = [];
    this.lampRadius = .033;
    var self = this;
    this.colliders = [];

    
    this.toggleLamp = function(){
      if(!this.lampOn){
        this.turnLampOn();
      } 
      else if(this.lampOn){
        this.turnLampOff();
      }

      this.lampOn = !this.lampOn;
    }

    this.turnLampOn = function() {
      //create blobs
      this.lampPosition = Entities.getEntityProperties(this.entityID).position;
      var globProperties = {
        type: 'Sphere',
        position: this.lampPosition,
        color: {red: 100, blue : 20, green: 100},
        dimensions: {x : this.globSize, y: this.globSize, z: this.globSize },
        collisionsWillMove: true,
        velocity: {x : 0, y: 0.1, z: 0}
      };


      //create blobs
      for( var i = 0; i < this.numGlobs; i++){
        globProperties.position.x += randFloat(-.01, .01);
        globProperties.position.y += randFloat(-.01, .01);
        globProperties.position.z += randFloat(-.01, .01);
        var glob = Entities.addEntity(globProperties);
        this.globs.push(glob);
      }

      this.createColliders();

    }

    this.createColliders = function(){
      //create a top and bottom
      var colliderWidth = 0.001;
      var topProperties = {
        type: 'Box',
        position: Vec3.sum(this.lampPosition, {x: 0, y: .15, z: 0}),
        dimensions: {x: this.lampRadius * 2, y: colliderWidth, z: this.lampRadius * 2},
        color: {red: 200, green: 10, blue: 10}
      }
      var collider = Entities.addEntity(topProperties);
      this.colliders.push(collider);
      
      var bottomProperties = {
        type: 'Box',
        position: Vec3.sum(this.lampPosition, {x: 0, y: -.04, z: 0}),
        dimensions: {x: this.lampRadius * 2, y: colliderWidth, z: this.lampRadius * 2},
        color: {red: 200, green: 10, blue: 10}
      }
      collider = Entities.addEntity(bottomProperties);
      this.colliders.push(collider);
      
    }

    this.turnLampOff = function() {
      this.cleanUp();
    }

    this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        this.entityID = entityID;
        if(mouseEvent.isLeftButton) {
          this.toggleLamp();
        }
    };

    this.update = function(deltaTime){
      if(!self.lampOn){
        return;
      }

    }

    this.scriptEnding = function(){
      this.cleanUp();
    }

    this.cleanUp = function(){
      for( var i = 0; i < this.globs.length; i++){
        Entities.deleteEntity(this.globs[i]);
      }
      for(var i = 0; i < this.colliders.length; i++){
        Entities.deleteEntity(this.colliders[i]);
      }
    }

  function randFloat ( low, high ) {
    return low + Math.random() * ( high - low );
  }
  Script.update.connect(this.update);
  Script.scriptEnding.connect(this.scriptEnding);

})