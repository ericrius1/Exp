var NUM_ROWS = 7;
var CUBE_SIZE = 1;
var cubes = [];

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(Camera.getOrientation())));

for (var x = 0; x < NUM_ROWS * CUBE_SIZE; x += CUBE_SIZE) {
  for (var z = 0; z < NUM_ROWS * CUBE_SIZE; z+=CUBE_SIZE) {

    var hue = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.5, 0.8 );
    var sat = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.4, 0.7 );
    var light = map(x * z, 0, Math.pow((NUM_ROWS * CUBE_SIZE), 2), 0.4, 0.7 );
    var hslColor = {hue: hue, sat: sat, light: light};
    var rgbColor = hslToRgb(hslColor);
    var relativePosition = {
      x: x,
      y: -2,
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
  }
}



function cleanup() {
  cubes.forEach(function(cube) {
    Entities.deleteEntity(cube);
  })
}


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
    return low + Math.random() * ( high - low );
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}
