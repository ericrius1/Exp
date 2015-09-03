
//
// displayMessage.js
// examples
//
//  Created by Eric Levin on April 9, 2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Message = function(options) {
  this.options = options;
  this.description = this.options.description || "Provide a description when instantiating the message!"
  this.displayTime = this.options.displayTime || 5000;
  this.height = options.height || 400;
  this.width = options.width || 400;

  var messageOverlay = Overlays.addOverlay("text", {
    font: {
      size: 16
    },
    x: Window.innerWidth / 2 - this.width / 2,
    y: Window.innerHeight / 2 - this.height / 2,
    width: this.width,
    height: this.height,
    text: this.description,
    backgroundColor: {
      red: 0,
      green: 0,
      blue: 0
    },
    backgroundAlpha: 0.8,
    color: {
      red: 10,
      green: 200,
      blue: 10
    }
  });

  Script.setTimeout(function() {
    Overlays.deleteOverlay(messageOverlay);
  }, this.displayTime)
}