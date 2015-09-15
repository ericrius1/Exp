//  drinkWater.js
//  part of drinkWater
//
//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/14/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  A glass of water that you can put near your avatar's mouth to drink it.  
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // Script.include("../../utilities.js");
    // Script.include("../../libraries/utils.js");
    'use strict';

    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

    var WATER_SCRIPT = "http://localhost:8080/scripts/water.js"

    var WATER_SHADER_URL = "http://localhost:8080/shaders/water.fs"
    var overlays = false;

    //debug overlays for hand position to detect when wand is near avatar head
    var TARGET_SIZE = 0.5;
    var TARGET_COLOR = {
        red: 128,
        green: 128,
        blue: 128
    };
    var TARGET_COLOR_HIT = {
        red: 0,
        green: 255,
        blue: 0
    };

    var HAND_SIZE = 0.25;

    if (overlays) {


        var leftCubePosition = MyAvatar.getLeftPalmPosition();
        var rightCubePosition = MyAvatar.getRightPalmPosition();

        var leftHand = Overlays.addOverlay("cube", {
            position: leftCubePosition,
            size: HAND_SIZE,
            color: {
                red: 0,
                green: 0,
                blue: 255
            },
            alpha: 1,
            solid: false
        });


        var rightHand = Overlays.addOverlay("cube", {
            position: rightCubePosition,
            size: HAND_SIZE,
            color: {
                red: 255,
                green: 0,
                blue: 0
            },
            alpha: 1,
            solid: false
        });

        var gustZoneOverlay = Overlays.addOverlay("cube", {
            position: getGustDetectorPosition(),
            size: TARGET_SIZE,
            color: TARGET_COLOR,
            alpha: 1,
            solid: false
        });
    }



    var _t;

    Glass = function() {
        _t = this;
        print("Glass constructor ");
    }


    Glass.prototype = {
        properties:null,
        preload: function(entityID) {
            //  print('bubble preload')
            _t.entityID = entityID;
            _t.properties = Entities.getEntityProperties(entityID);
            Script.update.connect(_t.internalUpdate);
        },
        createInnerContainer: function() {

            //this is the water
            this.innerContainer = Entities.addEntity({
                type: 'Box',
                dimensions: {
                    x: 0.08,
                    y: 0.1,
                    z: 0.08
                },
                collisionsWillMove: false,
            })

            _t.loadWaterShader();
        },
        createOuterContainer: function() {
            //this is the glass
            this.outerContainer = Entities.addEntity({
                modelURL: glassModel,
                dimensions: {
                    x: 0.1,
                    y: 0.1,
                    z: 0.1
                },
                collisionsWillMove: true,
            })
        },
        removeLiquid: function() {
            if (_t.properties.dimensions.y === 0) {
                //glass is empty
                return
            }
            var newY = _t.properties.dimensions.y - 0.01;

            if (newY)
                Entities.editEntity(_t.innerContainer {
                    dimensions {
                        x: _t.properties.dimensions.x,
                        y: newY,
                        z: _t.properties.dimensions.z
                    }
                })
        },
        addLiquid: function() {
            Entities.editEntity(_t.innerContainer {

            })
        },
        loadWaterShader: function() {
            setEntityUserData(_t.innerContainer, {
                "ProceduralEntity": {
                    "shaderUrl": WATER_SHADER_URL
                }
            })
        },
        update: function(entityID) {
            _t.properties = Entities.getEntityProperties(entityID);
            var hitTargetWithGlass = findSphereSphereHit(_t.glassPosition, HAND_SIZE / 2, getMouthDetectorPosition(), TARGET_SIZE / 2)



            if (hitTargetWithGlass) {
                _t.mouthMode = true;
                _t.removeLiquid();
            } else {
                _t.mouthMode = false;
            }
        },
        collisionWithEntity: function(myID, otherID, collision) {

        },
        unload: function(entityID) {
            Script.update.disconnect(this.update);
        },

    }

    return new Glass();
})