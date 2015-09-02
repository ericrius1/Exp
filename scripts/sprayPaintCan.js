(function() {

    this.userData = {};

    var pollInterval;

    var RED_COLOR = {red: 200, green: 10, blue: 10};
    var GREEN_COLOR = {red: 10, green: 200, blue: 10};
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



    this.mousePressOnEntity= function(entityId, mouseEvent) {
        print("click");
        this.userData.color = Math.random() < 0.5 ? "red" : "green";
        this.updateUserData();
    }

    this.update = function(deltaTime) {
        self.getUserData();
        if(self.userData.color === "red") {
            Entities.editEntity(self.entityId, {
                color: RED_COLOR
            });
        } else if(self.userData.color === "green") {
            Entities.editEntity(self.entityId, {
                color: GREEN_COLOR
            });
        }

    }


    this.preload = function(entityId) {
        this.properties = Entities.getEntityProperties(entityId);
        this.entityId = entityId;
    }

    this.unload = function() {
        print("GOODBYE")
        Script.update.disconnect(this.update);
    }
        Script.update.connect(this.update);
});