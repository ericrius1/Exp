	var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var size = 10
var points = [];
var MAX_POINTS = 3;
var updateInterval = 2000;

var line;

newLine();
function newLine() {
	line = Entities.addEntity({
		type: 'Line',
		position: center,
		dimensions: {x: size * 2,  y: size * 2, z: size * 2},
		color: {red: 200, green: 10, blue: 200},
		linePoints: []
	});
	points = []
	
}


function update() {
	var point = {x: randFloat(center.x - size, center.x  + size), y: randFloat(center.y - size, center.y + size), z: randFloat(center.z - size, center.z + size) };
  	points.push(point)
  	Entities.editEntity(line, {linePoints: points} );
  	if(points.length === MAX_POINTS) {
  		newLine();
  	}
}

Script.update.connect(update);
// Script.setInterval(update, updateInterval);

function randInt(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

randFloat = function(low, high) {
  return low + Math.random() * (high - low);
}