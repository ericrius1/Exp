//Takes the avatar on a line ride
LineRider = function() {
  HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
  var screenSize = Controller.getViewportDimensions();

  var BUTTON_SIZE = 32;
  var PADDING = 3;

  this.buttonOffColor = {
    red: 250,
    green: 10,
    blue: 10
  };
  this.buttonOnColor = {
    red: 10,
    green: 200,
    blue: 100
  };
  this.startButtonOn = false;

  this.startButton = Overlays.addOverlay("image", {
    x: screenSize.x / 2 - BUTTON_SIZE + PADDING * 2,
    y: screenSize.y - (BUTTON_SIZE + PADDING),
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    imageURL: HIFI_PUBLIC_BUCKET + "images/pencil.png?v2",
    color: this.buttonOffColor,
    alpha: 1
  });

  this.currentPoint = 0;
  this.shouldUpdate = false;
  this.moveIntervalTime = 100;

}


LineRider.prototype.move = function() {
  if (!this.shouldMove) {
    return;
  }
  MyAvatar.position = this.points[this.currentPoint++];

  if (this.currentPoint === this.points.length) {
    this.currentPoint = 0;
  }
  var self = this;
  Script.setTimeout(function() {
    self.move();
  }, this.moveIntervalTime);
}

LineRider.prototype.setPath = function(points) {
  this.points = points;
}

LineRider.prototype.addStartHandler = function(callback) {
  this.onStart = callback;
}


LineRider.prototype.mousePressEvent = function(event) {
  var clickedOverlay = Overlays.getOverlayAtPoint({
    x: event.x,
    y: event.y
  });
  if (clickedOverlay == this.startButton) {
    this.startButtonOn = !this.startButtonOn;
    if (this.startButtonOn === true) {
      Overlays.editOverlay(this.startButton, {
        color: this.buttonOnColor
      });
      if (this.onStart) {
        this.onStart();
        this.shouldMove = true;
        var self = this;
        Script.setTimeout(function() {
          self.move();
        }, this.moveIntervalTime);
      }
    } else {
      Overlays.editOverlay(this.startButton, {
        color: this.buttonOffColor
      })
      this.shouldMove = false;
    }

  }

}

LineRider.prototype.startRide = function() {
  this.shouldUpdate = true;

}

LineRider.prototype.cleanup = function() {
  Overlays.deleteOverlay(this.startButton);
}