
var MAX_POINTS_PER_LINE = 80;
var LINE_DIMENSIONS = 1;
MousePaint();

function MousePaint() {
  var DRAWING_DISTANCE = 5;
  var lines = [];
  var isDrawing = false;

  var LINE_WIDTH = 7 ;
  var line;
  var points = [];

  var BRUSH_SIZE = .05;

  var brush = Entities.addEntity({
    type: 'Sphere',
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    color: {red: 100, green: 10, blue: 100},
    dimensions: {
      x: BRUSH_SIZE,
      y: BRUSH_SIZE,
      z: BRUSH_SIZE
    }
  });


  function newLine(point) {
    line = Entities.addEntity({
      position: point,
      type: "Line",
      color: {red: 200, green: 10, blue: 200},
      dimensions: {
        x: LINE_DIMENSIONS,
        y: LINE_DIMENSIONS,
        z: LINE_DIMENSIONS
      },
      linePoints: [],
      lineWidth: LINE_WIDTH
    });
    points = [];
    if (point) {
      points.push(point);
    }
    lines.push(line);
  }


  function mouseMoveEvent(event) {


    if (!isDrawing) {
      return;
    }
    
    var point = computePoint(event);
    var success = Entities.setAllPoints(line, points);
    Entities.editEntity(brush, {
      position: point
    });

    points.push(point);

    if (points.length === MAX_POINTS_PER_LINE) {
      //We need to start a new line!
      newLine(point)
    }
  }

  function computePoint(event) {
    var pickRay = Camera.computePickRay(event.x, event.y);
    var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), DRAWING_DISTANCE);
    return Vec3.sum(Camera.getPosition(), addVector);
  }

  function mousePressEvent(event) {
    if(!event.isLeftButton) {
      isDrawing = false;
      return;
    }
    var point = computePoint(event);
    newLine(point);
    isDrawing = true;

  }

  function mouseReleaseEvent() {
    isDrawing = false;
  }


  function cleanup() {
    lines.forEach(function(line) {
      Entities.deleteEntity(line);
    });
    Entities.deleteEntity(brush);

  }


  Controller.mousePressEvent.connect(mousePressEvent);
  Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
  Controller.mouseMoveEvent.connect(mouseMoveEvent);
  Script.scriptEnding.connect(cleanup);

}


function randFloat(low, high) {
  return low + Math.random() * (high - low);
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}