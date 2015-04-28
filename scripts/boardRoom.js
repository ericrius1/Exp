//
// boardRoom.js
// examples
//
//  Created by Eric Levin on April 17, 2015
//  Copyright 2015 High Fidelity, Inc.
//  
//  Spawns a bunch of chairs around a table
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
var isAC = false;
var NUM_CHAIRS = 1
var radius = 2;
var chairs = [];
var debugBoxes = [];
var seatURL = "https://s3.amazonaws.com/hifi-public/cozza13/planets/skybox/stool/BarStool.fbx"
var seatManagerURL = "https://hifi-public.s3.amazonaws.com/eric/scripts/oneSeatManager.js?v2";
// var seatManagerURL = "file:///Users/ericlevin1/MyHiFiStuff/scripts/oneSeatManager.js";
var center;
if (isAC) {
  center = {
    x: 6924,
    y: 295,
    z: 4834
  };
} else {
  center = MyAvatar.position;
}
var defaultRotationOffset = 0
var seatFront = {
  x: 0,
  y: 0,
  z: -1
}
var targetRotation;

Script.setTimeout(function() {
  init();
}, 500)

function init() {
  for (var i = 0; i < NUM_CHAIRS; i++) {
    var theta = i / NUM_CHAIRS * Math.PI * 2;
    var x = center.x + (Math.cos(theta) * radius);
    var z = center.z + (Math.sin(theta) * radius);

    var seatRotation = Quat.fromPitchYawRollDegrees(0, defaultRotationOffset, 0);
    var seatPosition = {
      x: x,
      y: center.y,
      z: z
    };
    // var seatPosition = {x: center.x - 5, y:center.y, z: center.z};

    //seat to center vector
    var seatToCenterVector = Vec3.normalize(Vec3.subtract(center, seatPosition));
    var angle = Math.acos(Vec3.dot(seatFront, seatToCenterVector));
    if (seatPosition.x < center.x) {
      targetRotation = Quat.fromPitchYawRollRadians(0, -angle, 0);
    } else {
      targetRotation = Quat.fromPitchYawRollRadians(0, angle, 0);
    }
    seatRotation = Quat.multiply(targetRotation, seatRotation);


    var chair = Entities.addEntity({
      type: "Model",
      modelURL: seatURL,
      position: seatPosition,
      rotation: seatRotation,
      dimensions: {
        x: .52,
        y: 1.1,
        z: .56
      },
      script: seatManagerURL
    });
    chairs.push(chair);

    var debugBox = Entities.addEntity({
      type: 'Box',
      dimensions: {
        x: .7,
        y: .7,
        z: .7
      },
      position: seatPosition,
      color: {
        red: 150,
        blue: 10,
        green: 150
      },
      visible: false
    })

    debugBoxes.push(debugBox);
    chair.debugBox = debugBox;
  }
}


function checkOccupiedSeats() {
  chairs.forEach(function(chair) {
    var userData = getUserData(chair);
    if (userData.seat === 1) {
      Entities.editEntity(chair.debugBox, {
        visible: true
      });
    } else {
      Entities.editEntity(chair.debugBox, {
        visible: false
      });
    }
  });
}

function keyPressed(event) {
  if (event.text === 'g') {
    checkOccupiedSeats();
  }
}

function getUserData(entity) {
  var entityProps = Entities.getEntityProperties(entity);
  if (entityProps.userData) {
    print("USER DATA " + entityProps.userData)
    userData = JSON.parse(entityProps.userData);
  } else {
    userData = {};
  }
  return userData
}

function updateUserData(entity, userData) {
  Entities.editEntity(entity, {
    userData: JSON.stringify(userData)
  });
}



function cleanup() {
  for (var i = 0; i < NUM_CHAIRS; i++) {
    Entities.deleteEntity(chairs[i]);
    Entities.deleteEntity(chairs[i].debugBox);
  }

}

Controller.keyPressEvent.connect(keyPressed)
Script.scriptEnding.connect(cleanup);