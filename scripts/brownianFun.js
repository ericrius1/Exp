HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
var FLOOR_SIZE = 10;
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(FLOOR_SIZE * 1.5, Quat.getFront(Camera.getOrientation())));
var WALL_WIDTH = .1;
var FLOOR_HEIGHT_OFFSET = -2;
var WALL_HEIGHT = FLOOR_SIZE / 4;
var BALL_DROP_HEIGHT = center.y + WALL_HEIGHT;
var NUM_BALLS = 10;
var BALL_RADIUS = 1;
var BROWNIAN_INTERVAL_TIME = 1000;
var BROWNIAN_FORCE_RANGE = 5;

var brownianMotionActivated = false;

var bounds = {
  xMin: center.x - FLOOR_SIZE / 2,
  xMax: center.x + FLOOR_SIZE / 2,
  zMin: center.z - FLOOR_SIZE / 2,
  zMax: center.z + FLOOR_SIZE / 2
};
var balls = [];

var screenSize = Controller.getViewportDimensions();
var BUTTON_SIZE = 32;
var PADDING = 3;

var brownianButton = Overlays.addOverlay("image", {
  x: screenSize.x / 2 - BUTTON_SIZE,
  y: screenSize.y - (BUTTON_SIZE + PADDING),
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  imageURL: HIFI_PUBLIC_BUCKET + "images/blocks.png",
  color: {
    red: 255,
    green: 255,
    blue: 255
  },
  alpha: 1
});

var floor = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(center, {
    x: 0,
    y: FLOOR_HEIGHT_OFFSET,
    z: 0
  }),
  dimensions: {
    x: FLOOR_SIZE,
    y: WALL_WIDTH,
    z: FLOOR_SIZE
  },
  color: {
    red: 100,
    green: 100,
    blue: 100
  }
});

var rightWall = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(center, {
    x: FLOOR_SIZE / 2,
    y: FLOOR_HEIGHT_OFFSET / 2,
    z: 0
  }),
  dimensions: {
    x: WALL_WIDTH,
    y: WALL_HEIGHT,
    z: FLOOR_SIZE
  },
  color: {
    red: 120,
    green: 100,
    blue: 120
  }
});

var leftWall = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(center, {
    x: -FLOOR_SIZE / 2,
    y: FLOOR_HEIGHT_OFFSET / 2,
    z: 0
  }),
  dimensions: {
    x: WALL_WIDTH,
    y: WALL_HEIGHT,
    z: FLOOR_SIZE
  },
  color: {
    red: 120,
    green: 100,
    blue: 120
  }
});

var backWall = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(center, {
    x: 0,
    y: FLOOR_HEIGHT_OFFSET / 2,
    z: -FLOOR_SIZE / 2,
  }),
  dimensions: {
    x: FLOOR_SIZE,
    y: WALL_HEIGHT,
    z: WALL_WIDTH
  },
  color: {
    red: 120,
    green: 100,
    blue: 120
  }
});

var frontWall = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(center, {
    x: 0,
    y: FLOOR_HEIGHT_OFFSET / 2,
    z: FLOOR_SIZE / 2,
  }),
  dimensions: {
    x: FLOOR_SIZE,
    y: WALL_HEIGHT,
    z: WALL_WIDTH
  },
  color: {
    red: 120,
    green: 100,
    blue: 120
  }
});

spawnBalls();

function spawnBalls() {
  for (var i = 0; i < NUM_BALLS; i++) {
    balls.push(Entities.addEntity({
      type: "Sphere",
      position: {
        x: randFloat(bounds.xMin, bounds.xMax),
        y: BALL_DROP_HEIGHT,
        z: randFloat(bounds.zMin, bounds.zMax)
      },
      dimensions: {
        x: BALL_RADIUS,
        y: BALL_RADIUS,
        z: BALL_RADIUS
      },
      color: {
        red: 130,
        green: 70,
        blue: 150
      },
      ignoreCollisions: false,
      collisionsWillMove: true,
      gravity: {
        x: 0,
        y: -9,
        z: 0
      },
      velocity: {
        x: 0,
        y: -.1,
        z: 0
      }
    }));
  }
}

function mousePressEvent(event) {
  var clickedOverlay = Overlays.getOverlayAtPoint({
    x: event.x,
    y: event.y
  });
  if (clickedOverlay == brownianButton) {
    brownianMotionActivated = !brownianMotionActivated;
    if(brownianMotionActivated){
      brownianInterval = Script.setInterval(bumpBalls, BROWNIAN_INTERVAL_TIME);
    } else {
      Script.clearInterval(brownianInterval);
    }
  }
}

function bumpBalls(){
  balls.forEach(function(ball){
    Entities.editEntity(ball, {
      velocity: {x: randFloat(-BROWNIAN_FORCE_RANGE, BROWNIAN_FORCE_RANGE), y: randFloat(-BROWNIAN_FORCE_RANGE, BROWNIAN_FORCE_RANGE), z: randFloat(-BROWNIAN_FORCE_RANGE, BROWNIAN_FORCE_RANGE)}
    });
  });
}

function cleanup() {
  Entities.deleteEntity(floor);
  Entities.deleteEntity(rightWall);
  Entities.deleteEntity(leftWall);
  Entities.deleteEntity(backWall);
  Entities.deleteEntity(frontWall);
  balls.forEach(function(ball) {
    Entities.deleteEntity(ball);
  });
  Overlays.deleteEntity(brownianButton);
}

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}


Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);