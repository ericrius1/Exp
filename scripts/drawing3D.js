var lines = [];
var isDrawing = false;


function mouseMoveEvent(){
  if(!isDrawing){
    return;
  }

  print('drawing')
}

function mousePressEvent(){
  isDrawing = true;
}

function mouseReleaseEvent(){
  isDrawing = false;
}


function cleanup(){

}



Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.mouseMoveEvent.connect(mouseMoveEvent);
Script.scriptEnding.connect(cleanup);