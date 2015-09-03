//
// groupVehicle.js
// examples
//
//  Created by Eric Levin on April 9, 2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js")
var isAssignmentScript = false;
var startingPosition;

startingPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var box;
//Modify these variables to change the pace of your vehicle tour
var pointToPointTime = 5000;
var waitTimeBetweenLoops = 20000;
var waitTimeBetweenStops = 5000;
var waypoints = [];
var currentWaypointIndex = 0;

//Modify these variables to change the pace of your vehicle tour
var pointToPointTime = 2000;
var waitTimeBetweenLoops = 2000;
var waitTimeBetweenStops = 2000;

function init() {

  createWaypoints();
  box = Entities.addEntity({
    type: "Box",
    position: waypoints[0],
    dimensions: {x: 1, y: 1, z: 1},
    color: {red: 20, green: 200, blue: 10},
    script: "file:///Users/ericlevin1/MyHiFiStuff/scripts/seatManager2.js"
  });
  currentWaypointIndex++;

  Script.setTimeout(function() {
    followWaypoints();
  }, waitTimeBetweenLoops);

}

function createWaypoints() {
  waypoints.push(
    {x: startingPosition.x, y: startingPosition.y, z: startingPosition.z},
    {x: startingPosition.x + 5, y: startingPosition.y, z: startingPosition.z}
  )
}

function followWaypoints() {
  startingPosition = Entities.getEntityProperties(box).position;
  var currentProps = {
    x: startingPosition.x,
    y: startingPosition.y,
    z: startingPosition.z,
  }
  var endProps = {
    x: waypoints[
      currentWaypointIndex].x,
    y: waypoints[currentWaypointIndex].y,
    z: waypoints[currentWaypointIndex].z,
  }


  var moveTween = new TWEEN.Tween(currentProps).
    to(endProps, pointToPointTime).
    easing(TWEEN.Easing.Cubic.InOut).
    onUpdate(function() {
      Entities.editEntity(box, {
        position: {
          x: currentProps.x,
          y: currentProps.y,
          z: currentProps.z
        }
      });
    }).start();

  moveTween.onComplete(function() {
    currentWaypointIndex++;
    if (currentWaypointIndex === waypoints.length) {
      currentWaypointIndex = 0;
      //If we've finished loop, then wait specified time to start over again
      Script.setTimeout(function() {
        followWaypoints();
      }, waitTimeBetweenLoops)
    } else {
      Script.setTimeout(function() {
        followWaypoints();
      }, waitTimeBetweenStops)
    }
  });

}

function update() {
  TWEEN.update();
}

Script.setTimeout(function() {
  init()
}, 500);

Script.update.connect(update);
Script.scriptEnding.connect(destroy);

function destroy() {
  Entities.deleteEntity(box);
}