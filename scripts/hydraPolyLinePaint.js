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
var LASER_WIDTH = 3;
var LASER_COLOR = {
    red: 50,
    green: 150,
    blue: 200
};
var TRIGGER_THRESHOLD = .1;

var MAX_POINTS_PER_LINE = 10;

var LIFETIME = 6000;
var DRAWING_DEPTH = 3;
var LINE_DIMENSIONS = 100;


var MIN_POINT_DISTANCE = 0.01;

var MIN_BRUSH_RADIUS = 0.04;
var MAX_BRUSH_RADIUS = 0.08;

var RIGHT_BUTTON_1 = 7
var RIGHT_BUTTON_2 = 8
var RIGHT_BUTTON_3 = 9;
var RIGHT_BUTTON_4 = 10
var LEFT_BUTTON_1 = 1;
var LEFT_BUTTON_2 = 2;
var LEFT_BUTTON_3 = 3;
var LEFT_BUTTON_4 = 4;

var colorPalette = [{
    red: 10,
    green: 208,
    blue: 60
}, {
    red: 214,
    green: 91,
    blue: 67
}, {
    red: 192,
    green: 41,
    blue: 66
}, {
    red: 84,
    green: 36,
    blue: 55
}, {
    red: 83,
    green: 119,
    blue: 122
}];

var MIN_STROKE_WIDTH = 0.002;
var MAX_STROKE_WIDTH = 0.05;

function controller(side, cycleColorButton) {
    this.triggerHeld = false;
    this.triggerThreshold = 0.9;
    this.side = side;
    this.palm = 2 * side;
    this.tip = 2 * side + 1;
    this.trigger = side;
    this.cycleColorButton = cycleColorButton;

    this.points = [];
    this.normals = [];
    this.strokeWidths = [];

    this.currentColorIndex = 0;
    this.currentColor = colorPalette[this.currentColorIndex];


    this.brush = Entities.addEntity({
        type: 'Sphere',
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        color: this.currentColor,
        dimensions: {
            x: MIN_BRUSH_RADIUS,
            y: MIN_BRUSH_RADIUS,
            z: MIN_BRUSH_RADIUS
        }
    });

    this.cycleColor = function() {
        this.currentColor = colorPalette[++this.currentColorIndex];
        if (this.currentColorIndex === colorPalette.length - 1) {
            this.currentColorIndex = -1;
        }
    }
    this.newLine = function(position) {
        print("NEW LINE")
        this.linePosition = position;
        this.line = Entities.addEntity({
            position: position,
            type: "PolyLine",
            color: this.currentColor,
            dimensions: {
                x: LINE_DIMENSIONS,
                y: LINE_DIMENSIONS,
                z: LINE_DIMENSIONS
            },
            lineWidth: 0.1,
            lifetime: LIFETIME
        });
        this.points = [];
        this.normals = []
        this.strokeWidths = [];
    }

    this.update = function(deltaTime) {
        this.updateControllerState();
  
        var newBrushPosOffset = Vec3.multiply(Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition)), DRAWING_DEPTH);
        var newBrushPos = Vec3.sum(this.palmPosition, newBrushPosOffset);
        var brushRadius = map(this.triggerValue, TRIGGER_THRESHOLD, 1, MIN_BRUSH_RADIUS, MAX_BRUSH_RADIUS)
        Entities.editEntity(this.brush, {
            position: newBrushPos,
            color: this.currentColor,
            dimensions: {
                x: brushRadius,
                y: brushRadius,
                z: brushRadius
            }
        });


        if (this.triggerValue > TRIGGER_THRESHOLD && !this.drawing) {
            this.newLine(this.palmPosition);
            this.drawing = true;
            print('YAAAAA')
        } else if (this.drawing && this.triggerValue < TRIGGER_THRESHOLD) {
            this.drawing = false;
        }

        if (this.drawing) {
            var localPoint = Vec3.subtract(newBrushPos, this.linePosition);
            if (Vec3.distance(localPoint, this.points[this.points.length - 1]) < MIN_POINT_DISTANCE) {
                // print("NOT ENOUGH DISTANCE BETWEEN POINTS!!");
                return;
            }

            this.points.push(localPoint);
            var normal = computeNormal(newBrushPos, Camera.getPosition());

            this.normals.push(normal);
            var strokeWidth = map(this.triggerValue, TRIGGER_THRESHOLD, 1, MIN_STROKE_WIDTH, MAX_STROKE_WIDTH);
            this.strokeWidths.push(strokeWidth);
            Entities.editEntity(this.line, {
                linePoints: this.points,
                normals: this.normals,
                strokeWidths: this.strokeWidths,
                color: this.currentColor
            });

            if (this.points.length > MAX_POINTS_PER_LINE) {
                this.newLine(newBrushPos);
                this.points.push(Vec3.subtract(newBrushPos, this.linePosition));
                this.normals.push(computeNormal(newBrushPos, Camera.getPosition()));
                this.strokeWidths.push(MIN_STROKE_WIDTH);
            }
        }
    }


    this.updateControllerState = function() {
        this.cycleColorButtonPressed = Controller.isButtonPressed(this.cycleColorButton);
        this.palmPosition = Controller.getSpatialControlPosition(this.palm);
        this.tipPosition = Controller.getSpatialControlPosition(this.tip);
        this.palmNormal = Controller.getSpatialControlNormal(this.palm);
        this.triggerValue = Controller.getTriggerValue(this.trigger);

        
        if (this.prevCycleColorButtonPressed === true && this.cycleColorButtonPressed === false) {
            this.cycleColor();
            Entities.editEntity(this.brush, {
                // color: this.currentColor
            });
        }

        this.prevCycleColorButtonPressed = this.cycleColorButtonPressed;

    }

    this.cleanup = function() {
        Entities.deleteEntity(this.brush);
    }
}

function computeNormal(p1, p2) {
    return Vec3.normalize(Vec3.subtract(p2, p1));
}

function update(deltaTime) {
    leftController.update(deltaTime);
    rightController.update(deltaTime);
}

function scriptEnding() {
    leftController.cleanup(); 
    rightController.cleanup();
}

function vectorIsZero(v) {
    return v.x === 0 && v.y === 0 && v.z === 0;
}


var rightController = new controller(RIGHT, RIGHT_BUTTON_4);
var leftController = new controller(LEFT, LEFT_BUTTON_4);
Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);

function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}