(function() {


    this.userData = {};

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
            if (!this.activated) {
                Entities.editEntity(self.paintStream, {
                    animationSettings: startSetting
                });
                this.activated = true;
            }
            //Move emitter to where entity is always when its activated
            self.paint();
        } else if (self.userData.activated === false && this.activated) {
            Entities.editEntity(self.paintStream, {
                animationSettings: stopSetting
            });
            this.activated = false;
        }
    }

    this.paint = function() {
        var forwardVec = Quat.getFront(self.properties.rotation);
        print("forward vec "+ JSON.stringify(forwardVec))
        Entities.editEntity(self.paintStream, {
            position: self.properties.position,
            emitVelocity: forwardVec
        });

    }

    this.preload = function(entityId) {
        this.entityId = entityId;
        this.properties = Entities.getEntityProperties(self.entityId);
        this.getUserData();
        if (!this.userData.activated) {
            this.activated = false;
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
        print("GOODBYE")
        Script.update.disconnect(this.update);
    }
    Script.update.connect(this.update);
});