// 
//  orbits.js 
//  
//  Created by Bridget Went May 2015. 
//  
//  The start to a project to build a virtual physics classroom on the solar system, gravity, and orbital physics. 
//  A sun with oribiting planets is created in front of you. UI elements allows the user to adjust various physical elements of the scene. 
//  A button allows a satellite to be thrown toward the planet (correct motion to be added). 
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


// Script.include('file:///Users/bridget/Desktop/satellite.js');
Script.include('https://hifi-staff.s3.amazonaws.com/bridget/cookies-2.js');
// Script.include('file:///Users/bridget/Desktop/Scripts/cookies-2.js');

var BASE_URL = 'https://hifi-staff.s3.amazonaws.com/bridget/bridget/';

var MAX_RANGE = 80.0;
var POSITION = 200;
var screenSize = Controller.getViewportDimensions();
var PANEL_X = 850;
var PANEL_Y = 400;
var BUTTON_SIZE = 32;
var PADDING = 20;

var NUM_PLANETS = 3;

var DAMPING = 0.0;
var LIFETIME = 6000;
var ERROR_THRESH = 2.0;

var trailsEnabled = true;
var energyConserved = true;

var MAX_POINTS_PER_LINE = 80;
var MAX_LINES_PER_TRAIL = 5;
var LINE_WIDTH = 5.0;
var line;
var planetLines = [];
var trails = [];


function calcMass(radius, T, g) {
	return (Math.pow(radius, 3.0) / Math.pow(T / (2.0 * Math.PI), 2.0)) / g;
}

function calcInitSpeed(g, mass, radius) {
	return Math.sqrt((g * mass) / radius);
}

function getAcceleration(g, mass1, mass2, distance) {
	//print("g " + g + " mass1 " + mass1 + " mass2 " + mass2 + " distance " + distance);
	var acc = -(g * mass1 * mass2) / Math.pow(distance, -3.0 / 2.0);
	return acc;
}

function getPosition(planet) {
	var properties = Entities.getEntityProperties(planet);
	return properties.position;
}

function getVelocity(planet) {
	var properties = Entities.getEntityProperties(planet);
	return properties.velocity;
}

var totalEnergy, measuredEnergy, measuredPE, measuredKE;

function calcEnergyError(planet, g, mass1, mass2, radius, initialSpeed) {
	totalEnergy = 0.5 * mass1 * Math.pow(initialSpeed, 2.0) - ((g * mass1 * mass2) / radius);
	//print("total: " + totalEnergy);
	var currSpeed = Vec3.length(getVelocity(planet));
	measuredEnergy = 0.5 * mass1 * Math.pow(currSpeed, 2.0) - ((g * mass1 * mass2) / Vec3.distance(getPosition(star), getPosition(planet)));
	//print("measured: " + measuredEnergy);
	var error = ((measuredEnergy - totalEnergy) / totalEnergy) * 100;
	//print("% error: " + error);
	return error;
}

function adjustVelocity(planet, g, mass1, mass2) {
	var measuredPE = -(g * mass1 * mass2) / Vec3.distance(getPosition(star), getPosition(planet));
	// var newKE = 0.5 * M1 * newVelocity * newVelocity;
	// var newTotal = newKE + measuredPE;
	return Math.sqrt(2 * (totalEnergy - measuredPE) / mass1);
}

function initTrail(i) {
	//create a new trail and new stack of line entities
	var trail = [];
	var lineStack = [];
	//add the first line to both the line entity stack and the trail
	trails.push(newLine(lineStack, getPosition(planets[i])));
	//keep track of the trail of line entities for each separate planet
	planetLines.push(lineStack);
}

//make a new line
function newLine(lineStack, point) {
	if (lineStack.length < MAX_LINES_PER_TRAIL) {
		var line = Entities.addEntity({
			position: point,
			type: "Line",
			color: {
				red: 255,
				green: 255,
				blue: 255
			},
			dimensions: {
				x: 10,
				y: 10,
				z: 10
			},
			lifetime: LIFETIME,
			lineWidth: LINE_WIDTH
		});
		lineStack.push(line);
	} else {
		//now we've made it around one revolution
		var firstLine = lineStack.shift(); //access the first line created (bottom of the stack)
		//edit the first line to be the new set of points
		Entities.editEntity(firstLine, {
			linePoints: point
		});
		lineStack.push(firstLine);
	}
	var points = [];
	points.push(point);
	//return new array of points 
	return points;
}


