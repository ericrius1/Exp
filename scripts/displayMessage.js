
Message = function(options) {
  this.options = options;
  this.description = this.options.description || "Provide a description when instantiating the message!"
  this.displayTime = this.options.displayTime || 5000;

  var messageOverlay = Overlays.addOverlay("text", {
    font: {
      size: 16
    },
    x: Window.innerWidth/2,
    y: Window.innerHeight/2,
    width: 400,
    height: 400,
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