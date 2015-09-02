// var scriptURL = "file:///Users/ericlevin/myhifistuff/scripts/sprayPaintCan.js?=v5"
var scriptURL = "https://hifi-public.s3.amazonaws.com/eric/scripts/sprayPaintCan.js?=v1"
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

// var paintGun = Entities.addEntity({
//  type: "Model",
//  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/sprayGun.fbx?=v2",
//  position: center,
//  dimensions: {
//      x: 0.15,
//      y: 0.34,
//      z: 0.03
//  },
//  collisionsWillMove: true,
//  shapeType: 'box',
//  script: scriptURL
// });
var paintGun = Entities.addEntity({
 type: "Box",
 color: {red: 10, green: 10, blue: 200},
 position: center,
 dimensions: {
     x: 1.25,
     y: 1.34,
     z: 1.03
 },
 script: scriptURL
});



function cleanup() {
    Entities.deleteEntity(paintGun);
}


Script.scriptEnding.connect(cleanup);