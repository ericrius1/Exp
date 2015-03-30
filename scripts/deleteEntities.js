var entities = Entities.findEntities(MyAvatar.position, 10000);
var props;
for(var i = 0; i < entities.length; i++){
  props = Entities.getEntityProperties(entities[i]);
  print(props.script)
  if(props.script){
     print("INDEX.... "  + props.script.indexOf("lavalamp"))
  }
  if( props.script && props.script.indexOf("lavalamp") !== -1){
    Entities.deleteEntity(entities[i]);
    print("DELETE!!")
  }
}