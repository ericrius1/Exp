Jumbotron = function() {
}


Jumbotron.prototype.create = function(options) {
  this.screens = [];
  var dimensions = { x: 2, y: 0.3, z: 0.01 };
  var yaw = 0;
  this.backgroundColor = {
      red: 64,
      green: 10,
      blue: 64
    };
  this.textColor =  {
      red: 150,
      green: 50,
      blue: 72
  }
  var screenProps = {
    type: "Text",
    position: options.position || {x: 0, y: 0, z: 0},
    rotation: {x: 0, y: 0, z: 0},
    dimensions: dimensions,
    backgroundColor: this.backgroundColor,
    textColor: this.textColor,
    text: options.text || "text",
  }

    var screen = Entities.addEntity(screenProps);
    this.screens.push(screen);

    yaw -= 90;
    screenProps.rotation = Quat.fromPitchYawRollDegrees(0, yaw, 0);
    screenProps.position.x -= dimensions.x/2;
    screenProps.position.z -= dimensions.x/2;
    screen = Entities.addEntity(screenProps);
    this.screens.push(screen);

    yaw -= 90;
    screenProps.rotation = Quat.fromPitchYawRollDegrees(0, yaw, 0);
    screenProps.position.x += dimensions.x/2;
    screenProps.position.z -= dimensions.x/2;
    screen = Entities.addEntity(screenProps);
    this.screens.push(screen);

    yaw -= 90;
    screenProps.rotation = Quat.fromPitchYawRollDegrees(0, yaw, 0);
    screenProps.position.x += dimensions.x/2;
    screenProps.position.z += dimensions.x/2;
    screen = Entities.addEntity(screenProps);
    this.screens.push(screen);
}

Jumbotron.prototype.updateText = function(newText){
  this.screens.forEach(function(screen){
    Entities.editEntity(screen, {text: newText});
  });
}


Jumbotron.prototype.cleanup = function(){
  for(var i = 0; i < this.screens.length; i++){
    Entities.deleteEntity(this.screens[i]);
  }
}

jumbotron = new Jumbotron();