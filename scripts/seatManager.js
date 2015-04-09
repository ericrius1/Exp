(function() {
  var self = this;
  this.preload = function(entityId) {
    this.entityId = entityId;
    this.buttonImageURL = "https://s3.amazonaws.com/hifi-public/images/tools/sit.svg";
    this.addStandButton();
    this.totalAnimationTime = 0.7;
    this.targetAvatarToChairDistance = 0.5;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.isSittingSettingHandle = "AvatarSittingState";
    Settings.setValue(this.isSittingSettingHandle, false);
    this.startPoseAndTransition = [];
    this.forward = {
      x: 0,
      y: 0,
      z: -1
    };
    this.mySeatIndex = null;

    this.seatRadius = this.properties.dimensions.x  * 0.4;
    this.sittingAreaAngle = Math.PI;
    this.numSeats = 5;
    this.seatHeight = 1.0;

    this.seatedPose = [{
      joint: "LeftArm",
      rotation: {
        x: 70.0,
        y: 0.0,
        z: 60.0
      }
    }, {
      joint: "LeftForeArm",
      rotation: {
        x: -40.0,
        y: 15.0,
        z: 20.0
      }
    }, {
      joint: "RightArm",
      rotation: {
        x: 70.0,
        y: 0.0,
        z: -60.0
      }
    }, {
      joint: "RightForeArm",
      rotation: {
        x: -40.0,
        y: -15.0,
        z: -20.0
      }
    }, {
      joint: "RightUpLeg",
      rotation: {
        x: 100.0,
        y: 15.0,
        z: 0.0
      }
    }, {
      joint: "RightLeg",
      rotation: {
        x: -120.0,
        y: 80.0,
        z: 0.0
      }
    }, {
      joint: "RightFoot",
      rotation: {
        x: 20,
        y: 5.0,
        z: 0.0
      }
    }, {
      joint: "LeftUpLeg",
      rotation: {
        x: 100.0,
        y: -15.0,
        z: 0.0
      }
    }, {
      joint: "LeftLeg",
      rotation: {
        x: -150.0,
        y: -70.0,
        z: 0.0
      }
    }, {
      joint: "LeftFoot",
      rotation: {
        x: 30,
        y: 15.0,
        z: 0.0
      }
    }];

    this.storeStartPoseAndTransition();
    this.getUserData();
  }

  this.initSeats = function() {
    this.userData.seats = [];
    for (var i = 0; i < this.numSeats; i++) {
      this.userData.seats[i] = 0;
    }
    this.updateUserData();
  }

  //returns the index of first empty seat found in vehicle
  this.assignSeat = function() {
    this.getUserData();
    for (var i = 0; i < this.userData.seats.length; i++) {
      if (this.userData.seats[i] === 0) {
        this.mySeatIndex = i;
        this.userData.seats[this.mySeatIndex] = 1;
        this.updateUserData();
        //Now return so we don't fill up any other seat!
        return;
      }
    }
  }

  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
    } else {
      this.userData = {};
    }
    if (!this.userData.seats) {
      this.initSeats();
    }
  }

  this.updateUserData = function() {
    Entities.editEntity(this.entityId, {
      userData: JSON.stringify(this.userData)
    });
  }


  this.addStandButton = function() {
    this.windowDimensions = Controller.getViewportDimensions();
    this.buttonWidth = 37;
    this.buttonHeight = 46;
    this.buttonPadding = 10;

    this.buttonPositionX = (this.windowDimensions.x - this.buttonPadding)/2 - this.buttonWidth;
    this.buttonPositionY = (this.windowDimensions.y - this.buttonHeight) - (this.buttonHeight + this.buttonPadding);
    this.standUpButton = Overlays.addOverlay("image", {
      x: this.buttonPositionX,
      y: this.buttonPositionY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      subImage: {
        x: this.buttonWidth,
        y: this.buttonHeight,
        width: this.buttonWidth,
        height: this.buttonHeight
      },
      imageURL: this.buttonImageURL,
      visible: false,
      alpha: 1.0
    });
  }

  this.storeStartPoseAndTransition = function() {
    for (var i = 0; i < this.seatedPose.length; i++) {
      var startRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(this.seatedPose[i].joint));
      var transitionVector = Vec3.subtract(this.seatedPose[i].rotation, startRotation);
      this.startPoseAndTransition.push({
        joint: this.seatedPose[i].joint,
        start: startRotation,
        transition: transitionVector
      });
    }
  }

  this.clickDownOnEntity = function(entityId, mouseEvent) {
    if (mouseEvent.isLeftButton && Settings.getValue(this.isSittingSettingHandle, false) == "false") {
      this.initMoveToSeat();
    }
  }

  this.initMoveToSeat = function() {

    this.assignSeat();
    if (this.mySeatIndex !== null) {
      this.seatTheta = -this.mySeatIndex / this.numSeats * this.sittingAreaAngle;
      //first we need to move avatar towards seat
      this.activeUpdate = this.moveToSeat;
    } else {
      print("NO SEAT AVAILABLE AT THIS TIME *************************");
    }

  }

  this.update = function(deltaTime) {
    if (self.entityId) {
      self.properties = Entities.getEntityProperties(self.entityId);
      //need to always update seat so when user clicks on it it is in proper world space
      var xPos = self.properties.position.x + (Math.cos(self.seatTheta) * self.seatRadius);
      var zPos = self.properties.position.z + (Math.sin(self.seatTheta) * self.seatRadius);
      self.seatPosition = {
        x: xPos,
        y: self.properties.position.y + self.seatHeight,
        z: zPos
      };
    }
    if (!self.activeUpdate) {
      return;
    }
    self.activeUpdate(deltaTime);

  }

  this.moveToSeat = function(deltaTime) {
    self.distance = Vec3.distance(MyAvatar.position, self.seatPosition);
    if (self.distance > self.targetAvatarToChairDistance) {
      self.sanitizedRotation = Quat.fromPitchYawRollDegrees(0, Quat.safeEulerAngles(self.properties.rotation).y, 0);
      MyAvatar.orientation = Quat.mix(MyAvatar.orientation, self.sanitizedRotation, 0.02);
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.seatPosition, 0.05);
    } else {
      //otherwise we made it to chair, now sit down should be out active update function
      this.elapsedTime = 0
      self.activeUpdate = self.sitDown;
    }

  }

  this.sitDown = function(deltaTime) {
    self.elapsedTime += deltaTime;
    self.factor = self.elapsedTime / self.totalAnimationTime;
    if (self.elapsedTime < self.totalAnimationTime) {
      self.updateJoints();
    } else {
      //We've sat, now we don't need to update any longer;
      self.activeUpdate = null;
      Settings.setValue(self.isSittingSettingHandle, true);
      Overlays.editOverlay(self.standUpButton, {
        visible: true
      });
      var isValid = MyAvatar.setModelReferential(self.properties.id);
    }
  }

  this.standUp = function(deltaTime) {

    self.elapsedTime += deltaTime;
    self.factor = 1 - self.elapsedTime / self.totalAnimationTime;
    if (self.elapsedTime < self.totalAnimationTime) {
      self.updateJoints();
    } else {
      //We're done with standing animation
      self.activeUpdate = null;
      Settings.setValue(this.isSittingSettingHandle, false);
      //We just finished a standup after deleting the entity the avatar was sitting on
      if (self.disconnectAfterStanding) {
        Overlays.deleteOverlay(this.standUpButton);
        Script.update.disconnect(self.update);
      }
      //make sure we set avatar head yaw back to 0.
      MyAvatar.headYaw = 0
      this.userData.seats[this.mySeatIndex] = 0;
      this.mySeatIndex = null;
      this.updateUserData();
      //make sure we free up this seat
      this.clearAvatarAnimation();

    }
  }

  self.updateJoints = function() {
    for (var i = 0; i < self.startPoseAndTransition.length; i++) {
      self.scaledTransition = Vec3.multiply(self.startPoseAndTransition[i].transition, self.factor);
      self.jointRotation = Vec3.sum(self.startPoseAndTransition[i].start, self.scaledTransition);
      MyAvatar.setJointData(self.startPoseAndTransition[i].joint, Quat.fromVec3Degrees(self.jointRotation));

    }

  }

  this.clearAvatarAnimation = function() {
    MyAvatar.clearReferential();
    for (var i = 0; i < self.seatedPose.length; i++) {
      MyAvatar.clearJointData(this.seatedPose[i].joint);
    }
    Overlays.editOverlay(this.standUpButton, {
      visible: false
    });

  }

  this.unload = function() {
    var isSitting = Settings.getValue(this.isSittingSettingHandle)
    this.entityId = null;
    if (isSitting === "true") {
      //  We need to let avatar stand before disconnecting, and then end
      this.initStandUp();
      this.disconnectAfterStanding = true;
      this.activeUpdate = this.standUp
    } else {
      this.clearAvatarAnimation();
      Script.update.disconnect(this.update);
    }
  }

  this.onClick = function(event) {
    var clickedOverlay = Overlays.getOverlayAtPoint({
      x: event.x,
      y: event.y
    });
    if (clickedOverlay === self.standUpButton) {
      self.initStandUp();
    }
  }

  this.initStandUp = function() {
    this.elapsedTime = 0;
    this.activeUpdate = this.standUp;
    MyAvatar.clearReferential();
    Overlays.editOverlay(self.standUpButton, {
      visible: false
    });
  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

  Controller.mousePressEvent.connect(this.onClick);
  Script.update.connect(this.update);

});