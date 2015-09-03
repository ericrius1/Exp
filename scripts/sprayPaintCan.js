(function() {


    this.userData = {};

    var TIP_OFFSET_Z = 0.14;
    var TIP_OFFSET_Y = 0.04;

    var ZERO_VEC = {
        x: 0,
        y: 0,
        z: 0
    }

    var self = this;

    var stopSetting = JSON.stringify({
        running: false
    });
    var startSetting = JSON.stringify({
        running: true
    });

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
        if (self.userData.grabKey && self.userData.grabKey.activated === true) {
            if ( self.activated !== true) {
                Entities.editEntity(self.paintStream, {
                    animationSettings: startSetting
                });
                self.activated = true;
            }
            //Move emitter to where entity is always when its activated
            self.paint();
        } else if ( self.userData.grabKey && self.userData.grabKey.activated === false && self.activated) {
            Entities.editEntity(self.paintStream, {
                animationSettings: stopSetting
            });
            self.activated = false;
        }
    }

    this.paint = function() {
        var forwardVec = Quat.getFront(self.properties.rotation);
        var upVec = Quat.getUp(self.properties.rotation);
        var position = Vec3.sum(self.properties.position, Vec3.multiply(forwardVec, TIP_OFFSET_Z));
        position = Vec3.sum(position, Vec3.multiply(upVec, TIP_OFFSET_Y))
        Entities.editEntity(self.paintStream, {
            position: position,
            emitVelocity: forwardVec
        });

        //Now check for an intersection with an entity

        var pickRay = {
            origin: self.properties.position
        }

    }

    this.preload = function(entityId) {
        this.activated = false;
        this.entityId = entityId;
        this.properties = Entities.getEntityProperties(self.entityId);
        this.getUserData();
        print("USER DATA " + JSON.stringify(this.userData))
        if (this.userData.activated) {
            this.activated = true;
        }
        this.initialize();
    }

    this.initialize = function() {
        var animationSettings = JSON.stringify({
            fps: 30,
            loop: true,
            firstFrame: 1,
            lastFrame: 10000,
            running: false
        });


        this.paintStream = Entities.addEntity({
            type: "ParticleEffect",
            animationSettings: animationSettings,
            position: this.properties.position,
            textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
            emitVelocity: ZERO_VEC,
            emitAcceleration: ZERO_VEC,
            velocitySpread: {
                x: .02,
                y: .02,
                z: 0.02
            },
            emitRate: 100,
            particleRadius: 0.01,
            color: {
                red: 170,
                green: 20,
                blue: 150
            },
            lifespan: 5,
        });

    }

    this.unload = function() {
        Script.update.disconnect(this.update);
        Entities.deleteEntity(this.paintStream);
    }
    Script.update.connect(this.update);
});