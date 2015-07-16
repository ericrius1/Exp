ZombieFight = function() {

	var ZOMBIE_URL = "https://hifi-public.s3.amazonaws.com/eric/models/zombie.fbx";
	ZOMBIE_SPAWN_RADIUS = 10;


	var zombieCryClips = [SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry.wav?v1"), SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry2.wav")];
	var zombieHitClips = [SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit1.wav"), 
	                      SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit2.wav"),
	                      SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombieHit3.wav")];

	var NUM_ZOMBIES = 10;
	var ZOMBIE_DIMENSIONS = {
		x: 0.7,
		y: 1.7, 
		z: 0.7
	}
	var ZOMBIE_HEIGHT = ZOMBIE_DIMENSIONS.y/2;
	var ZOMBIE_SOUND_MIN_INTERVAL = 3000;
	var ZOMBIE_SOUND_MAX_INTERVAL = 25000;
	var floor;
	var zombies = [];

	var self = this;


	this.cleanup = function() {
		Entities.deleteEntity(floor);
		zombies.forEach(function(zombie) {
			Entities.deleteAction(zombie.entity, zombie.action)
			Entities.deleteEntity(zombie.entity);
		});
		zombies = [];
	}

	this.initiateZombieApocalypse = function() {
		floor = Entities.addEntity({
			type: "Box",
			position: Vec3.sum(MyAvatar.position, {
				x: 0,
				y: -.5,
				z: 0
			}),
			dimensions: {
				x: 100,
				y: 1,
				z: 100
			},
			color: {
				red: 160,
				green: 5,
				blue: 30
			},
			// ignoreForCollisions: true
		});

		for (var i = 0; i < NUM_ZOMBIES; i++) {
			var spawnPosition = Vec3.sum(MyAvatar.position, {
				x: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS),
				y: ZOMBIE_HEIGHT,
				z: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS)
			});
			this.spawnZombie(spawnPosition);
		}
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
			gravity: {
				x: 0.0,
				y: -3.0,
				z: 0.0
			},
			damping: 0.2,
			collisionsWillMove: true
		});

		var pointToOffsetFrom = Vec3.sum(position, {
			x: 0.0,
			y: 2.0,
			z: 0.0
		});
		var action = Entities.addAction("offset", zombieEntity, {
			pointToOffsetFrom: pointToOffsetFrom,
			linearDistance: 2,
			// linearTimeScale: 0.005
			linearTimeScale: 0.1
		});
		var zombie = {
			entity: zombieEntity,
			action: action
		}
		zombies.push(zombie)



		Script.addEventHandler(zombie.entity, 'collisionWithEntity', this.gotHit);

		Script.setTimeout(function() {
			self.zombieMoan(zombie);
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
		if(!zombie){
			print('zombie doesnt exist!')
			return;
		}
		if(zombie.dead) {
			print("zombie is already dead");
			return;
		}
		if(Entities.getEntityProperties(idB).name === "sword"){
			Audio.playSound(zombieHitClips[randInt(0, zombieHitClips.length)], {
				position: MyAvatar.position,
				volume: 0.3
			})
			Script.setTimeout(function() {
				Entities.deleteAction(zombie.entity, zombie.action)
				Entities.deleteEntity(zombie.entity);
				zombie.dead = true;
				zombies.splice(zombies.indexOf(zombie), 1);
			}, 1000)
		}

	}

	this.getZombieFromID = function(id) {
		for(var i = 0; i < zombies.length; i++) {
			if(zombies[i].entity === id) {
				return zombies[i];
			}
		}
		return false;
	}
}
