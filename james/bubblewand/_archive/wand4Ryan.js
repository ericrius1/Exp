    print("started loading...");

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    (function() {
        print('START ENTITY LOAD')
        var console = {};
        console.log = function(p) {
            if (arguments.length > 1) {

                for (var i = 1; i < arguments.length; i++) {
                    print(arguments[i])
                }

            } else {
                print(p)
            }

        }


        var bubbleModel = "http://hifi-public.s3.amazonaws.com/james/bubblewand/models/bubble/bubble.fbx";
        var bubbleScript = 'http://hifi-public.s3.amazonaws.com/james/bubblewand/scripts/bubble.js?' + randInt(2, 5096);
        var popSound = SoundCache.getSound("http://hifi-public.s3.amazonaws.com/james/bubblewand/sounds/pop.wav");
        var wandModel = "http://hifi-public.s3.amazonaws.com/james/bubblewand/models/wand/wand.fbx";


        var BUBBLE_GRAVITY = {
            x: 0,
            y: -0.05,
            z: 0
        }

        var hands = {
            rightHand: {
                palm: 2,
                tip: 3
            },
            leftHand: {
                palm: 0,
                tip: 1
            }
        }

        var thisEntity = this;

        this.preload = function(entityID) {
            console.log('PRELOAD')
            this.entityID = entityID;
            this.properties = Entities.getEntityProperties(this.entityID);

        }



        this.unload = function(entityID) {
            Entities.editEntity(entityID, {
                name: ""
            });
            Script.update.disconnect(BubbleWand.update);
            MyAvatar.detachOne(wandModel)
            collectGarbage();
        };


        var BubbleWand = {
            bubbles: [],
            currentBubble: null,
            update: function() {
                BubbleWand.updateControllerState();
            },
            updateControllerState: function() {
                var avatarID = JSON.stringify(MyAvatar.sessionUUID);
                var UUID = Entities.getEntityProperties(thisEntity.entityID).name;
      
         

                    var _t = BubbleWand;
                    _t.palmPosition = Controller.getSpatialControlPosition(hands.leftHand.palm);
                    _t.tipPosition = Controller.getSpatialControlPosition(hands.leftHand.tip);
                    _t.palmNormal = Controller.getSpatialControlNormal(hands.leftHand.palm);

                    var velocity = Controller.getSpatialControlVelocity(hands.leftHand.tip);

                    var velocityStrength = Vec3.length(velocity)
                    var angularVelocity = Controller.getSpatialControlRawAngularVelocity(hands.leftHand.tip);
                    var dimensions = Entities.getEntityProperties(_t.currentBubble).dimensions;
                    if (velocityStrength > 1) {
                        var bubbleSize = randInt(1, 5)
                        bubbleSize = bubbleSize / 10;
                        if (dimensions.x > bubbleSize) {
                            console.log('RELEASE BUBBLE')
                            var lifetime = randInt(3, 8);
                            Script.setTimeout(function() {
                                _t.burstBubbleSound(_t.currentBubble)
                            }, lifetime * 1000)
                            Entities.editEntity(_t.currentBubble, {
                                velocity: Vec3.normalize(velocity),
                                angularVelocity: Controller.getSpatialControlRawAngularVelocity(hands.leftHand.tip),
                                lifetime: lifetime
                            });

                            _t.spawnBubble();
                            return
                        } else {
                            dimensions.x += 0.015 * velocityStrength;
                            dimensions.y += 0.015 * velocityStrength;
                            dimensions.z += 0.015 * velocityStrength;

                        }
                    } else {
                        if (dimensions.x >= 0.02) {
                            dimensions.x -= 0.001;
                            dimensions.y -= 0.001;
                            dimensions.z -= 0.001;
                        }

                    }

                    Entities.editEntity(_t.currentBubble, {
                        position: Controller.getSpatialControlPosition(hands.leftHand.tip),
                        dimensions: dimensions
                    });
           
            },
            burstBubbleSound: function(bubble) {
                var position = Entities.getEntityProperties(bubble).position;
                var orientation = Entities.getEntityProperties(bubble).oreientation;
                console.log('bubble position at pop: ' + JSON.stringify(position));
                var audioOptions = {
                    volume: 0.5,
                    position: position,
                    orientation: orientation
                }

               Audio.playSound(popSound, audioOptions);
                // var i = BubbleWand.bubbles.indexOf(bubble);
                // if(i != -1) {
                //     BubbleWand.bubbles.splice(i, 1);
                // }
                // console.log('BUBBLES LENGTH',BubbleWand.bubbles.length)
            },
            spawnBubble: function() {
                console.log('spawning bubble')
                var _t = this;
                _t.currentBubble = Entities.addEntity({
                    type: 'Model',
                    modelURL: bubbleModel,
                    position: Controller.getSpatialControlPosition(hands.leftHand.tip),
                    dimensions: {
                        x: 0.01,
                        y: 0.01,
                        z: 0.01
                    },
                    collisionsWillMove: true,
                    gravity: BUBBLE_GRAVITY,
                    collisionSoundURL: popSound,
                    shapeType: "sphere",
                    script: bubbleScript,
                });
               _t.bubbles.push(_t.currentBubble)
            },
            spawnGustDetector: function() {

            },
            init: function() {
                var _t = this;
                _t.spawnBubble();
                Script.update.connect(BubbleWand.update);
            }
        }

        function collectGarbage() {
            console.log('COLLECTING GARBAGE!!!')
            while (BubbleWand.bubbles.length > 0) {
                Entities.deleteEntity(BubbleWand.bubbles.pop());
            }
        }


        //spawnGustDetector();
        BubbleWand.init();



    })