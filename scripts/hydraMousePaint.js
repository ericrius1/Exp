//
//  hydraPaint.js
//  examples
//
//  Created by Eric Levin on 5/14/15.
//  Copyright 2014 High Fidelity, Inc.
//
//  This script allows you to paint with the hydra or mouse!
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
var MAX_POINTS_PER_LINE = 80;
var DRAWING_DISTANCE = 5;

var colorPalette = [
  {red: 236, green:208 , blue:120 },
  {red: 217, green: 91, blue: 67 },
  {red: 192, green: 41, blue: 66},
  {red: 84, green: 36, blue:  55},
  {red:83, green: 119, blue: 122 }
];

var currentColorIndex = 0;
var currentColor = colorPalette[currentColorIndex];


if(hydraCheck() === true){
  Script.include('hydraPaint.js');
} else{
  Script.include('mousePaint.js');
}


function cycleColor() {
  currentColor = colorPalette[++currentColorIndex];
  if(currentColorIndex === colorPalette.length){
    currentColorIndex = -1;
  }

}

function hydraCheck() {
    var numberOfButtons = Controller.getNumberOfButtons();
    var numberOfTriggers = Controller.getNumberOfTriggers();
    var numberOfSpatialControls = Controller.getNumberOfSpatialControls();
    var controllersPerTrigger = numberOfSpatialControls / numberOfTriggers;
    hydrasConnected = (numberOfButtons == 12 && numberOfTriggers == 2 && controllersPerTrigger == 2);
    return hydrasConnected;//hydrasConnected;
}


