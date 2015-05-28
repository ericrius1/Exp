

var FLOOR_SIZE = 10;
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(FLOOR_SIZE * 1.5, Quat.getFront(Camera.getOrientation())));
var WALL_WIDTH = .1;
var FLOOR_HEIGHT_OFFSET = -2;
var WALL_HEIGHT = FLOOR_SIZE / 4;


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
    y: FLOOR_HEIGHT_OFFSET/2,
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
    y: FLOOR_HEIGHT_OFFSET/2,
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
    y: FLOOR_HEIGHT_OFFSET/2,
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
    y: FLOOR_HEIGHT_OFFSET/2,
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




function cleanup() {
  Entities.deleteEntity(floor);
  Entities.deleteEntity(rightWall);
  Entities.deleteEntity(leftWall);
  Entities.deleteEntity(backWall);
  Entities.deleteEntity(frontWall);
}

Script.scriptEnding.connect(cleanup);