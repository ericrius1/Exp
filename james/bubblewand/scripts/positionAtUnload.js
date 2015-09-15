(function() {

this.unload=function(entityID){
	this.properties = Entities.getEntityProperties(EntityID);
	this.position = this.properties.position;
	print('position at unload::: '+JSON.stringify(this.position));

}

})