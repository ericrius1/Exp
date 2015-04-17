var box = Entities.addEntity({
  type: "Model",
  position: MyAvatar.position,
  color: {red: 200, green: 10, blue: 11},
  shnur: "bdur",
  modelURL: "Waaah"
});


Script.scriptEnding.connect(function(){
  Entities.deleteEntity(box);
});