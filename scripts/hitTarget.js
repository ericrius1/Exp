var controllerID, controllerActive;
var originalTargetPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(Camera.getOrientation())));
originalTargetPosition.y = MyAvatar.position.y;
var dPosition;
var stickProperties, spring, springLength, targetVelocity;
var HOLD_POSITION_OFFSET = {x: 0, y: .0, z: 0};
var originalStickPosition = {x: originalTargetPosition.x, y: originalTargetPosition.y, z: originalTargetPosition.z};
var STICK_ORIENTATON = Quat.fromPitchYawRollDegrees(0, 0, 0);
var SPRING_FORCE = 15.0;
var STICK_DIMENSIONS = {x: .11, y: .11, z: .59};
var MIN_VELOCITY_FOR_SOUND_IMPACT = 0.25
var hitSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/sword.wav");
var stickHitsCrateSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/wood-on-wood.wav");
var wooshSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/woosh.wav");
var canPlayWooshSound = true;
var boxModelURL = "https://hifi-public.s3.amazonaws.com/eric/models/box.fbx";
var boxCollisionModelURL = "https://hifi-public.s3.amazonaws.com/eric/models/box.obj";
var stickModelURL = "https://hifi-public.s3.amazonaws.com/eric/models/stick.fbx";
var stickCollisionModelURL = "https://hifi-public.s3.amazonaws.com/eric/models/stick.obj";
var MIN_SWING_SOUND_SPEED = 4;
var COLLISION_COOLDOWN_TIME= 500; //Needed because collison event repeatedly fires
var allowCollide = true;
Script.include('jumbotron.js');
jumbotron.create(MyAvatar.position);
var targetProperties, stickProperties, dVelocity;

var lastSoundTime = 0;
var currentTime;

var target = Entities.addEntity({

  type: "Model",
  modelURL: boxModelURL,
  dimensions: {x: .2, y: .2, z: .2},
  collisionModelURL: boxCollisionModelURL,
  position: originalTargetPosition,
  rotation: MyAvatar.orientation,
  ignoreCollisions: false,
  color: {red: 200, green: 10, blue: 200},
  collisionsWillMove: true,
  damping: 0.3
});
Script.setTimeout(function(){
  var tempProps = Entities.getEntityProperties(target);
}, 500);

var stickWorldOrientation;
var stick = Entities.addEntity({
  type: "Model",
  modelURL: stickModelURL,
  collisionModelURL: stickCollisionModelURL,
  position: originalStickPosition,
  dimensions: STICK_DIMENSIONS,
  rotation: MyAvatar.orientation,
  damping: .3,
  collisionsWillMove: true
});



initControls();

function initControls(){
  controllerID = 3; //right handed
  var palmPosition = Controller.getSpatialControlPosition(controllerID);
  controllerActive = (Vec3.length(palmPosition) > 0);
}

Script.setTimeout(function(){
  target = Entities.identifyEntity(target);
  stick = Entities.identifyEntity(stick);  
}, 500);

function cleanup(){
  Entities.deleteEntity(target);
  Entities.deleteEntity(stick);
  jumbotron.cleanup();
}


function onCollision(entity1, entity2, collision){
  if(entity1.id === stick.id || entity2.id === stick.id){
    if( allowCollide){
      var props1 = Entities.getEntityProperties(entity1); 
      var props2 = Entities.getEntityProperties(entity2);
      stickProperties = Entities.getEntityProperties(stick);
      dVelocity = Vec3.length(Vec3.subtract(props1.velocity, props2.velocity));
      if(dVelocity > MIN_VELOCITY_FOR_SOUND_IMPACT){
        Audio.playSound(stickHitsCrateSound, {position:MyAvatar.position, volume: 1.0});
      }
      lastSoundTime = new Date().getTime();
      allowCollide = false;
      Script.setTimeout(function(){
        allowCollide = true;
      }, COLLISION_COOLDOWN_TIME)
    } 

  }
}

function onKeyPress(event){
  if(event.text === 'f'){
    Entities.editEntity(target, {position: originalTargetPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y: 0, z: 0}, angularVelocity: {x: 0, y: 0, z:0}});
    Entities.editEntity(sword, {position: originalStickPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y:0, z: 0}, angularVelocity: {x: 0, y: 0, z: 0}});
  }
}

function update(deltaTime){
  if(!controllerActive){
    return;
  }
  stickWorldOrientation = Quat.multiply(Quat.multiply(MyAvatar.orientation, Controller.getSpatialControlRawRotation(controllerID)), STICK_ORIENTATON);
  holdPosition = Vec3.sum(MyAvatar.getRightPalmPosition(), Vec3.multiplyQbyV(MyAvatar.orientation, HOLD_POSITION_OFFSET));
  holdPosition = Vec3.sum(holdPosition, Vec3.multiplyQbyV(stickWorldOrientation, {x: 0, y: 0, z: STICK_DIMENSIONS.z/2 -.1}));
  targetProperties = Entities.getEntityProperties(target);

  spring = Vec3.subtract(originalTargetPosition, targetProperties.position);
  springLength = Vec3.length(spring);
  spring = Vec3.normalize(spring);
  targetVelocity = Vec3.sum(targetProperties.velocity, Vec3.multiply(springLength * SPRING_FORCE * deltaTime, spring));
  Entities.editEntity(stick, {position: holdPosition, rotation: stickWorldOrientation, velocity: Controller.getSpatialControlVelocity(controllerID) });
  if(Vec3.length(Controller.getSpatialControlVelocity(controllerID)) > MIN_SWING_SOUND_SPEED && canPlayWooshSound){
    Audio.playSound(wooshSound, {position: holdPosition});
    canPlayWooshSound = false;
    Script.setTimeout(function(){
      canPlayWooshSound = true;
    }, 200);
  }
  Entities.editEntity(target, {velocity: targetVelocity});
}

Controller.keyPressEvent.connect(onKeyPress);

Entities.entityCollisionWithEntity.connect(onCollision);

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);