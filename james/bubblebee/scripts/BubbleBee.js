//  bubbleBee.js
//
//  this script spawns a bee that flies around making bubbles, using the same 'wand.js' script as the bubblewand
//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/14/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  The lane computer handles the objects, scripts, and scoring for a single-player game of bowling.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html



(function() {
    Script.include('https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js');

    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");


    //this is how the animations get hooked in
    function updateTweens() {
        print('updating tweens')
        TWEEN.update();
    }


    //how long it takes the bee to fly to each new target
    var ANIMATION_DURATION = 100;
    var START_LOCATION = {
        x: 0,
        y: 0,
        z: 0
    }

    //the bee's range
    var LOCATION_RANGE = [0, 100]
    BubbleBee = function() {
        var _t = this;
        print("BubbleBee constructor");

    };

    var BUZZING_SOUND_URL = 'someURL';
    var BUBBLEWAND_SCRIPT_URL = 'http://hifi-public.s3.amazonaws.com/james/bubblewand/scripts/wand.js?' + randInt(0, 10000);
    var BEE_MODEL_URL = 'http://hifi-public.s3.amazonaws.com/james/bubblebee/models/bee.fbx?' + randInt(0, 10000);

    var ZERO_VECTOR = {
        x: 0,
        y: 0,
        z: 0
    }

    var easingArray = [
        'Quadratic.In',
        'Quadratic.Out',
        'Quadratic.InOut',
        'Cubic.In',
        'Cubic.Out',
        'Cubic.InOut',
        'Quartic.In',
        'Quartic.Out',
        'Quartic.InOut',
        'Quintic.In',
        'Quintic.Out',
        'Quintic.InOut',
        'Sinusoidal.In',
        'Sinusoidal.Out',
        'Sinusoidal.InOut',
        'Exponential.In',
        'Exponential.Out',
        'Exponential.InOut',
        'Circular.In',
        'Circular.Out',
        'Circular.InOut',
        'Elastic.In',
        'Elastic.Out',
        'Elastic.InOut',
        'Back.In',
        'Back.Out',
        'Back.InOut',
        'Bounce.In',
        'Bounce.Out',
        'Bounce.InOut',
    ]

    function selectEasingMethod() {
        return easingArray[rantInt(0, easingArray.length - 1)];
    }

    BubbleBee.prototype = {
        currentBee: null,
        buzzSound: null,
        preload: function(id) {
            print('TWEEN?'+TWEEN)
            this.entityID = id;
            this.initialProperties = Entities.getEntityProperties(id);
            this.init();
        },
        unload: function(id) {
            this.beeEnding();
            Script.deleteEntity(this.currentBee)
            Script.update.disconnect(this.internalUpdate);
            Script.update.connect(this.updateTweens);
        },
        internalUpdate: function() {
            print('internal update!')
            this.properties = Entities.getEntityProperties(this.EntityID);
       

        },
        startBuzzSound: function() {
            var audioOptions = {
                volume: 0.5,
                position: position,
                loop: true
            }

            this.buzzSound = Audio.playSound(BUZZING_SOUND_URL, audioOptions);
        },
        updateBuzzSoundPosition: function(position) {
            var audioOptions = {
                position: position
            }

            this.buzzSound.options = audioOptions;

        },
        generateNewLocation: function() {
            var target = {
                x: this.initialProperties.position.x + randInt(LOCATION_RANGE[0], LOCATION_RANGE[1]),
                y: this.initialProperties.position.y + randInt(LOCATION_RANGE[0], LOCATION_RANGE[1]),
                z: this.initialProperties.position.z + randInt(LOCATION_RANGE[0], LOCATION_RANGE[1]),
            }
            print('GENERATING NEW TARGET: ' + JSON.stringify(target));

            return target
        },
        spawnBee: function() {
            var _t = this;
            var beeProperties = {
                type: 'Sphere',
                position: _t.initialProperties.position,
                dimensions: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                color: {
                    red: 100,
                    green: 88,
                    blue: 15
                },
                scriptUrl: BUBBLEWAND_SCRIPT_URL,
                collisionsWillMove: false,
                ignoreForCollisions: true
            }
            var bee = Entities.addEntity(beeProperties);
            this.currentBee = bee;
        },
        animateBee: function(begin, target) {
            print('animating bee from ' + JSON.stringify(begin)+"to "+JSON.stringify(target));
            var tweenHead = new TWEEN.Tween(begin).to(target, ANIMATION_DURATION);
            // tweenHead.easing(TWEEN.Easing.Elastic.InOut)
            function update() {
                Entities.editEntity(entityId, {
                    dimensions: {
                        x: begin.x,
                        y: begin.y,
                        z: begin.z
                    }
                })
                _t.updateBuzzSoundPosition({
                    x: begin.x,
                    y: begin.y,
                    z: begin.z
                })
            }

            tweenHead.onUpdate(function() {
                update()

            })

            tweenHead.onComplete(function() {
                _t.lastPosition = target;
                var newTarget = _t.generateNewLocation();
                _t.animateBee(_t.lastPosition, newTarget)
            })

            tweenHead.start();

        },

        init: function() {
            this.spawnBee();
            var initialTarget = this.generateNewLocation();
            Script.update.connect(this.internalUpdate);
            Script.update.connect(updateTweens);
            this.animateBee(START_LOCATION, initialTarget);

        }

    }

    return new BubbleBee();

})