var e = Entities.findEntities(MyAvatar.position, 16000)
for (i = 0; i < e.length; i++) { 
  var props = Entities.getEntityProperties(e[i]);
  if (props.type === "Line"){
    Entities.deleteEntity(e[i]); 
  }
}