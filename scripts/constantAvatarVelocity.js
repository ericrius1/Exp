
var SPEED = 5;

function update(){
  var velocity = MyAvatar.getVelocity();
  if(Vec3.length(velocity) > SPEED){
    var direction = Vec3.normalize(velocity);
    velocity = Vec3.multiply(SPEED, direction);
    print('velocity ' + JSON.stringify(velocity))
    MyAvatar.motorVelocity = velocity;
  }

}
MyAvatar.motorTimescale = 0.25



Script.update.connect(update);