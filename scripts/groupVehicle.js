Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/readme.js");
Script.include("tween.js")
// Script.setTimeout(function(){
  print("TWEEEEN ***********" +  TWEEN)
// }, 1000)
var isAssignmentScript = false;
var startingPosition;
//If you are running this as an assignment script, set the starting spawn point for the vehicle here
//Otherwise, leave this commented out and the vehicle will spawn in front of your avatar

//****************************************
//isAssignmentScript = true
//startingPosition = {
//   x: 8000,
//   y: 8000,
//   z: 8000
// };
//*****************************************
new ReadmeModal({description: "Click on the ship to take a ride! \n Invite your friends to hop on as well!", displayTime: 5000});
var shipModel = "https://hifi-public.s3.amazonaws.com/ryan/lobby_platform4.fbx";
var dimensions = {
  x: 10.8,
  y: 4.04,
  z: 10.8
};

if(!isAssignmentScript){
  startingPosition = MyAvatar.position;
}
var waypoints = [];
var numPoints = 5;
var currentWaypointIndex = 0;
var ship;
var radius = 50;
var pointToPointTime = 5000;
var turnToPointTime = 3000;
var easingFunc;
var waitTimeBetweenLoops = 20000;
var waitTimeBetweenStops = 5000;

function init() {
  easingFunc = TWEEN.Easing.Cubic.InOut;
  for (var i = 0; i < numPoints; i++) {
    var theta = (i / numPoints) * (Math.PI * 2);
    var xPos = startingPosition.x + radius * Math.cos(theta);
    var zPos = startingPosition.z + radius * Math.sin(theta);
    waypoints.push({
      x: xPos,
      y: startingPosition.y,
      z: zPos
    });

  }

  MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, -90, 0);
  ship = Entities.addEntity({
    type: "Model",
    modelURL: shipModel,
    position: waypoints[currentWaypointIndex++],
    dimensions: dimensions,
    script: "https://hifi-public.s3.amazonaws.com/eric/scripts/seat.js"
  });


  Script.setTimeout(function(){
    followWaypoints();
  }, waitTimeBetweenLoops);

}

function followWaypoints(){

  startingPosition = Entities.getEntityProperties(ship).position;
  
  var currentProps = {
    x: startingPosition.x,
    y: startingPosition.y,
    z: startingPosition.z,
  }
  var endProps = {
    x: waypoints[currentWaypointIndex].x,
    y: waypoints[currentWaypointIndex].y,
    z: waypoints[currentWaypointIndex].z,
  }


  var moveTween = new TWEEN.Tween(currentProps).
    to(endProps, pointToPointTime).
    easing(easingFunc).
    onUpdate(function(){
      Entities.editEntity(ship, {position: {x: currentProps.x, y: currentProps.y, z : currentProps.z}});
    }).start();

    moveTween.onComplete(function(){
      currentWaypointIndex++;
      if(currentWaypointIndex === waypoints.length){
        currentWaypointIndex = 0;

        //If we've finished loop, then wait specified time to start over again
        Script.setTimeout(function(){
          followWaypoints();
        }, waitTimeBetweenLoops)
      } else{
        Script.setTimeout(function(){
          followWaypoints();
        }, waitTimeBetweenStops)
      }
    })

}

function update(){
  TWEEN.update();
}

Script.setTimeout(function() {
  init()
}, 500);

Script.update.connect(update);
Script.scriptEnding.connect(destroy);

function destroy(){
  Entities.deleteEntity(ship);
}



//****************************************************************************************************************************************
//****************************************************************************************************************************************
//****************************************************************************************************************************************



