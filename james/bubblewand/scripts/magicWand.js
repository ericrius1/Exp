(function() {

    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

    var bubbleModel = "http://hifi-public.s3.amazonaws.com/james/bubblewand/models/bubble/bubble.fbx";
    var bubbleScript = 'http://localhost:8080/scripts/bubble.js?' + randInt(1, 10000);

    var _t = this;
    _t.bubbles = [];
    _t.bubbleSize = 0;
    var TOTAL_NUMBER_OF_BUBBLES = 4;

    var BUBBLE_GRAVITY = {
        x: 0,
        y: -0.05,
        z: 0
    }


    var bubbleLocked = false;
    var properties;
    this.preload = function(entityID) {
        _t.entityID = entityID
        properties = Entities.getEntityProperties(entityID);
        _t.fillBubbles();
        _t.setWandTipPosition();
    }

    var nonCollidingBubble;

    this.addNonCollidingBubbleToEndOfWand = function() {
        nonCollidingBubble = Entities.addEntity({
            type: 'Model',
            modelURL: bubbleModel,
            position: wandTipPosition,
            dimensions: {
                x: 0.01,
                y: 0.01,
                z: 0.01
            },
            collisionsWillMove: false,
            ignoreForCollisions: true,
            collisionSoundURL: "",
            shapeType: "sphere",
            script: bubbleScript,
        });
    }

    this.updateNonCollidingBubblePosition = function() {
        Entities.editEntity(nonCollidingBubble, {
            position: _t.wandTipPosition
        })
    }


    this.setWandTipPosition = function() {
        var wandPosition = properties.position;
        var upVector = Quat.getUp(properties.rotation);
        var frontVector = Quat.getFront(properties.rotation);
        var upOffset = Vec3.multiply(upVector, 0.4);
        var wandTipPosition = Vec3.sum(wandPosition, upOffset);
        _t.wandTipPosition = wandTipPosition;
    }

    this.updateWandTipPosition = function() {
        _t.lastWandTipPosition = _t.wandTipPosition;
        properties = Entities.getEntityProperties(_t.entityID);
        var wandPosition = properties.position;
        var upVector = Quat.getUp(properties.rotation);
        var frontVector = Quat.getFront(properties.rotation);
        var upOffset = Vec3.multiply(upVector, 0.4);
        var wandTipPosition = Vec3.sum(wandPosition, upOffset);
        _t.wandTipPosition = wandTipPosition;
        _t.velocity = Vec3.subtract(wandTipPosition, _t.lastWandTipPosition)
        _t.velocityStrength = Vec3.length(_t.velocity);
        // print('_t.velocityStrength ---'+_t.velocityStrength)

        if (bubbleLocked) {
            print('bubbleLocked')
            return
        } else {
            if (_t.velocityStrength > 0.01) {
                _t.bubbleSize += 5
            } else {
                if (_t.bubbleSize > 0) {
                    _t.bubbleSize--
                }

            }

            if (_t.bubbleSize > 50) {
                bubbleLocked = true;
                _t.moveBigBubbleToPosition(_t.wandTipPosition)
                Script.setTimeout(_t.addBubbleToGravitySystem, 1000);
            }


            print('bubblesize ::: ' + _t.bubbleSize)
        }


    }

    this.moveBigBubbleToPosition = function(position){
        Entities.editEntity(_t.bubbles[0],{
            dimensions:{
                x:1,
                y:1,
                z:1
            }
        });
    }

    this.addBubbleToGravitySystem=function(){
        print('adding bubble to gravity system')
        Entites.editEntity(_t.bubbles[0],{
            collisionsWillMove:true,
            ignoreForCollisions:false
        });

    }



    this.fillBubbles = function() {

        for (var i = 0; i < TOTAL_NUMBER_OF_BUBBLES; i++) {
            var bubble = Entities.addEntity({
                type: 'Model',
                modelURL: bubbleModel,
                position: wandTipPosition,
                dimensions: {
                    x: 0.01,
                    y: 0.01,
                    z: 0.01
                },
                collisionsWillMove: false,
                ignoreForCollisions: true,
                gravity: BUBBLE_GRAVITY,
                collisionSoundURL: POP_SOUNDS[randInt(0, 4)],
                shapeType: "sphere",
                script: bubbleScript,
            });
              _t.bubbles.push(bubble);
        }
      
    }

    this.unload = function() {
        while (_t.bubbles.length > 0) {
            Entities.deleteEntity(_t.bubbles.pop());
        }
        Script.update.disconnect(_t.updateWandTipPosition);

    }

    Script.update.connect(_t.updateWandTipPosition);

})