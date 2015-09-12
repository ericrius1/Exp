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
			firstApproachDotsToSecondApproachDots: foulLineToSecondApproachDots - foulLineToFirstApproachDots,
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
			currentBee: null,
			buzzSound: null,
			game: null,
			preload: function(id) {
				this.entityID = id;
				this.initialProperties = Entities.getEntityProperties(id);
				this.init();
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
					}
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

				var pin1 = [x, z];
				var pin2 = [x - a, z + b];
				var pin3 = [x + a, z + b];
				var pin4 = [x - (2 * a), z + (2 * b)];
				var pin5 = [x, z + (2 * b)];
				var pin6 = [x + (2 * a), z + (2 * b)];
				var pin7 = [x - (3 * a), z + (3 * b)];
				var pin8 = [x - a, z + (3 * b)];
				var pin9 = [x + a, z + (3 * b)];
				var pin10 = [x + (3 * a), z - (3 * b)];

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
			spawnBowlingBallRack: function() {

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
				}
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
			handleEndOfRoll: function() {
				var pins = this.countKnockedOverPins();
				this.game.roll(pins);
			},
			handleGoingPastFoulLine: function() {

			},
			startBowlingGame: function() {
				this.game = new BowlingGame();
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