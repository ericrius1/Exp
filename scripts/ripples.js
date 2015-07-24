HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
Script.include("utilities.js");
var NUM_ROWS = 6
var NUM_COLUMNS = NUM_ROWS;
var BOX_SIZE = .2;
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(BOX_SIZE * 10, Quat.getFront(Camera.getOrientation())));
var DAMPING = 0.999
var grid = [];
var entities = [];
var IMPULSE = -2;
var PADDING = BOX_SIZE * .2;
var VELOCITY_THRESHOLD = 0.01;

var ELASTICITY = .1;

//cache variables for update 
var extension, acceleration, neighbor, neighborLocation, cell, newColor;

createGrid();
createRain();
//Simulate middle box flung up

function mousePressEvent(event) {
  print('mouse press')
  var pickRay = Camera.computePickRay(event.x, event.y);
  var pickResults = Entities.findRayIntersection(pickRay);
  if (!pickResults.intersects) {
    print('no interset')
    //reset all velocities of blocks
    return;
  }
  print('entity velocity ' + Entities.getEntityProperties(pickResults.entityID).velocity.y);
  Entities.editEntity(pickResults.entityID, {
    velocity: {
      x: 0,
      y: IMPULSE,
      z: 0
    }
  });

}


function reset() {
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      var cell = grid[rowIndex][columnIndex];
      Entities.editEntity(cell.entity, {velocity: {x: 0, y: 0, z: 0}});
    }
  }



}

function update(deleteTime) {
 
  //We want to cache positions of all the boxes once every update, unecessary to do this n^2 times
 
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      var cell = grid[rowIndex][columnIndex];
      cell.props = Entities.getEntityProperties(cell.entity);
    }
  }


  //Now go through each box and apply proper spring forces
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {

      cell = grid[rowIndex][columnIndex];
      //spring force: f = kx
      extension = (cell.props.position.y - cell.basePosition.y);
      var hue = clamp(map(extension, -.05, .1, 0.6, 0.5), 0.5, 0.6);
      var light = clamp(map(extension, -.05, .1, 0.4, 0.6), 0.4, 0.6);
      cell.color = hslToRgb({
        hue: hue,
        sat: 0.7,
        light: light
      });
      acceleration = ELASTICITY * extension;
      cell.props.velocity.y -= acceleration;
      for (var n = 0; n < cell.neighbors.length; n++) {
        neighborLocation = cell.neighbors[n];
        neighbor = grid[neighborLocation[0]][neighborLocation[1]];
        extension = cell.props.position.y - neighbor.props.position.y
        acceleration = ELASTICITY * extension;
        neighbor.props.velocity.y += acceleration;
        cell.props.velocity.y -= acceleration;
      }
    }
  }

  //Now, once all is said and done, go through each cell and update its velocity
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      var cell = grid[rowIndex][columnIndex]
      Entities.editEntity(cell.entity, {
        velocity: cell.props.velocity,
        color: cell.color
      });
    }
  }
}

function cleanup() {
  for (var rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (var columnIndex = 0; columnIndex < grid[rowIndex].length; columnIndex++) {
      Entities.deleteEntity(grid[rowIndex][columnIndex].entity);

    }
  }
}



function createGrid() {
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      if (!grid[rowIndex]) {
        grid[rowIndex] = [];
      }
      var basePosition = Vec3.sum(center, {
        x: rowIndex * (BOX_SIZE + PADDING),
        y: -2,
        z: columnIndex * (BOX_SIZE + PADDING)
      });
      var entity = Entities.addEntity({
        type: 'Box',
        position: basePosition,
        dimensions: {
          x: BOX_SIZE,
          y: BOX_SIZE,
          z: BOX_SIZE
        },
        color: {
          red: 200,
          green: 100,
          blue: 200
        },
        damping: DAMPING,
        collisionsWillMove: true
      });
      grid[rowIndex].push({
        entity: entity,
        basePosition: basePosition,
        neighbors: []
      })
    }
  }

  //Set up neighbors
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      if (rowIndex < NUM_ROWS - 1) {
        //Bottom Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex + 1, columnIndex]);
      }
      if (rowIndex > 0) {
        //Top Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex - 1, columnIndex])
      }
      if (columnIndex < NUM_COLUMNS - 1) {
        // Right Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex, columnIndex + 1])
      }
      if (columnIndex > 0) {
        //Left Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex, columnIndex - 1]);
      }

    }

  }
}

Controller.mousePressEvent.connect(mousePressEvent);

Script.update.connect(update);
Script.scriptEnding.connect(cleanup)