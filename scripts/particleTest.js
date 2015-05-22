
(function () {
    var spawnPoint = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

    // constructor
    function TestBox() {
        this.entity = Entities.addEntity({ type: "Box",
                                           position: spawnPoint,
                                           dimensions: { x: 1, y: 1, z: 1 },
                                           color: { red: 100, green: 100, blue: 255 },
                                           gravity: { x: 0, y: 0, z: 0 },
                                           visible: true,
                                           locked: false,
                                           lifetime: 6000 });
        var self = this;
        this.timer = Script.setInterval(function () {
            var colorProp = { color: { red: Math.random() * 255,
                                       green: Math.random() * 255,
                                       blue: Math.random() * 255 } };
            Entities.editEntity(self.entity, colorProp);
        }, 1000);
    }

    TestBox.prototype.Destroy = function () {
        Script.clearInterval(this.timer);
        Entities.editEntity(this.entity, { locked: false });
        Entities.deleteEntity(this.entity);
    }

    // constructor
    function TestFx(color, emitDirection, emitRate, emitStrength, blinkRate) {

        this.entity = Entities.addEntity({ type: "ParticleEffect",
                                           animationSettings: "{\"firstFrame\":0,\"fps\":30,\"frameIndex\":0,\"hold\":false,\"lastFrame\":10000,\"loop\":true,\"running\":true,\"startAutomatically\":false}",
                                           position: spawnPoint,
                                           textures: "https://s3.amazonaws.com/hifi-public/cozza13/particle/orb_blue_glow.png",
                                           emitRate: emitRate,
                                           animationIsPlaying: 1,
                                           emitStrength: emitStrength,
                                           // emitDirection: emitDirection,
                                           color: color,
                                           visible: true,
                                           locked: false,
                                           startAutomatically: false
                                            });





    }

    TestFx.prototype.Destroy = function () {
        Entities.editEntity(this.entity, { locked: false });
        Entities.deleteEntity(this.entity);
    }

    var objs = [];
    function Init() {
        objs.push(new TestBox());
        objs.push(new TestFx({ red: 255, blue: 0, green: 0 },
                             { x: 0.5, y: 1.0, z: 0.0 },
                             10000, 30, 1));
        // objs.push(new TestFx({ red: 0, blue: 255, green: 0 },
        //                      { x: 0, y: 1, z: 0 },
        //                      1000, 5, 0.5));
        // objs.push(new TestFx({ red: 0, blue: 0, green: 255 },
        //                      { x: -0.5, y: 1, z: 0 },
        //                      100, 3, 1));
    }

    function ShutDown() {
        var i, len = objs.length;
        for (i = 0; i < len; i++) {
            objs[i].Destroy();
        }
        objs = [];
    }

    Init();
    Script.scriptEnding.connect(ShutDown);
})();


