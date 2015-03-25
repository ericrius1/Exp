//
//  look.js
//  examples
//
//  Copyright 2015 High Fidelity, Inc.
//
//  This is an example script that demonstrates use of the Controller class
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var wantDebugging = false;


// Configuration
var TOUCH_YAW_SCALE = -0.25;
var TOUCH_PITCH_SCALE = -12.5;
var FIXED_TOUCH_TIMESTEP = 0.016;

var MOUSE_YAW_SCALE = -0.25;
var MOUSE_PITCH_SCALE = -12.5;
var FIXED_MOUSE_TIMESTEP = 0.016;

// Mouse Data
var alwaysLook = false; // if you want the mouse look to happen only when you click, change this to false
var isMouseDown = false;
var lastTouchX = 0;
var lastTouchY = 0;
var yawFromTouch = 0;
var pitchFromTouch = 0;

// Touch Data
var startedTouching = false;
var lastMouseX = 0;
var lastMouseY = 0;
var yawFromMouse = 0;
var pitchFromMouse = 0;


// Mouse Events
function mousePressEvent(event) {
    if (wantDebugging) {
    }
    if (event.isRightButton) {
        isMouseDown = true;
        lastMouseX = event.x;
        lastMouseY = event.y;
    }
}

function mouseReleaseEvent(event) {
    if (wantDebugging) {
    }
    isMouseDown = false;
}

function mouseMoveEvent(event) {
    if (wantDebugging) {
    }

    if (alwaysLook || isMouseDown) {
        yawFromMouse += ((event.x - lastMouseX) * MOUSE_YAW_SCALE * FIXED_MOUSE_TIMESTEP);
        pitchFromMouse += ((event.y - lastMouseY) * MOUSE_PITCH_SCALE * FIXED_MOUSE_TIMESTEP);
        lastMouseX = event.x;
        lastMouseY = event.y;
    }
}

// Touch Events
function touchBeginEvent(event) {
    if (wantDebugging) {
    }
    lastTouchX = event.x;
    lastTouchY = event.y;
    yawFromTouch = 0;
    pitchFromTouch = 0;
    startedTouching = true;
}

function touchEndEvent(event) {
    if (wantDebugging) {
    }
    startedTouching = false;
}

function touchUpdateEvent(event) {
    // print("TOUCH UPDATE");
    if (wantDebugging) {
    }

    if (!startedTouching) {
      // handle Qt 5.4.x bug where we get touch update without a touch begin event
      startedTouching = true;
      lastTouchX = event.x;
      lastTouchY = event.y;
    }

    yawFromTouch += ((event.x - lastTouchX) * TOUCH_YAW_SCALE * FIXED_TOUCH_TIMESTEP);
    pitchFromTouch += ((event.y - lastTouchY) * TOUCH_PITCH_SCALE * FIXED_TOUCH_TIMESTEP);
    lastTouchX = event.x;
    lastTouchY = event.y;
}


function update(deltaTime) {
    if (wantDebugging) {
    }

    if (yawFromTouch != 0 || yawFromMouse != 0) {
        var newOrientation = Quat.multiply(MyAvatar.orientation, Quat.fromPitchYawRollRadians(0, yawFromTouch + yawFromMouse, 0));

        if (wantDebugging) {
        }

        MyAvatar.orientation = newOrientation;
        yawFromTouch = 0;
        yawFromMouse = 0;
    }

    if (pitchFromTouch != 0 || pitchFromMouse != 0) {
        var newPitch = MyAvatar.headPitch + pitchFromTouch + pitchFromMouse;

        if (wantDebugging) {
        }

        MyAvatar.headPitch = newPitch;
        pitchFromTouch = 0;
        pitchFromMouse = 0;
    }
}


// Map the mouse events to our functions
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

// Map the mouse events to our functions
Controller.touchBeginEvent.connect(touchBeginEvent);
Controller.touchUpdateEvent.connect(touchUpdateEvent);
Controller.touchEndEvent.connect(touchEndEvent);

// disable the standard application for mouse events
Controller.captureTouchEvents();

function scriptEnding() {
    // re-enabled the standard application for mouse events
    Controller.releaseTouchEvents();
}

// would be nice to change to update
Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);
