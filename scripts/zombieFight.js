//Start with one zombie. increase waves

ZombieFight = function() {

	var ZOMBIE_URL = "https://hifi-public.s3.amazonaws.com/eric/models/zombie.fbx";
	ZOMBIE_SPAWN_RADIUS = 5;

	var screenSize = Controller.getViewportDimensions();
	var zombieCryClips = [SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry.wav?v1"), SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry2.wav")];
	var zombieHitClips = [SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit1.wav"),
		SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit2.wav"),
		SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit3.wav")
	];


	//WAVE STUFF
	var waves = [{
		numZombies: 1
	}, {
		numZombies: 2
	}];
	var currentWaveIndex = 0;
	var waveOverlay;
	var waveOverlayDisplayTime = 2000;


	var ZOMBIE_DIMENSIONS = {
		x: 0.7,
		y: 1.7,
		z: 0.7
	}
	var ZOMBIE_HEIGHT = -.1;
	var ZOMBIE_SOUND_MIN_INTERVAL = 3000;
	var ZOMBIE_SOUND_MAX_INTERVAL = 25000;
	var floor;
	var zombies = [];

	var self = this;

	var Y_AXIS = {
		x: 0,
		y: 1,
		z: 0
	};
	var X_AXIS = {
		x: 1,
		y: 0,
		z: 0
	};

	var theta = 0.0;

	var RAD_TO_DEG = 180.0 / Math.PI;

	waveOverlay = Overlays.addOverlay("text", {
		font: {
			size: 20
		},
		color: {
			red: 0,
			green: 255,
			blue: 0
		},
		backgroundColor: {
			red: 100,
			green: 100,
			blue: 100
		},
		backgroundAlpha: 0.9,
		x: screenSize.x / 2,
		y: 200,
		visible: false
	});

	function orientationOf(vector) {
		var direction, yaw, pitch;
		direction = Vec3.normalize(vector);
		yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
		pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
		return Quat.multiply(yaw, pitch);
	}



	this.cleanup = function() {
		Overlays.deleteOverlay(waveOverlay);
		Entities.deleteEntity(floor);
		zombies.forEach(function(zombie) {
			Entities.deleteAction(zombie.entity, zombie.action)
			Entities.deleteEntity(zombie.entity);
		});
		zombies = [];


	}

	this.initiateZombieApocalypse = function() {
		this.initiateWave();
	}

	this.initiateWave = function() {
		for (var i = 0; i < waves[currentWaveIndex].numZombies; i++) {
			var spawnPosition = Vec3.sum(MyAvatar.position, {
				x: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS),
				y: ZOMBIE_HEIGHT,
				z: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS)
			});
			this.spawnZombie(spawnPosition);
		}

		Overlays.editOverlay(waveOverlay, {
			text: "WAVE " + (currentWaveIndex + 1) + " ATTACKING!",
			visible: true
		});

		Script.setTimeout(function() {
			Overlays.editOverlay(waveOverlay, {
				visible: false
			});
		}, waveOverlayDisplayTime);
	}


	this.spawnZombie = function(position) {
		var zombieEntity = Entities.addEntity({
			type: "Model",
			name: "zombie",
			position: position,
			rotation: orientationOf(Vec3.subtract(MyAvatar.position, position)),
			dimensions: ZOMBIE_DIMENSIONS,
			modelURL: ZOMBIE_URL,
			shapeType: "box",
			// gravity: {
			// 	x: 0.0,
			// 	y: -3.0,
			// 	z: 0.0
			// },
			damping: 0.2,
			velocity: {
				x: .1,
				y: 0,
				z: 0
			},
			collisionsWillMove: true
		});

		var action = Entities.addAction("offset", zombieEntity, {
			pointToOffsetFrom: MyAvatar.position,
			linearDistance: 0,
			// linearTimeScale: 0.005
			linearTimeScale: 2
		});
		var zombie = {
			entity: zombieEntity,
			action: action
		}
		zombies.push(zombie)

		Script.addEventHandler(zombie.entity, 'collisionWithEntity', this.gotHit);

		Script.setTimeout(function() {
			// self.zombieMoan(zombie);
		}, randFloat(ZOMBIE_SOUND_MIN_INTERVAL, ZOMBIE_SOUND_MAX_INTERVAL));
	}

	this.zombieMoan = function(zombie) {
		var position = Entities.getEntityProperties(zombie.entity).position;
		var clip = zombieCryClips[randInt(0, zombieCryClips.length)];
		Audio.playSound(clip, {
			position: position,
			volume: 0.2
		});

		Script.setTimeout(function() {
			self.zombieMoan(zombie);
		}, randFloat(ZOMBIE_SOUND_MIN_INTERVAL, ZOMBIE_SOUND_MAX_INTERVAL));
	}

	this.gotHit = function(idA, idB, collision) {
		var zombie = self.getZombieFromID(idA);
		if (!zombie) {
			print('zombie doesnt exist!')
			return;
		}
		if (zombie.dead) {
			print("zombie is already dead");
			return;
		}
		if (Entities.getEntityProperties(idB).name === "sword") {
			Audio.playSound(zombieHitClips[randInt(0, zombieHitClips.length)], {
				position: MyAvatar.position,
				volume: 0.3
			})
			zombie.dead = true;
			Script.setTimeout(function() {
				Entities.deleteAction(zombie.entity, zombie.action)
				Entities.deleteEntity(zombie.entity);
				zombies.splice(zombies.indexOf(zombie), 1);
			}, 1000)
		}

	}

	this.getZombieFromID = function(id) {
		for (var i = 0; i < zombies.length; i++) {
			if (zombies[i].entity === id) {
				return zombies[i];
			}
		}
		return false;
	}
}