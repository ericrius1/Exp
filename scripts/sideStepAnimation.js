
var localVelocity;

var EPSILON = 0.1


function update() {
	localVelocity = Vec3.multiplyQbyV( Quat.inverse(MyAvatar.orientation),  MyAvatar.getVelocity());

}

Script.update.connect(update)