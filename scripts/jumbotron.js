Jumbotron = function() {
}

Jumbotron.prototype.create = function(position) {
  print('create!')
  this.text = Entities.addEntity({
    type: "Text",
    position: position,
    dimensions: { x: 0.65, y: 0.3, z: 0.01 },
    backgroundColor: {
      red: 64,
      green: 10,
      blue: 64
    },
    textColor: {
      red: 150,
      green: 50,
      blue: 72
    },
    text: "test",
    // lineHeight: 0.06
  });
}


Jumbotron.prototype.cleanup = function(){
  Entities.deleteEntity(this.text);
}

jumbotron = new Jumbotron();