var NUM_ROWS = 7;
var CUBE_SIZE = 1;
var cubes = [];
var cubesSettings = [];
var time = 0;

var OMEGA = 2.0 * Math.PI / 16;
var RANGE = 1.0;

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(Camera.getOrientation())));


for (var x = 0, rowIndex = 0; x < NUM_ROWS * CUBE_SIZE; x += CUBE_SIZE, rowIndex++) {
  for (var z = 0, columnIndex = 0; z < NUM_ROWS * CUBE_SIZE; z += CUBE_SIZE, columnIndex++) {
    var hue = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.5, 0.8);
    var sat = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.4, 0.7);
    var light = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.4, 0.7);
    var hslColor = {
      hue: hue,
      sat: sat,
      light: light
    };
    var rgbColor = hslToRgb(hslColor);
    var baseHeight = map(rowIndex * columnIndex, 0, Math.pow(NUM_ROWS, 2), -4, -2);
    var relativePosition = {
      x: x,
      y: baseHeight,
      z: z
    };
    var position = Vec3.sum(center, relativePosition);
    cubes.push(Entities.addEntity({
      type: 'Box',
      position: position,
      dimensions: {
        x: CUBE_SIZE,
        y: CUBE_SIZE,
        z: CUBE_SIZE
      },
      color: rgbColor
    }));

    print('phase ' + map(rowIndex * columnIndex, 0, Math.pow(NUM_ROWS, 2), OMEGA/2, OMEGA * 2));
    cubesSettings.push({
      baseHeight: center.y + baseHeight,
      phase: randFloat(OMEGA/2, OMEGA * 2)
    })
  }
}

function update(deleteTime) {
  time += deleteTime;
  for (var i = 0; i < cubes.length; i++) {
    var phase = cubesSettings[i].phase;
    var props = Entities.getEntityProperties(cubes[i]);
    var newHeight = cubesSettings[i].baseHeight + Math.sin(time * phase) / 2.0 * RANGE;
    var newVelocityY = Math.cos(time * phase) / 2.0 * RANGE * phase;

    var newPosition = props.position;
    var newVelocity = props.velocity;

    newPosition.y = newHeight;
    newVelocity = newVelocityY;
    Entities.editEntity( cubes[i], {
      position: newPosition,
      velocity: props.velocity
    });
  }
}

function cleanup() {
  cubes.forEach(function(cube) {
    Entities.deleteEntity(cube);
  })
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup)



////***************** UTILITIES *************************************

function hslToRgb(hslColor) {
  var h = hslColor.hue;
  var s = hslColor.sat;
  var l = hslColor.light;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    red: Math.round(r * 255),
    green: Math.round(g * 255),
    blue: Math.round(b * 255)
  };

}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function randFloat(low, high) {
  return low + Math.random() * (high - low);
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}