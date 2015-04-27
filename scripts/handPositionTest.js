var box = Entities.addEntity({
  type: 'Box',
  dimensions: {x: .3, y:.3, z:.3},
  position: {x: 0, y: 0, z: 0},
  color: {red: 200, green: 0, blue: 0}
})


function update(){
  Entities.editEntity(box, {position: MyAvatar.handPosition});
}

Script.update.connect(update);