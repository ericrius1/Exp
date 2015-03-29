(function(){

  var self = this;
  var firstTime = 
  this.preload = function(entityId){
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData();

    Entities.editEntity(this.entityId, {dimensions: {x: 1, y: 1.5, z: .2}});
    
    if(!this.properties.userData){
      //if this is the door's true birth, then set it's state to closed
      this.userData = {};
      this.userData.state = "closed";
    }

  }

  this.getUserData = function(){
    if(this.properties.userData){
      this.userData = JSON.parse(this.properties.userData);
    }

  }

  this.updateUserData = function(){
    Entities.editEntity(this.entityId, {userData: JSON.stringify(this.userData)});
  }

  this.toggle = function(){
  //We ignore user click if the door is in process of opening or closing
   if(this.userData.state === "opening" || this.userData.state === "closing"){
      return;
    }
    if(this.userData.state === "closed"){

      this.userData.state = "opening";
    }
    if(this.userData.state === "open"){
      this.userData.state = "closing";
    }
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent){
    this.entityId = entityId;
    if(mouseEvent.isLeftButton){
      this.toggle();
    }

  }
	this.getUserData = function(){
		if(this.properties.userData){
			this.userData = JSON.parse(this.properties.userData);
		}
	}


	this.unload = function(){
		Script.update.disconnect(this.update);
		this.cleanUp();
	}

  this.cleanUp = function(){

  }
  this.update = function(){
    self.properties = Entities.getEntityProperties(self.entityId)
    self.getUserData();

    if(self.userData.state === "closed"){
      //We want top open
      self.userData.state = "opening";
      self.updateUserData();
    }

    else if(self.userData.state = "opening"){
      Entities.editEntity(self.entityId, {position: {x: self.properties.position.x += .02, y: self.properties.position.y, z: self.properties.position.z}})
    }

  }

  Script.update.connect(this.update);




});