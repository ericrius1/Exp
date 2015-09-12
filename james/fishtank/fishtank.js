// based on https://www.macs.hw.ac.uk/~dwcorne/Teaching/Boids%20Pseudocode.htm

(function() {
	Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
	Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

	var FISH_MODEL = '';

	var updateFishInterval;


	// -- Rule 1: steer towards average position
	// -- Rule 2: collision avoidance
	// -- Rule 3: average velocity
	// -- Rule 4: avoid walls

	Fish = function(entityID) {
		print('fish constructor')
		this.entityID = entityID;
		this.properties = Entities.getEntityProperties(entityID);

	}

	TOWARD_FISH_WEIGHT = 100;
	rule1 = function(fish) {

		//@fish - Fish

		//toward other fish


		var percievedCenter = {
			x: 0,
			y: 0,
			z: 0
		};
		//for fish not me, add their position to the percieved center
		for (var i = 0; i < _t.fishInTank.length; i++) {
			if (_t.fishInTank[i].entityID !== fish.entityID) {
				percievedCenter = Vec3.sum(percievedCenter, _t.fishInTank[i].properties.position);
			}
		}

		percievedCenter = Vec3.multiply(percievedCenter, (1 / (_t.fishInTank.length - 1)));

		var velocity1 = Vec3.subtract(percievedCenter, fish.properties.position);

		velocity1 = Vec3.multiply(velocity1, 1 / TOWARD_FISH_WEIGHT);

		print('rule1: ' + JSON.stringify(velocity1))
		return velocity1;
	}

	var STAY_AWAY_DISTANCE = 2;


	rule2 = function(fish) {


		//@fish - Fish

		//stay away from other fish
		var velocity2 = {
			x: 0,
			y: 0,
			z: 0
		};

		for (var i = 0; i < _t.fishInTank.length; i++) {
			if (_t.fishInTank[i].entityID !== fish.entityID) {
				var positionDifference = Vec3.subtract(_t.fishInTank[i].properties.position, fish.properties.position);
				var distance = Vec3.length(positionDifference);
				if (distance < STAY_AWAY_DISTANCE) {
					velocity2 = Vec3.subtract(velocity2, positionDifference);
				}
			}
		}

		print('rule2: ' + JSON.stringify(velocity2))
		return velocity2;

	}

	var VELOCITY_PORTION = 8

	rule3 = function(fish) {

		//@fish - Fish

		//match nearby fish velocity

		var percievedVelocity = {
			x: 0,
			y: 0,
			z: 0
		};
		//for fish not me, add their position to the percieved center
		for (var i = 0; i < _t.fishInTank.length; i++) {
			if (_t.fishInTank[i].entityID !== fish.entityID) {
				percievedVelocity = Vec3.sum(percievedVelocity, _t.fishInTank[i].properties.velocity);
			}
		}

		percievedVelocity = Vec3.multiply(percievedVelocity, (1 / (_t.fishInTank.length - 1)));

		var velocity3 = Vec3.subtract(percievedVelocity, fish.properties.velocity);
		velocity3 = Vec3.multiply(velocity3, (1 / VELOCITY_PORTION))

		print('rule3: ' + JSON.stringify(velocity3))

		return velocity3;
	}

	strong_wind = function(fish) {

		//@fish - Fish

		var windVector = {
			x: 0,
			y: 2,
			z: 0,
		}

		return windVector
	}

	goToPlace = function(fish, place) {

		//@fish - Fish
		//@place - vec3
		var placeVector = Vec3.subtract(place, fish.properties.position);
		var towardPlace = Vec3.multiply(placeVector, (1 / 100))
		return towardPlace
	}


	FishTank = function() {
		_t = this;
		Script.setTimeout(function() {
			_t.init();
		}, 1000)
		print("FishTank constructor");
	};


	var NUMBER_OF_FISH = 10;
	var VELOCITY_LIMIT = 10;

	FishTank.prototype = {
		fishInTank: [],
		preload: function(entityID) {
			print('tank preload');
			_t.properties = Entities.getEntityProperties(entityID)
		},
		unload: function(entityID) {
			while (_t.fishInTank.length > 0) {
				Entities.deleteEntity(_t.fishInTank.pop().entityID)
			}
			//Script.clearInterval(updateFishInterval);
			Script.update.disconnect(_t.updateFish);
			print('tank unload');
		},
		makeAFish: function() {
			print('make a fish')

			var entityID = Entities.addEntity({
				type: 'Sphere',
				color: {
					red: randInt(0, 255),
					green: randInt(0, 255),
					blue: randInt(0, 255),
				},
				position: {
					x: _t.properties.position.x + randInt(0, 10),
					y: _t.properties.position.y + randInt(0, 10),
					z: _t.properties.position.z + randInt(0, 10),
				},
				dimensions: {
					x: 1,
					y: 1,
					z: 1,
				},
				collisionsWillMove: false,
				ignoreForCollisions: true,
			});

			return new Fish(entityID);
		},
		addFishToTank: function() {

			for (var i = 0; i < NUMBER_OF_FISH; i++) {
				print('add fish to tank::' + i);
				var thisFish = _t.makeAFish();
				_t.fishInTank.push(thisFish)
			}

		},
		updateFish: function(deltaTime) {
			print('update fish')
				//update the properties on each fish
				// for (var i = 0; i < _t.fishInTank.length; i++) {
				// 	var fishID = _t.fishInTank[i].entityID;
				// 	_t.fishInTank[i].properties = Entities.getEntityProperties(fishID);
				// }

			_t.moveFishToNewPositions(deltaTime);
		},
		moveFishToNewPositions: function(deltaTime) {
			print('move fish to new positions')
			for (var i = 0; i < _t.fishInTank.length; i++) {
				var fish = _t.fishInTank[i];
				var v1 = rule1(fish);
				//var v2 = rule2(fish);
				// var v3 = rule3(fish);
				print('v1::' + JSON.stringify(v1));
				//print('v2::' + JSON.stringify(v2));
				// print('v3::'+JSON.stringify(v3));
				var finalVelocity = Vec3.sum(fish.properties.velocity, v1);

			
				 //finalVelocity = Vec3.sum(fish.properties.velocity, v2);
				var finalLength = Vec3.length(finalVelocity);
				if (finalLength > VELOCITY_LIMIT) {
					var scaledVelocity = Vec3.multiply(finalVelocity, 1 / finalLength);
					finalVelocity = Vec3.multiply(scaledVelocity, VELOCITY_LIMIT);
				}
				//finalVelocity = Vec3.sum(finalVelocity, v2);
				// finalVelocity = Vec3.sum(finalVelocity, v3);
				var finalPosition = Vec3.sum(fish.properties.position, Vec3.multiply(finalVelocity, deltaTime));
				print('final velocity:' + JSON.stringify(finalVelocity))
				fish.properties.position = finalPosition;
				fish.properties.velocity = finalVelocity;
				Entities.editEntity(fish.entityID, {
					position: finalPosition,
					velocity: finalVelocity * .001
				})
			}
		},
		onCollisionWithEntity: function() {

		},
		addAttractorAtKnockLocation: function() {

		},
		init: function() {
			print('initializing fishtank')
			_t.addFishToTank();
			Script.update.connect(_t.updateFish);
			// updateFishInterval = Script.setInterval(function() {
			// 	_t.updateFish();
			// }, 1000)

		}
	}



	return new FishTank();

})