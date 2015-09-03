//
// seatManager.js
// examples/entityScripts
//
//  Created by Eric Levin on April 9, 2015
//  Copyright 2015 High Fidelity, Inc.
//
// This is an example of an entity script which handles positioning and seating avatars correctly on a moving vehicle.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  userData.seat: 0 = empty; 1 = occupied, 2=user is moving towards it but not there yet

(function() {
  var self = this;
  this.preload = function(entityId) {
    this.shouldSetReferential = false;
    this.seatHeight = 0.5;
    this.seatOffsetFactor = -.07
    this.targetAvatarToChairDistance = 0.5;
    this.seatPollIntervalTime = 500;
    this.entityId = entityId;
    this.buttonImageURL = "https://s3.amazonaws.com/hifi-public/images/tools/sit.svg";
    this.addStandButton();
    this.totalAnimationTime = 0.7;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.seatPosition = {
      x: this.properties.position.x,
      y: this.properties.position.y + this.seatHeight,
      z: this.properties.position.z
    };
    this.seatPosition = Vec3.sum(this.seatPosition, Vec3.multiply(this.seatOffsetFactor, Quat.getFront(this.properties.rotation)))
    this.isSittingSettingHandle = "AvatarSittingState";
    Settings.setValue(this.isSittingSettingHandle, false);
    this.startPoseAndTransition = [];
    this.entityRotationOffset = 0; //for entities rotated around y axis certain amount by default
    this.targetRotation = Quat.safeEulerAngles(self.properties.rotation).y + this.entityRotationOffset;
    this.forward = {
      x: 0,
      y: 0,
      z: -1
    };

    // This is the pose we would like to end up
    this.createSeatedPose();
    this.storeStartPoseAndTransition();
    this.getUserData();
    this.avatarPoller = Script.setInterval(self.pollAvatar, self.seatPollIntervalTime);


  }

  this.pollAvatar = function() {
    self.properties = Entities.getEntityProperties(self.entityId);
    self.getUserData();
    var inRange = AvatarList.isAvatarInRange(self.properties.position, 0.5 );
    // if(self.userData.seat === 1 && !inRange){
    //   print("AVATAR NOT IN RANGE")
    //   //The avatar who was sitting on this seat either quit or crashed without standing up, so free up this seat
    //   self.userData.seat = 0;
    //   self.updateUserData();
    // };
  }

  this.initSeats = function() {
    this.userData.seat = 0;
    this.updateUserData();
  }

  this.assignSeat = function() {
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData();
    print("USER DATA SEAT" + this.userData.seat)
    if (this.userData.seat === 0) {
      this.userData.seat = 2;
      this.updateUserData();
      return true;
    }
    return false;
  }

  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
    } else {
      this.userData = {};
    }
    if (!this.userData.seat) {
      this.initSeats();
    }
  }

  this.updateUserData = function() {
    Entities.editEntity(this.entityId, {
      userData: JSON.stringify(this.userData)
    });
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    //clicked on seat
    var isStanding = false;
    if (Settings.getValue(this.isSittingSettingHandle, false) === false) {
      isStanding = true;
    }
    if (mouseEvent.isLeftButton && isStanding) {
      this.initMoveToSeat();
    }
  }

  this.initMoveToSeat = function() {
    if (this.assignSeat()) {
      //we found a seat, so move avatar towards seat
      this.activeUpdate = this.moveToSeat;
    }

  }

  this.update = function(deltaTime) {
    if (!self.activeUpdate) {
      return;
    }
    self.activeUpdate(deltaTime);

  }

  this.moveToSeat = function(deltaTime) {
    self.distance = Vec3.distance(MyAvatar.position, self.seatPosition);
    if (self.distance > self.targetAvatarToChairDistance){
      self.sanitizedRotation = Quat.fromPitchYawRollDegrees(0, this.targetRotation, 0);
      MyAvatar.orientation = Quat.mix(MyAvatar.orientation, self.sanitizedRotation, 0.1);
      MyAvatar.position = Vec3.mix(MyAvatar.position, self.seatPosition, 0.1);
      print("SIIT")
    } else {
      //otherwise we made it to chair, now sit down should be our active update function
      self.elapsedTime = 0
      self.activeUpdate = self.sitDown;
    }

  }

  this.sitDown = function(deltaTime) {
    self.elapsedTime += deltaTime;
    self.factor = self.elapsedTime / self.totalAnimationTime;
    if (self.elapsedTime < self.totalAnimationTime) {
      self.updateJoints();
    } else {
      //We've sat!
      self.activeUpdate = null;
      Settings.setValue(self.isSittingSettingHandle, true);
      this.userData.seat = 1;
      this.updateUserData();
      Overlays.editOverlay(self.standUpButton, {
        visible: true
      });
      if (self.shouldSetReferential) {
        MyAvatar.setModelReferential(self.properties.id);
      }
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
      Settings.setValue(self.isSittingSettingHandle, false);
      //We just finished a standup after deleting the entity the avatar was sitting on
      if (self.disconnectAfterStanding) {
        Overlays.deleteOverlay(this.standUpButton);
        Script.update.disconnect(self.update);
      }
      //make sure we set avatar head yaw back to 0.
      MyAvatar.headYaw = 0
      self.userData.seat = 0;
      self.updateUserData();
      //make sure we free up this seat
      self.clearAvatarAnimation();

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
    if (this.shouldSetReferential) {
      MyAvatar.clearReferential();
    }
    for (var i = 0; i < self.seatedPose.length; i++) {
      MyAvatar.clearJointData(this.seatedPose[i].joint);
    }
    Overlays.editOverlay(this.standUpButton, {
      visible: false
    });

  }

  this.unload = function() {
    print("UNLOAD " + this.avatarPoller);
    Script.clearInterval(this.avatarPoller);
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
    if (this.shouldSetReferential) {
      MyAvatar.clearReferential();
    }
    Overlays.editOverlay(self.standUpButton, {
      visible: false
    });
  }

  this.addStandButton = function() {
    this.windowDimensions = Controller.getViewportDimensions();
    this.buttonWidth = 37;
    this.buttonHeight = 46;
    this.buttonPadding = 10;

    this.buttonPositionX = (this.windowDimensions.x - this.buttonPadding) / 2 - this.buttonWidth;
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

  this.createSeatedPose = function() {
    this.seatedPose = [
      {
        joint: "RightUpLeg",
        rotation: {
          x: 100.0,
          y: 15.0,
          z: 0.0
        }
      },
      {
        joint: "RightLeg",
        rotation: {
          x: -130.0,
          y: 15.0,
          z: 0.0
        }
      },
      {
        joint: "RightFoot",
        rotation: {
          x: 30,
          y: 15.0,
          z: 0.0
        }
      },
      {
        joint: "LeftUpLeg",
        rotation: {
          x: 100.0,
          y: -15.0,
          z: 0.0
        }
      },
      {
        joint: "LeftLeg",
        rotation: {
          x: -130.0,
          y: -15.0,
          z: 0.0
        }
      },
      {
        joint: "LeftFoot",
        rotation: {
          x: 30,
          y: 15.0,
          z: 0.0
        }
      }
    ];

  }

  function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
  }

  Controller.mousePressEvent.connect(this.onClick);
  Script.update.connect(this.update);

});