//  laneComputer.js
//  part of bowling
//
//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/11/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Loads a wand model and attaches the bubble wand behavior.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
        //bowling game scoring in JS by @hontas
        Script.include('https://raw.githubusercontent.com/hontas/bowling-game-kata/master/js/bowlingGame.js');

        var BOWLING_BALL_URL = '';
        var BOWLING_PIN_URL = '';
        var BALL_RACK_URL = '';
        var LANE_URL = '';

        BALL_START_POSITION = {
            x: 0,
            y: 0,
            x: 0
        };

        HEAD_PIN_POSITION = {
            x: 0,
            y: 0,
            x: 0
        };

        var laneMeasurements = {
            foulLineToFirstApproachDots: 3.6576,
            foulLineToSecondApproachDots: 4.572,
            betweenApproachDots: foulLineToSecondApproachDots - foulLineToFirstApproachDots,
            foulLineToHeadPin: 18.288,
            foulLineToArrows: 4.572,
            laneWidth: 1.0668,
            totalLength: 22.86,
            rowSpacing: 0.263965

        }

        var ballMeasurements = {
            radius: 0.10795,
            diameter: 21.59
        }

        var pinMeasurements = {
            height: 0.381,
            width: 0.11938,
            betweenPins: 0.3048,
            halfBetween: 0.1524
        }

        LaneComputer = function() {
            var _t = this;
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
                        x: laneMeasurements.totalLength,
                        y: 1,
                        z: laneMeasurements.laneWidth
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
                var a = pinMeasurements.halfBetween;
                var b = laneMeasurements.betweenPins;

                var x = HEAD_PIN_POSITION.x;
                var z = HEAD_PIN_POSITION.z;

                var pinPositions = [];
                var pinPositions[0] = [x, z];
                var pinPositions[1] = [x - a, z + b];
                var pinPositions[2] = [x + a, z + b];
                var pinPositions[3] = [x - (2 * a), z + (2 * b)];
                var pinPositions[4] = [x, z + (2 * b)];
                var pinPositions[5] = [x + (2 * a), z + (2 * b)];
                var pinPositions[6] = [x - (3 * a), z + (3 * b)];
                var pinPositions[7] = [x - a, z + (3 * b)];
                var pinPositions[8] = [x + a, z + (3 * b)];
                var pinPositions[9] = [x + (3 * a), z - (3 * b)];

                for (var i = 0; i < 10; i++) {
                    var pinPosition = {
                        x: pinPositions[i][0],
                        y: 0,
                        z: pinPositions[i][1]
                    }
                    Entities.editEntity(this.pins[i], {
                        position: pinPosition
                    })

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
            }
            spawnBowlingBallRack: function() {
                Entities.addEntity {
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

                }
            },
            spawnBowlingBall: function() {
                var ballProperties = {
                    type: 'Model',
                    modelURL: BOWLING_PIN_URL,
                    dimensions: {
                        x: ballMeasurements.diameter,
                        y: ballMeasurements.diameter,
                        z: ballMeasurements.diameter,
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
                ROLL_DETECTOR_LOCATION
                Entities.addEntity {
                    type: 'Box',
                    visible: false,
                    dimensions: {
                        x: 10,
                        y: 10,
                        z: 10
                    }
                }
            }

            function Pin() {

            }

            Pin.prototype = {
                type: 'Model',
                modelURL: BOWLING_PIN_URL,
                dimensions: {
                    x: pinMeasurements.width,
                    y: pinMeasurements.height,
                    z: pinMeasurements.width
                }
            }

            return new LaneComputer;

        })

    // would be sweet:
    // tweening the pin reset
    // multiple players per game
    // lane shaders