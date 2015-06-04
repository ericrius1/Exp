//
//  hydraPaint.js
//  examples
//
//  Created by Eric Levin on 5/14/15.
//  Copyright 2014 High Fidelity, Inc.
//
//  This script allows you to paint with the hydra!
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
var MAX_POINTS_PER_LINE = 30;

Script.include('lineRider.js')
var lineRider = new LineRider();
lineRider.addStartHandler(function(){
  var points = [];
  //create points array from list of all points in path
  rightController.path.forEach(function(point){
    points.push(point);
  });
  lineRider.setPath(points);
});

var LEFT = 0;
var RIGHT = 1;

var currentTime = 0;


var DISTANCE_FROM_HAND = 2;
var minBrushSize = .05;
var maxBrushSize = .1


var minLineWidth = 5;
var maxLineWidth = 10;
var currentLineWidth = minLineWidth;
var MIN_PAINT_TRIGGER_THRESHOLD = .01;
var LINE_LIFETIME = 20;
var COLOR_CHANGE_TIME_FACTOR = 0.1;

var RIGHT_BUTTON_3 = 9;
var RIGHT_BUTTON_4 = 10;
var LEFT_BUTTON_3 = 3;
var LEFT_BUTTON_4 = 4;

var STROKE_SMOOTH_FACTOR = 1;

var MIN_DRAW_DISTANCE = 1;
var MAX_DRAW_DISTANCE = 2;

function controller(side, undoButton, redoButton) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;
  this.lines = [];
  this.deletedLines = [] //just an array of properties objects
  this.isPainting = false;
  this.undoButton =  undoButton; 
  this.undoButtonPressed = false;  
  this.prevUndoButtonPressed = false;  
  this.redoButton = redoButton;
  this.redoButtonPressed = false;
  this.prevRedoButtonPressed = false;
  this.strokeCount = 0;
  this.currentBrushSize = minBrushSize;
  this.points = [];
  this.path = [];

  this.hslColor = {
    hue: 0.5,
    sat: .7,
    light: 0.7
  };
  this.rgbColor = hslToRgb(this.hslColor);
  this.brush = Entities.addEntity({
    type: 'Sphere',
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    color: this.rgbColor,
    dimensions: {
      x: minBrushSize,
      y: minBrushSize,
      z: minBrushSize
    }
  });


  this.newLine = function(point) {
    this.line = Entities.addEntity({
      position: MyAvatar.position,
      type: "Line",
      color: hslToRgb(this.hslColor),
      dimensions: {
        x: 10,
        y: 10,
        z: 10
      },
      lineWidth: 5,
      // lifetime: LINE_LIFETIME
    });
    this.points = [];
    if (point) {
      this.points.push(point);
      this.path.push(point);
    }
    this.lines.push(this.line);
  }

  this.update = function(deltaTime) {
    this.updateControllerState();
    this.updateColor();
    this.avatarPalmOffset = Vec3.subtract(this.palmPosition, MyAvatar.position);
    this.projectedForwardDistance = Vec3.dot(Quat.getFront(Camera.getOrientation()), this.avatarPalmOffset);
    this.mappedPalmOffset = map(this.projectedForwardDistance, -.5, .5, MIN_DRAW_DISTANCE, MAX_DRAW_DISTANCE);
    this.tipDirection = Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition));
    this.offsetVector = Vec3.multiply(this.mappedPalmOffset, this.tipDirection );
    this.drawPoint = Vec3.sum(this.palmPosition, this.offsetVector);
    this.currentBrushSize = map(this.triggerValue, 0, 1, minBrushSize, maxBrushSize);
    Entities.editEntity(this.brush, {
      position: this.drawPoint,
      dimensions: {
        x: this.currentBrushSize,
        y: this.currentBrushSize,
        z: this.currentBrushSize
      },
      color: this.rgbColor
    });
    if (this.triggerValue > MIN_PAINT_TRIGGER_THRESHOLD) {
      if (!this.isPainting) {
        this.isPainting = true;
        this.newLine();
        this.path = [];
      }
      if(this.strokeCount % STROKE_SMOOTH_FACTOR === 0){
        this.paint(this.drawPoint);
      }
      this.strokeCount++;
    } else if (this.triggerValue < MIN_PAINT_TRIGGER_THRESHOLD && this.isPainting) {
      this.releaseTrigger();
    }

    this.oldPalmPosition = this.palmPosition;
    this.oldTipPosition = this.tipPosition;
  }

  this.releaseTrigger = function(){
    this.isPainting = false;

  }

  this.updateColor = function() {
    this.hslColor.hue = Math.sin(currentTime * COLOR_CHANGE_TIME_FACTOR);
    this.rgbColor = hslToRgb(this.hslColor);

  }


  this.updateControllerState = function() {
    this.undoButtonPressed = Controller.isButtonPressed(this.undoButton);   
    this.redoButtonPressed = Controller.isButtonPressed(this.redoButton);   
    // print("undo button pressed " + this.undoButtonPressed) 
    if(this.prevUndoButtonPressed === true && this.undoButtonPressed === false){
      //User released undo button, so undo
      this.undoStroke();
    }
    if(this.prevRedoButtonPressed === true && this.redoButtonPressed === false){
      this.redoStroke();
    }
    this.prevRedoButtonPressed = this.redoButtonPressed;
    this.prevUndoButtonPressed = this.undoButtonPressed;

    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    this.tipPosition = Controller.getSpatialControlPosition(this.tip);
    this.triggerValue = Controller.getTriggerValue(this.trigger);
  }

  this.undoStroke = function(){
    var deletedLine = this.lines.pop();
    var deletedLineProps = Entities.getEntityProperties(deletedLine);
    this.deletedLines.push(deletedLineProps);
    Entities.deleteEntity(deletedLine);
  }

  this.redoStroke = function(){
    var restoredLine = Entities.addEntity(this.deletedLines.pop());
    Entities.addEntity(restoredLine);
    this.lines.push(restoredLine);
  }

  this.paint = function(point) {

    currentLineWidth = map(this.triggerValue, 0, 1, minLineWidth, maxLineWidth);
    this.points.push(point);
    this.path.push(point);
    Entities.editEntity(this.line, {
      linePoints: this.points,
      lineWidth: currentLineWidth,
      color: this.rgbColor
    });
    if (this.points.length > MAX_POINTS_PER_LINE) {
      this.newLine(point);
    }
  }

  this.cleanup = function() {
    Entities.deleteEntity(this.brush);
    this.lines.forEach(function(line) {
      Entities.deleteEntity(line);
    });
  }
}

function update(deltaTime) {
  rightController.update(deltaTime);
  leftController.update(deltaTime);
  currentTime += deltaTime;
}

function scriptEnding() {
  rightController.cleanup();
  leftController.cleanup();
  lineRider.cleanup();
}

function mousePressEvent(event){
  lineRider.mousePressEvent(event);
}

function vectorIsZero(v) {
  return v.x === 0 && v.y === 0 && v.z === 0;
}




var rightController = new controller(RIGHT, RIGHT_BUTTON_3, RIGHT_BUTTON_4);
var leftController = new controller(LEFT, LEFT_BUTTON_3, LEFT_BUTTON_4);

Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);
Controller.mousePressEvent.connect(mousePressEvent);

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(hslColor) {
  var h = hslColor.hue;
  var s = hslColor.sat;
  var l = hslColor.light;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    red: Math.round(r * 255),
    green: Math.round(g * 255),
    blue: Math.round(b * 255)
  };

}