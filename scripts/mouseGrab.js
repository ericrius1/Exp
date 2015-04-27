


function mousePressEvent(event){
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  print("intersection? " + intersection.intersects);
}


Controller.mousePressEvent.connect(mousePressEvent);
Script.update.connect(update);