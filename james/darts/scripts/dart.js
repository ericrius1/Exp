//  dart.js
//  part of darts
//
//  Script Type: Entity Spawner
//  Created by James B. Pollack @imgntn -- 09/14/2015
//  Copyright 2015 High Fidelity, Inc.
//
// Handles logic for dart when it hits the board
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // Script.include("../../utilities.js");
    // Script.include("../../libraries/utils.js");


    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

    var _t;

    Dart = function() {
        _t = this;
        print("Dart constructor ");
    };

    Dart.prototype = {
        properties: null,
        this.preload: function(entityID) {
            //  print('bubble preload')
            _t.entityID = entityID;
            properties = Entities.getEntityProperties(entityID);
            var data = {
                object_type: 'dart'
            }
            setEntityCustomData('jbp_darts', entityID, data);
            // _t.loadShader(entityID);
            // Script.update.connect(_t.internalUpdate);
        },

        this.internalUpdate: function() {
            // we want the position at unload but for some reason it keeps getting set to 0,0,0 -- so i just exclude that location.  sorry origin bubbles.
            _t.properties = Entities.getEntityProperties(_t.entityID)

        },



        this.correctFlightTrajectory:function(dt){

            var vectorT;
            var vectorV;


            //vectorV = velocity

            var zAxis = {
                x:0,
                y:0,
                z:1
            }

            var normalT=Vec3.normalize(vectorT);
            var normalV=Vec3.normalize(vectorV);

            var dotTV = Vec3.dot(normalT,normalV);

            var alpha = Math.acos(dotTV);
            var axis = Vec3.cross(normalT,normalV);

            var angleAxis = Quat.angleAxis(alpha,axis);
        },

        // this.setAngularVelocity: function() {

        //     Entities.editEntity(_t.entityID)
        //     angularVelocity: Controller.getSpatialControlRawAngularVelocity(hands.leftHand.tip),

        // }

            this.collisionWithEntity: function(myID, otherID, collision) {
            var objectType = getEntityCustomData('jbp_object_type', otherID);
            if (objectType === 'dartBoard') {
                print('a dart hit the board');
                var contactPoint = collision.contactPoint
                Entities.editEntity(myID, {
                        collisionsWillMove: false,
                        velocity: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        position: collision.contactPoint
                    })
                    //have the dart stick
            } else {
                print('hit something other than the board')
                return
            }

        },

        this.unload: function(entityID) {
            //Script.update.disconnect(this.internalUpdate);

        }
    }



    return new Dart();

})