MyAvatar.position = {
	x: POSITION,
	y: POSITION,
	z: POSITION
};
Camera.setOrientation({
	x: 0.0,
	y: -1.0,
	z: 0.0,
	w: 0.0
});

//starting position for the sun
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(MAX_RANGE, Quat.getFront(Camera.getOrientation())));
var STAR_SIZE = 5.0;

var star = Entities.addEntity({
	type: "Model",
	modelURL: BASE_URL + "sun/sun.fbx",
	position: center,
	dimensions: {
		x: STAR_SIZE,
		y: STAR_SIZE,
		z: STAR_SIZE
	},
	angularDamping: DAMPING,
	damping: DAMPING,
	ignoreCollisions: false,
	lifetime: LIFETIME,
	collisionsWillMove: false
});

var planets = [];
var planet_properties = [];
var radius = 10.0;
var G = 3.0;
var gravity = G;
var g_modifier = 1.0;

var T = 2.0 * Math.PI;
var size = 1.0;
var mass_ratio = 0.000000333;

//adjust constants as number of planets increases
var DELTA_RADIUS = 2.0;
var DELTA_G = 0.5;
var DELTA_SIZE = 0.2;
var DELTA_MASS = -0.000000033;

//  Create planets
for (var i = 0; i < NUM_PLANETS; ++i) {
	var mass1 = calcMass(radius, T, G);
	var v0 = calcInitSpeed(gravity, mass1, radius);
	var prop = {
		radius: radius,
		gravity: gravity,
		period: T,
		dimensions: size,
		mass1: mass1,
		mass2: mass_ratio * mass1,
		initialSpeed: v0
	};
	planet_properties.push(prop);
	// print(JSON.stringify(planet_properties[i]));

	var offset = {
		x: prop.radius,
		y: 0.0,
		z: 0.0
	};

	planets.push(Entities.addEntity({
		type: "Model",
		modelURL: BASE_URL + (i + 1) + "/" + (i + 1) + ".fbx",
		//modelURL: "https://hifi-public.s3.amazonaws.com/ozan/props/EarthCloudsAnim/EarthCloudsAnim.fbx",
		position: Vec3.sum(center, offset),
		dimensions: {
			x: prop.dimensions,
			y: prop.dimensions,
			z: prop.dimensions
		},
		velocity: {
			x: 0.0,
			y: prop.initialSpeed,
			z: 0.0
		},
		angularDamping: DAMPING,
		damping: DAMPING,
		ignoreCollisions: false,
		lifetime: LIFETIME,
		collisionsWillMove: true,
		// animationURL: 'https://hifi-public.s3.amazonaws.com/ozan/props/EarthCloudsAnim/EarthCloudsAnim.fbx',
		// animationSettings: '{"firstFrame":0,"fps":24,"frameIndex":0,"hold":false,"lastFrame":500,"loop":true,"running":true,"startAutomatically":true}',
	}));

	if (trailsEnabled) {
		initTrail(i);
	}

	radius += DELTA_RADIUS;
	//gravity += DELTA_G;
	size += DELTA_SIZE;
	mass_ratio += DELTA_MASS;
}

function changeGravity(modifier) {
	for (var i = 0; i < NUM_PLANETS; ++i) {
		planet_properties[i].gravity = planet_properties[i].gravity * modifier;
	}
}

function changePeriod(period) {
	for (var i = 0; i < NUM_PLANETS; ++i) {
		planet_properties[i].period = period;
	}
}

var k = 0;
var dontChangePt = false;
//UI elements
var panel = new Panel(PANEL_X, PANEL_Y);

panel.newSlider("Gravitational Force: ", -1.0, 3.0,
	function(value) {
		g_modifier = value;
		changeGravity(value);
		if (k > 0) {
			dontChangePt = true;
		}
		k++;

	},
	function() {
		return g_modifier;
	},
	function(value) {
		return value.toFixed(1);
	}
);

