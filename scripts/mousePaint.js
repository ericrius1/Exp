var MousePaint() {
  var lines = [];
  var isDrawing = false;


  var MAX_POINTS_PER_LINE = 20;
  var LINE_WIDTH = 7;
  var line;
  var points = [];


  var BRUSH_SIZE = 0.08;

  var brush = Entities.addEntity({
    type: 'Sphere',
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    color: currentColor,
    dimensions: {
      x: BRUSH_SIZE,
      y: BRUSH_SIZE,
      z: BRUSH_SIZE
    }
  });


  function newLine(point) {
    line = Entities.addEntity({
      position: MyAvatar.position,
      type: "Line",
      color: currentColor,
      dimensions: {
        x: 10,
        y: 10,
        z: 10
      },
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


    var pickRay = Camera.computePickRay(event.x, event.y);
    var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), DRAWING_DISTANCE);
    var point = Vec3.sum(Camera.getPosition(), addVector);
    points.push(point);
    Entities.editEntity(line, {
      linePoints: points
    });
    Entities.editEntity(brush, {
      position: point
    })

    if (points.length === MAX_POINTS_PER_LINE) {
      //We need to start a new line!
      newLine(point);
    }
  }

  function mousePressEvent() {
    newLine();
    isDrawing = true;

  }

  function mouseReleaseEvent() {
    isDrawing = false;
  }

  function keyPressEvent(event) {
    if (event.text === "SPACE") {
      cycleColor();
      Entities.editEntity(brush, {
        color: currentColor
      });
    }
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

  function randFloat(low, high) {
    return Math.floor(low + Math.random() * (high - low));
  }


  function randInt(low, high) {
    return Math.floor(randFloat(low, high));
  }

  Controller.keyPressEvent.connect(keyPressEvent);
}