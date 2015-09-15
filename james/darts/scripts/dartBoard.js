//  dartBoard.js
//  part of darts
//
//  Script Type: Entity Spawner
//  Created by James B. Pollack @imgntn -- 09/14/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Throw darts at it
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // Script.include("../../utilities.js");
    // Script.include("../../libraries/utils.js");


    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

    var _t;

    DartBoard = function() {
        _t = this;
        print("Dart constructor ");
    };

    DartBoard.prototype = {
        properties: null,
        this.preload: function(entityID) {
            //  print('bubble preload')
            _t.entityID = entityID;
            properties = Entities.getEntityProperties(entityID);
            var data = {
                object_type: 'dartBoard'
            }
            setEntityCustomData('jbp_darts', entityID, data);
            // _t.loadShader(entityID);
            // Script.update.connect(_t.internalUpdate);
        },

        this.internalUpdate: function() {
            // we want the position at unload but for some reason it keeps getting set to 0,0,0 -- so i just exclude that location.  sorry origin bubbles.
            _t.properties = Entities.getEntityProperties(_t.entityID)

        },

        this.collisionWithEntity: function(myID, otherID, collision) {},

        this.unload: function(entityID) {
            Script.update.disconnect(this.internalUpdate);

        }
    }



    return new DartBoard();

})