(function() {
    this.unload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID);
        var position = properties.position;
        print('position at unload::: ' + JSON.stringify(position))
    };

});