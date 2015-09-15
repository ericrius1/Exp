//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/11/2015
//  Copyright 2015 High Fidelity, Inc.

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {


    RollDetector = function() {
        _t = this;
        print("RollDetector
            constructor ");
        };

        var properties;

        this.preload = function(entityID) {
            //  print('bubble preload')
            _t.entityID = entityID;
            properties = Entities.getEntityProperties(entityID);
            // _t.loadShader(entityID);
            Script.update.connect(_t.internalUpdate);
        };

        this.internalUpdate = function() {
            print('internalUpdate yo')
        }

        this.collisionWithEntity = function(myID, otherID, collision) {
            //if i am hit by a bowling ball
            //write something to my user data about being done, check that from the 
        };

        this.unload = function(entityID) {
            Script.update.disconnect(this.internalUpdate);

        };

        return new RollDetector
    }


})