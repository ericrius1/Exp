//Script for testing name property of entities

var box = Entities.addEntity({
  type: "Box",
  name: "Shnur hbbuuur",
  position: Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation()))),
  dimensions: {x: 1, y: 1, z:1},
  color: {red: 200, green: 20, blue: 111}
});

function changeName(){
  Entities.editEntity(box, {name: "Yaaa Baaaa"});
  print('name changed');
}

function deleteName(){
  var entities = Entities.findEntities(MyAvatar.position, 10)
  for (i = 0; i < entities.length; i++) { 
    var props = Entities.getEntityProperties(entities[i]);
    if(props.name === "Bdurr"){
      Entities.deleteEntity(entities[i]);
      print("Entity deleted!")
    }

  }
}

Script.setTimeout(changeName, 5000);
// Script.setTimeout(deleteName, 2000);