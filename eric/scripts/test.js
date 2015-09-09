var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var entity = Entities.addEntity({
	type: 'Box',
    position: center,
	color: {red: 200, green: 10, blue: 200},
    visible: false
});,




function cleanup() {
    Entities.deleteEntity(entity);
}

Script.scriptEnding.connect(cleanup);