var scriptURL = "file:///Users/ericlevin/myhifistuff/scripts/sprayPaintCan.js?=v6"
// var scriptURL = "https://hifi-public.s3.amazonaws.com/eric/scripts/sprayPaintCan.js?=v1"
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var paintGun = Entities.addEntity({
 type: "Model",
 // modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/sprayGun.fbx?=v3",
 modelURL: "file:///Users/ericlevin/Desktop/sprayGun.fbx?v6",
 position: center,
 dimensions: {
     x: 0.03,
     y: 0.15,
     z: 0.34
 },
 collisionsWillMove: true,
 shapeType: 'box',
 script: scriptURL
});

function cleanup() {
    Entities.deleteEntity(paintGun);
}


Script.scriptEnding.connect(cleanup);