(function(){

  var self = this;
  this.userData = {};
  this.init = function(){

    print("INIT INIT INIT");
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
    if(!this.userData.doorOpen){
      this.openDoor();
    } else if(this.userData.doorOpen){
      this.closeDoor();
    }
  }

  this.openDoor = function(){
    this.userData.doorOpen = true;

    print("OPEN DOOR");
  }

  this.closeDoor = function(){
    this.userData.doorOpen = false;
    print("CLOSED DOOR");
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

	this.preload = function(entityId){
		this.entityId = entityId;
    print("LOOOOADD");
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

  }

  Script.update.connect(this.update);


  //Entry point when script is first attached to entity
  this.init();


});