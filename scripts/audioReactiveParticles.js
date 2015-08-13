
var song = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/songs/Made%20In%20Heights%20-%20Forgiveness.wav");
var audioOptions = {
  volume: 0.9,
  position: Vec3.sum(Camera.getPosition(), Quat.getFront(Camera.getOrientation()))
};

var DISTANCE_FROM_CAMERA = 7.0;

var colorPalette = [{
  red: 0,
  green: 206,
  blue: 209
}, {
  red: 173,
  green: 216,
  blue: 230
}, {
  red: 0,
  green: 191,
  blue: 255
}];


var NUM_BURSTS = 7;
var SPEED = 5.0;

var rockets = [];
var audioStats;

Rocket = function(point) {
  if (!audioStats) {
    audioStats = Audio.playSound(song, audioOptions);
  }

  this.point = point;
  this.bursts = [];
  this.burst = false;

  this.colors = [];
  this.numColors = randInt(1, NUM_BURSTS);

  for (var i = 0; i < this.numColors; ++i) {
    var colorIndex = randInt(0, colorPalette.length);
    this.colors.push(colorPalette[colorIndex]);
  }

  this.emitRate = randInt(80, 120);
  this.emitStrength = randInt(5.0, 7.0);

  this.rocket = Entities.addEntity({
    type: "Sphere",
    position: this.point,
    dimensions: {
      x: 0.07,
      y: 0.07,
      z: 0.07
    },
    color: {
      red: 240,
      green: 240,
      blue: 240
    }
  });

  this.animationSettings = JSON.stringify({
    fps: 24,
    frameIndex: 0,
    running: true,
    firstFrame: 0,
    lastFrame: 2400,
    loop: false
  });

  this.direction = {
    x: randFloat(-0.2, 0.2),
    y: 1.0,
    z: 0.0
  }

  this.time = 0.0;
  this.timeout = randInt(15, 30);
};

Rocket.prototype.update = function(deltaTime) {
  this.time++;

  Entities.editEntity(this.rocket, {
    velocity: Vec3.multiply(SPEED, this.direction)
  });
  var position = Entities.getEntityProperties(this.rocket).position;

  if (this.time > this.timeout) {
    this.explode(position);
    return;
  }
};



Rocket.prototype.explode = function(position) {
  Entities.editEntity(this.rocket, {
    velocity: {
      x: 0,
      y: 0,
      z: 0
    }
  });

  var colorIndex = 0;
  for (var i = 0; i < NUM_BURSTS; ++i) {
    var color = this.colors[colorIndex];
    this.bursts.push(Entities.addEntity({
      type: "ParticleEffect",
      animationSettings: this.animationSettings,
      position: position,
      textures: 'https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png',
      emitRate: this.emitRate,
      emitStrength: this.emitStrength,
      emitDirection: {
        x: Math.pow(-1, i) * randFloat(0.0, 1.4),
        y: 1.0,
        z: 0.0
      },
      color: color,
      lifespan: 1.0,
      visible: true,
      locked: false
    }));

    if (colorIndex < this.numColors - 1) {
      colorIndex++;
    }
  }
  this.burst = true;
  Entities.deleteEntity(this.rocket);
};

//var lastLoudness;
var LOUDNESS_RADIUS_RATIO = 10;

function update(deltaTime) {
  for (var i = 0; i < rockets.length; i++) {
    if (!rockets[i].burst) {
      rockets[i].update();
    } else {
      if (audioStats && audioStats.loudness > 0.0) {
        for (var j = 0; j < NUM_BURSTS; ++j) {
          Entities.editEntity(rockets[i].bursts[j], {
            particleRadius: audioStats.loudness / LOUDNESS_RADIUS_RATIO
          });
        }
      }
    } 
  }
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function computeWorldPoint(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), DISTANCE_FROM_CAMERA);
  return Vec3.sum(Camera.getPosition(), addVector);
}

function mousePressEvent(event) {
  rockets.push(new Rocket(computeWorldPoint(event)));
}

function cleanup() {
  Audio.stop();
  for (var i = 0; i < rockets.length; ++i) {
    Entities.deleteEntity(rockets[i].rocket);
    for (var j = 0; j < NUM_BURSTS; ++j) {
      Entities.deleteEntity(rockets[i].bursts[j]);
    }
    
  }
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);