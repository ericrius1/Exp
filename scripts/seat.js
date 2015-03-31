(function(){
	var self = this;
	this.preload = function(entityId){
    this.buttonImageURL = "https://s3.amazonaws.com/hifi-public/images/tools/sit.svg";
    this.addStandButton();
    this.totalAnimationTime = 1;
    this.targetAvatarToChairDistance = 0.5;
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
		this.isSittingSettingHandle = "AvatarSittingState";
    Settings.setValue(this.isSittingSettingHandle, false);
    this.startPoseAndTransition = [];
    self.seatVelocity = {x: -.01, y: 0, z: 0};
    //target pose
    this.pose = [
      {joint:"RightUpLeg", rotation: {x:100.0, y:15.0, z:0.0}},
      {joint:"RightLeg", rotation: {x:-130.0, y:15.0, z:0.0}},
      {joint:"RightFoot", rotation: {x:30, y:15.0, z:0.0}},
      {joint:"LeftUpLeg", rotation: {x:100.0, y:-15.0, z:0.0}},
      {joint:"LeftLeg", rotation: {x:-130.0, y:-15.0, z:0.0}},
      {joint:"LeftFoot", rotation: {x:30, y:15.0, z:0.0}}
    ]

    this.storeStartPoseAndTransition();

	}

  this.addStandButton = function(){
    this.windowDimensions = Controller.getViewportDimensions();
    this.buttonWidth = 37;
    this.buttonHeight = 46;
    this.buttonPadding = 10;

    this.buttonPositionX = this.windowDimensions.x - this.buttonPadding - this.buttonWidth;
    this.buttonPositionY = (this.windowDimensions.y - this.buttonHeight)/2 - (this.buttonHeight + this.buttonPadding);
    this.standUpButton = Overlays.addOverlay("image", {
      x: this.buttonPositionX, y: this.buttonPositionY, width: this.buttonWidth, height: this.buttonHeight,
      subImage: {x : this.buttonWidth, y: this.buttonHeight, width: this.buttonWidth, height: this.buttonHeight},
      imageURL: this.buttonImageURL,
      visible: false,
      alpha: 1.0
    });
  }

  this.storeStartPoseAndTransition = function() {
    for(var i = 0; i < this.pose.length; i++){
      var startRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(this.pose[i].joint));
      var transitionVector = Vec3.subtract(this.pose[i].rotation, startRotation);
      this.startPoseAndTransition.push({joint: this.pose[i].joint, start: startRotation, transition: transitionVector});
    }
  }

	this.clickReleaseOnEntity = function(entityId, mouseEvent){
		if(mouseEvent.isLeftButton){
     
      if(Settings.getValue(this.isSittingSettingHandle, false) == "false"){
        //first we need to move avatar towards chair
        this.activeUpdate = this.moveToSeat;
      }
    }
  }

  this.update = function(deltaTime){
    self.properties = Entities.getEntityProperties(self.entityId);
    if(!self.activeUpdate){
      return;
    }
    self.activeUpdate(deltaTime);
   
  }

  this.moveToSeat = function(deltaTime){
    self.distance = Vec3.distance(MyAvatar.position, self.properties.position)
    if(self.distance > self.targetAvatarToChairDistance){
      self.sanitizedRotation = Quat.fromPitchYawRollDegrees(0, Quat.safeEulerAngles(self.properties.rotation).y, 0);
      MyAvatar.orientation = Quat.mix(MyAvatar.orientation, self.sanitizedRotation, 0.02);
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.properties.position, 0.01);
    } else {
      //otherwise we made it to chair, now sit down should be out active update function
      this.elapsedTime = 0
      self.activeUpdate = self.sitDown;
    }

  }

  this.sitDown = function(deltaTime){
    self.elapsedTime += deltaTime;
    self.factor = self.elapsedTime/self.totalAnimationTime;
    if(self.elapsedTime< self.totalAnimationTime){
      self.updateJoints();
    } else {
      //We've sat, now start moving the platform (for testing)
      self.activeUpdate = self.moveSeat;
      Settings.setValue(self.isSittingSettingHandle, true);
      Overlays.editOverlay(self.standUpButton, {visible: true});
      var isValid = MyAvatar.setModelReferential(self.properties.id);
    }
  }

  this.standUp = function(deltaTime){
    self.elapsedTime += deltaTime;
    self.factor = 1 - self.elapsedTime/self.totalAnimationTime;
    if(self.elapsedTime < self.totalAnimationTime){
      
      print("STANDING UP");
      self.updateJoints();
    } else {
      //We're done with standing animation
      self.activeUpdate = null;
      Settings.setValue(this.isSittingSettingHandle, false);
    }


  }

  this.moveSeat = function(){
    self.newPosition = Vec3.sum(self.seatVelocity, self.properties.position);
    Entities.editEntity(this.entityId, {position: self.newPosition});
    // MyAvatar.position = self.newPosition;

  }

  self.updateJoints = function(){
    for(var i = 0; i < self.startPoseAndTransition.length; i++){
      self.scaledTransition = Vec3.multiply(self.startPoseAndTransition[i].transition, self.factor);
      self.jointRotation = Vec3.sum(self.startPoseAndTransition[i].start, self.scaledTransition);
      MyAvatar.setJointData(self.startPoseAndTransition[i].joint, Quat.fromVec3Degrees(self.jointRotation));

    }

  }

  this.clearAvatarAnimation = function(){
    MyAvatar.clearReferential();
    for(var i = 0; i < self.pose.length; i++){
      MyAvatar.clearJointData(this.pose[i].joint);
    }
    Overlays.editOverlay(this.standUpButton, {visible: false});

  }

  this.unload = function(){
    Overlays.deleteOverlay(this.standUpButton);
    this.clearAvatarAnimation();
    //if entity is deleted, automatically 
    Script.update.disconnect(this.update);
  }

  this.onClick = function(event){
    var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});
    if(clickedOverlay === self.standUpButton){
      self.elapsedTime = 0;
      self.activeUpdate = self.standUp;
      MyAvatar.clearReferential();
      Overlays.editOverlay(self.standUpButton, {visible: false});

    }

  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

  Controller.mousePressEvent.connect(this.onClick);

  Script.update.connect(this.update);


});