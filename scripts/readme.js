
ReadmeModal = function(options) {
  this.options = options;
  this.description = this.options.description || "This is what this script is. /n This is how to use this script"
  this.displayTime = this.options.displayTime || 5000;

  var readmeOverlay = Overlays.addOverlay("text", {
    font: {
      size: 16
    },
    x: 500,
    y: 500,
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
    Overlays.deleteOverlay(readmeOverlay);
  }, this.displayTime)
}