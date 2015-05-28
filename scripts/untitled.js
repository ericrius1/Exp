var e = Entities.findEntities(MyAvatar.position, 4000)
for (i = 0; i < e.length; i++) { 
  var props = Entities.getEntityProperties();
  if (props.type === "Line"){
    Entities.deleteEntity(e[i]); }
  }
}