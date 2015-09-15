//  laneComputer.js
//  part of bowling
//
//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/11/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  The lane computer handles the objects, scripts, and scoring for a single-player game of bowling.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    //bowling game scoring in JS by @hontas
    Script.include('https://raw.githubusercontent.com/hontas/bowling-game-kata/master/js/bowlingGame.js');
    var _t;

    var BOWLING_BALL_URL = '';
    var BOWLING_PIN_URL = '';
    var BALL_RACK_URL = '';
    var LANE_URL = '';

    var BALL_START_POSITION = {
        x: 0,
        y: 1,
        z: 0
    };

    var HEAD_PIN_POSITION = {
        x: 0,
        y: 0,
        z: 0
    };

    var ROLL_DETECTOR_SCRIPT = 'http://localhost:8080/scripts/rollDetector.js?'+randInt(1,10000);

    var ROLL_DETECTOR_LOCATION = {
            x: 0,
            y: 0,
            x: 0
        } //back of lane 

    var LANE_MEASUREMENTS = {
        foulLineToFirstApproachDots: 3.6576,
        foulLineToSecondApproachDots: 4.572,
        betweenApproachDots: this.foulLineToSecondApproachDots - this.foulLineToFirstApproachDots,
        foulLineToHeadPin: 18.288,
        foulLineToArrows: 4.572,
        laneWidth: 1.0668,
        totalLength: 22.86,
        rowSpacing: 0.263965

    }

    var BALL_MEASURE_MENTS = {
        radius: 0.10795,
        diameter: 21.59
    }

    var PIN_MEASUREMENTS = {
        height: 0.381,
        width: 0.11938,
        betweenPins: 0.3048,
        halfBetween: 0.1524
    }

    LaneComputer = function() {
        _t = this;
        print("LaneComputer constructor");
    };

    LaneComputer.prototype = {
        ball: null,
        pins: [],
        ballRack: null,
        lane: null,
        game: null,
        rollDetector: null,
        preload: function(id) {
            this.entityID = id;
            this.initialProperties = Entities.getEntityProperties(id);
            this.init();
        },
        unload: function() {
            while (this.pins.length > 0) {
                Entities.deleteEntity(this.pins.pop());
            }
            Entities.deleteEntity(this.ball)
            Entities.deleteEntity(this.pins)
            Entities.deleteEntity(this.ballRack)
            Entities.deleteEntity(this.lane)
            Entities.deleteEntity(this.game)
            Entities.deleteEntity(this.rollDetector)

        },
        spawnLane: function() {
            var laneProperties = {
                name: 'Bowling Lane',
                type: 'Box',
                dimensions: {
                    x: LANE_MEASUREMENTS.totalLength,
                    y: 1,
                    z: LANE_MEASUREMENTS.laneWidth
                },
                color: {
                    red: 90,
                    green: 110,
                    blue: 205
                },
                collisionWillMove: false,
                position: LANE_POSITON
            }

            var lane = Entities.addEntity(laneProperties);
            this.lane = lane;
            return
        },
        setPins: function() {
            var a = PIN_MEASUREMENTS.halfBetween;
            var b = PIN_MEASUREMENTS.betweenPins;

            var x = HEAD_PIN_POSITION.x;
            var z = HEAD_PIN_POSITION.z;
             print('ab' + a + b)
            print('xz' + x + z)
                var pinPositions=[];
                 pinPositions[0] = [x, z];
                 pinPositions[1] = [x - a, z + b];
                 pinPositions[2] = [x + a, z + b];
                 pinPositions[3] = [x - (2 * a), z + (2 * b)];
                 pinPositions[4] = [x, z + (2 * b)];
                 pinPositions[5] = [x + (2 * a), z + (2 * b)];
                 pinPositions[6] = [x - (3 * a), z + (3 * b)];
                 pinPositions[7] = [x - a, z + (3 * b)];
                 pinPositions[8] = [x + a, z + (3 * b)];
                 pinPositions[9] = [x - (3 * a), z - (3 * b)];

            for (var i = 0; i < 10; i++) {
                var pinPosition = {
                    x: pinPositions[i][0],
                    y: 0,
                    z: pinPositions[i][1]
                }

                print('PIN POSITION ' + i + " :: " + JSON.stringify(pinPosition))
                this.pins[i].position=pinPosition;
                Entities.addEntity(this.pins[i]);

            }

            // var pin1 = 0,0];
            // var pin2 = [-a, b];
            // var pin3 = [a, b];
            // var pin4 = [-2 * a, 2 * b];
            // var pin5 = [0, 2 * b];
            // var pin6 = [2 * a, 2 * b];
            // var pin7 = [-3 * a, 3 * b];
            // var pin8 = [-a, 3 * b];
            // var pin9 = [a, 3 * b];
            // var pin10 = [3 * a, -3 * b];

        },
        spawnPins: function() {
            for (var i = 0; i < 10; i++) {
                this.pins.push(new Pin());
            }
        },
        spawnBowlingBallRack: function() {
            Entities.addEntity({
                type: 'Box',
                dimensions: {
                    x: 5,
                    y: 5,
                    z: 5
                },
                color: {
                    red: 255,
                    green: 0,
                    blue: 255
                }

            })
        },
        spawnBowlingBall: function() {
            var ballProperties = {
                type:'Sphere',
                color:{
                    red:255,
                    green:0
                    blue:0
                },
                type: 'Model',
                modelURL: BOWLING_PIN_URL,
                dimensions: {
                    x: BALL_MEASUREMENTS.diameter,
                    y: BALL_MEASUREMENTS.diameter,
                    z: BALL_MEASUREMENTS.diameter,
                },
                position: BALL_START_POSITION
            };
            Entities.addEntity(ballProperties);
        },
        countKnockedOverPins: function() {
            var knockedOver = 0;

            for (var i = 0; i < this.pins.length; i++) {
                var properties = Entities.getEntityProperties(this.pins[i]);
                var orientation = properties.orientation
                if (orientation !== VERTICAL_ORIENTATION) {
                    knockedOver++;
                }
            }
            return knockedOver
        },
        handleGutterBall: function() {
            this.game.roll(0);
        },
        handleEndOfRoll: function() {
            var pins = this.countKnockedOverPins();
            this.game.roll(pins);
        },
        handleGoingPastFoulLine: function() {

        },
        startBowlingGame: function() {
            this.game = new BowlingGame();
        },
        rollDetectorLocation: function() {

            Entities.addEntity({
                type: 'Box',
                visible: false,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                position:ROLL_DETECTOR_LOCATION,
                scriptURL: ROLL_DETECTOR_SCRIPT
            })
        },
        init: function() {
            this.spawnPins();
            this.setPins();
            this.spawnBowlingBall();
        },

    }

    function Pin() {

    }

    Pin.prototype = {
        type:'Box',
        dimensions:{x:0.1,y:1,z:0.1},
        color:{red:255,green:0,blue:255}
        // type: 'Model',
        // modelURL: BOWLING_PIN_URL,
        // dimensions: {
        //     x: PIN_MEASUREMENTS.width,
        //     y: PIN_MEASUREMENTS.height,
        //     z: PIN_MEASUREMENTS.width
        // }
    }

    return new LaneComputer();

})

// would be sweet:
// tweening the pin reset
// multiple players per game
// lane shaders