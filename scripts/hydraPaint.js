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

var LEFT = 0;
var RIGHT = 1;

var currentTime = 0;


var DISTANCE_FROM_HAND = 1;
var minBrushSize = DISTANCE_FROM_HAND / 50;
var maxBrushSize = minBrushSize * 2
var currentBrushSize = minBrushSize;

var minLineWidth = 1;
var maxLineWidth = 2;
var currentLineWidth = minLineWidth;
var MIN_PAINT_TRIGGER_THRESHOLD = .01;
var MAX_POINTS_PER_LINE = 20;
var LINE_LIFETIME = 20;
var COLOR_CHANGE_TIME_FACTOR = 0.1;

var RIGHT_BUTTON_3 = 9;
var LEFT_BUTTON_3 = 3;

function controller(side, undoButton) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;
  this.lines = [];
  this.isPainting = false;
  this.undoButton =  undoButton; 
  this.undoButtonPressed = false;  
  this.prevUndoButtonPressed = false;  

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
    }
    this.lines.push(this.line);
  }

  this.update = function(deltaTime) {
    this.updateControllerState();
    this.updateColor();
    var startPosition = this.palmPosition;
    var offsetVector = Vec3.multiply(DISTANCE_FROM_HAND, Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition)));
    var endPosition = Vec3.sum(startPosition, offsetVector);
    currentBrushSize = map(this.triggerValue, 0, 1, minBrushSize, maxBrushSize);
    Entities.editEntity(this.brush, {
      position: endPosition,
      dimensions: {
        x: currentBrushSize,
        y: currentBrushSize,
        z: currentBrushSize
      },
      color: this.rgbColor
    });
    if (this.triggerValue > MIN_PAINT_TRIGGER_THRESHOLD) {
      if (!this.isPainting) {
        this.isPainting = true;
        this.newLine();
      }
      this.paint(endPosition);
    } else {
      this.isPainting = false;
    }

    this.oldPalmPosition = this.palmPosition;
    this.oldTipPosition = this.tipPosition;
  }

  this.updateColor = function() {
    this.hslColor.hue = Math.sin(currentTime * COLOR_CHANGE_TIME_FACTOR);
    this.rgbColor = hslToRgb(this.hslColor);

  }


  this.updateControllerState = function() {
    this.undoButtonPressed = Controller.isButtonPressed(this.undoButton);    
    if(this.prevUndoButtonPressed === true && this.undoButtonPressed === false){
      //User released undo button, so undo
      this.undoStroke();
    }
    this.prevUndoButtonPressed = this.undoButtonPressed

    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    this.tipPosition = Controller.getSpatialControlPosition(this.tip);
    this.triggerValue = Controller.getTriggerValue(this.trigger);
  }

  this.undoStroke = function(){
    Entities.deleteEntity(this.lines.pop());
  }

  this.paint = function(point) {

    currentLineWidth = map(this.triggerValue, 0, 1, minLineWidth, maxLineWidth);
    this.points.push(point);
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
  // leftController.update(deltaTime);
  currentTime += deltaTime;
}

function scriptEnding() {
  rightController.cleanup();
  leftController.cleanup();
}

function vectorIsZero(v) {
  return v.x === 0 && v.y === 0 && v.z === 0;
}


var rightController = new controller(RIGHT, RIGHT_BUTTON_3);
var leftController = new controller(LEFT, LEFT_BUTTON_3);


Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);

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