//
//  paint.js
//  examples
//
//  Created by Eric Levin on 6/4/15.
//  Copyright 2014 High Fidelity, Inc.
//
//  This script allows you to paint with the hydra or mouse!
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
var BASE_URL = 'https://hifi-staff.s3.amazonaws.com/bridget/bridget/';
var LINE_DIMENSIONS = 5;
var LIFETIME = 6000;
var RAD_TO_DEG = 180.0 / Math.PI;
var Y_AXIS = {
  x: 0,
  y: 1,
  z: 0
};
var X_AXIS = {
  x: 1,
  y: 0,
  z: 0
};

var theta = 0.0;

function orientationOf(vector) {
 var direction, yaw, pitch;
 direction = Vec3.normalize(vector);
 yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
 pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
 return Quat.multiply(yaw, pitch);
}

dragVector();

function dragVector() {
  var DRAWING_DISTANCE = 5;
  var isDragging = false;

  var LINE_WIDTH = 4;
  var line, linePosition;
 
  var arrow1, arrow2;

  function newLine(position) {

    linePosition = position;
    var points = []; 

    line = Entities.addEntity({
      position: position,
      type: "Line",
      color: {red: 255, green: 255, blue: 255},
      dimensions: {
        x: LINE_DIMENSIONS,
        y: LINE_DIMENSIONS,
        z: LINE_DIMENSIONS
      },
      lineWidth: LINE_WIDTH,
      lifetime: LIFETIME,
      linePoints: []
    });
   
  }


  function mousePressEvent(event) {
    if (!event.isLeftButton) {
      isDragging = false;
      return;
    }

    arrow1 = Entities.addEntity({
      position: {x: 0, y: 0, z: 0},
      type: "Line",
      dimensions: {
        x: LINE_DIMENSIONS,
        y: LINE_DIMENSIONS,
        z: LINE_DIMENSIONS
      },
      color: {red: 255, green: 255, blue: 255},
      lineWidth: LINE_WIDTH,
      linePoints: []
    });

    arrow2 = Entities.addEntity({
      position: {x: 0, y: 0, z: 0},
      type: "Line",
      dimensions: {
        x: LINE_DIMENSIONS,
        y: LINE_DIMENSIONS,
        z: LINE_DIMENSIONS
      },
      color: {red: 255, green: 255, blue: 255},
      lineWidth: LINE_WIDTH,
      linePoints: []
    });

    newLine(computeWorldPoint(event));
    isDragging = true;
  }

  var radius = 0.12;
  var theta1 = Math.PI / 8.0;
  var theta2 = -Math.PI / 8.0;

  var arrow1Offset = {
      x: radius * Math.cos(theta1),
      y: radius * Math.sin(theta1),
      z: 0
    }
    var arrow2Offset = {
      x: radius * Math.cos(theta2),
      y: radius * Math.sin(theta2),
      z: 0
    }

    var eulerAngle = {x: Math.PI, y: Math.PI, z: 0};
    var rotation = Quat.fromVec3Radians(eulerAngle);
 
  function mouseMoveEvent(event) {
    var worldPoint = computeWorldPoint(event);
    
    if (!isDragging) {
      return;
    }

    var localPoint = computeLocalPoint(event);
    points = [{x: 0, y: 0, z: 0}, localPoint];

    Entities.editEntity(line, { linePoints: points });
     
    print(JSON.stringify(eulerAngle));
    print(JSON.stringify(rotation));


    //eulerAngle.x += Math.atan2(worldPoint.y, worldPoint.x);
    //rotation = Quat.fromVec3Radians(eulerAngle);

    rotation = orientationOf(localPoint);
    rotation = Quat.multiply(rotation, orientationOf(worldPoint));


    Entities.editEntity(arrow1, { 
      visible: true,
      position: worldPoint,
      linePoints: [{x: 0, y: 0, z: 0}, arrow1Offset],
      //rotation: rotation
    });
    Entities.editEntity(arrow2, { 
      visible: true,
      position: worldPoint,
      linePoints: [{x: 0, y: 0, z: 0}, arrow2Offset],
      //rotation: rotation
    });
   
  }

  function computeWorldPoint(event) {
    var pickRay = Camera.computePickRay(event.x, event.y);
    var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), DRAWING_DISTANCE);
    return Vec3.sum(Camera.getPosition(), addVector);
  }

  function computeLocalPoint(event) {
    var localPoint = Vec3.subtract(computeWorldPoint(event), linePosition);
    return localPoint;
  }

  function mouseReleaseEvent() {
    isDragging = false;
    // Entities.deleteEntity(line);
    // Entities.deleteEntity(arrow1);
    // Entities.deleteEntity(arrow2);
  }

  function cleanup() {
    lines.forEach(function(line) {
      // Entities.deleteEntity(line);
    });
    Entities.deleteEntity(brush);

  }

  Controller.mousePressEvent.connect(mousePressEvent);
  Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
  Controller.mouseMoveEvent.connect(mouseMoveEvent);
  Script.scriptEnding.connect(cleanup);

}