(function() {

    this.userData = {};

    var pollInterval;

 
    var self = this;

    this.getUserData = function() {


        if (this.properties.userData) {
            this.userData = JSON.parse(this.properties.userData);
        }
    }

    this.updateUserData = function() {
        Entities.editEntity(this.entityId, {
            userData: JSON.stringify(this.userData)
        });
    }

    this.update = function(deltaTime) {
        self.properties = Entities.getEntityProperties(self.entityId);
        self.getUserData();
        if(self.userData.activated === true) {
            print("YAAAA");
        }
    }


    this.preload = function(entityId) {
        this.entityId = entityId;
    }

    this.unload = function() {
        print("GOODBYE")
        Script.update.disconnect(this.update);
    }
    Script.update.connect(this.update);
});