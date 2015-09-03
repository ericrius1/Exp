
var keys = [];

var keyColor = 0;

var notesArr = [];

var urlArr = [
  "https://raw.githubusercontent.com/codymcnamara/hifi-piano/master/notes/CDP_60.wav",
  "https://raw.githubusercontent.com/codymcnamara/hifi-piano/master/notes/CDP_61.wav",
  "https://raw.githubusercontent.com/codymcnamara/hifi-piano/master/notes/CDP_62.wav",
  "https://raw.githubusercontent.com/codymcnamara/hifi-piano/master/notes/CDP_63.wav",
  "https://raw.githubusercontent.com/codymcnamara/hifi-piano/master/notes/CDP_64.wav"
];

urlArr.forEach(function(url, index){
  notesArr.push(SoundCache.getSound(url));
});

print(notesArr);

var soundMap = {};

var basePosition = Vec3.sum(
  MyAvatar.position,
  Vec3.multiply(3, Quat.getFront(Camera.getOrientation()))
);

for (var i = 0; i < 5; i++) {

  if (i % 2 === 0){
    keyColor = 0;
  } else {
    keyColor = 250;
  }

  var key = Entities.addEntity({
    type: 'Box',
    dimensions: {
      x: 1,
      y: 1,
      z: 1
    },
    position: {
      x: basePosition.x + (i),
      y: basePosition.y,
      z: basePosition.z
    },
    color: {
      red: keyColor,
      green: keyColor,
      blue: keyColor
    }
  })

  keys.push(key);
}


Script.setTimeout(function(){
  for (var i = 0; i < keys.length; i++) {
    var props = Entities.getEntityProperties(keys[i])
    var id = JSON.stringify(props.id);
    soundMap[id] = notesArr[i];
  };
}, 1000);

function cleanup() {
  keys.forEach(function(key) {
    Entities.deleteEntity(key);
  });
}

function playNote(entityId){

  var position = Entities.getEntityProperties(entityId).position
  var id = JSON.stringify(entityId);
  // print("soundMap downloaded " + (soundMap[entityId]).downloaded);
  if (soundMap[id] && soundMap[id].downloaded) {
    Audio.playSound(soundMap[id], {
      position: MyAvatar.position,
      volume: 1
    });
  } else {
    print("COULD NOT PLAY SOUND!");
  }
}

function mousePressEvent(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if (intersection.intersects) {
    clickedEntity = intersection.entityID;
    // print("entity Id " + JSON.stringify(clickedEntity));
    playNote(clickedEntity.id);
  }
}



Script.scriptEnding.connect(cleanup);

Controller.mousePressEvent.connect(mousePressEvent);