panel.newSlider("Orbital Period: ", 0.0, 20.0,
	function(value) {
		T = value;
		changePeriod(value);
	},
	function() {
		return T;
	},
	function(value) {
		return (value).toFixed(3) + "sec";
	}
);

panel.newCheckbox("Leave Trails: ",
	function(value) {
		trailsEnabled = value;
	},
	function() {
		return trailsEnabled;
	},
	function(value) {
		return value;
	}
);

panel.newCheckbox("Energy Error Calculations: ",
	function(value) {
		energyConserved = value;
	},
	function() {
		return energyConserved;
	},
	function(value) {
		return value;
	}
);



var counter = 0;

function update(deltaTime) {
	var dist, speed, between, vel;

	for (var i = 0; i < NUM_PLANETS; ++i) {
		var properties = planet_properties[i];
		//print(JSON.stringify(planet_properties[i]));

		between = Vec3.subtract(getPosition(planets[i]), getPosition(star));
		dist = Vec3.length(between);
		speed = getAcceleration(properties.gravity, properties.mass1, properties.mass2, dist) * deltaTime;
		vel = Vec3.multiply(speed, Vec3.normalize(between));

		//print(JSON.stringify(Vec3.sum(getVelocity(planets[i]), vel)));

		Entities.editEntity(planets[i], {
			velocity: Vec3.sum(getVelocity(planets[i]), vel)
		});




		if (trailsEnabled) {

			if (!dontChangePt) {
				var lineStack = planetLines[i];
				var point = getPosition(planets[i]);
				trails[i].push(point);
				Entities.editEntity(lineStack[lineStack.length - 1], {
					linePoints: trails[i]
				});
				if (trails[i].length === MAX_POINTS_PER_LINE) {
					trails[i] = newLine(lineStack, point);
				}
			} else {
				print(JSON.stringify(getPosition(planets[i])));
			}

		}

		if (energyConserved) {
			//measure total energy every 10 updates, recalibrate velocity if necessary
			if (counter % 10 === 0) {
				var error = calcEnergyError(planets[i], properties.gravity, properties.mass1, properties.mass2, properties.radius, properties.initialSpeed);
				//print("measured energy" + measuredEnergy);

				if (Math.abs(error) >= ERROR_THRESH) {

					//print("energy changed from: " + measuredEnergy);
					var newVelocity = adjustVelocity(planets[i], properties.gravity, properties.mass1, properties.mass2);
					//var newEnergy = 0.5 * properties.mass1 * Math.pow(newVelocity, 2.0) - ((G * properties.mass1 * properties.mass2) / Vec3.distance(getPosition(star), getPosition(planets[i])));
					//print(" to: " + newEnergy);

					Entities.editEntity(planets[i], {
						velocity: Vec3.multiply(newVelocity, Vec3.normalize(getVelocity(planets[i])))
					});
				}
			}
		}
		//print(" ");	
	}
	counter++;
};


//clean up models, UI panels, lines, and button overlays
function scriptEnding() {
	Entities.deleteEntity(star);
	for (var i = 0; i < NUM_PLANETS; ++i) {
		Entities.deleteEntity(planets[i]);
	}
	Menu.removeMenu("Developer > Scene");
	panel.destroy();

	var e = Entities.findEntities(MyAvatar.position, 99999999999999);
	for (i = 0; i < e.length; i++) {
		var props = Entities.getEntityProperties(e[i]);
		if (props.type === "Line") {
			Entities.deleteEntity(e[i]);
		}
	}

	Overlays.deleteOverlay(satelliteButton);
	Entities.deleteEntity(satellite);
};


Controller.mouseMoveEvent.connect(function panelMouseMoveEvent(event) {
	return panel.mouseMoveEvent(event);
});
Controller.mousePressEvent.connect(function panelMousePressEvent(event) {
	return panel.mousePressEvent(event);
});
Controller.mouseReleaseEvent.connect(function(event) {
	return panel.mouseReleaseEvent(event);
});

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);