// 
//  orbits.js 
//  
//  Created by Bridget Went, 05/28/15. Modified 06/18/15. 
//  
//  The start to a project to build a virtual physics classroom to simulate the solar system, gravity, and orbital physics. 
//  A sun with oribiting planets is created in front of the user. UI elements allow for adjusting the period, gravity, trails, and energy recalculations. 
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


Script.include('https://hifi-staff.s3.amazonaws.com/bridget/cookies-2.js');

var BASE_URL = 'https://hifi-staff.s3.amazonaws.com/bridget/bridget/';

var NUM_PLANETS = 8;
var trailsEnabled = true;
var energyConserved = true;

var MAX_RANGE = 100.0;
var POSITION = 800;
var screenSize = Controller.getViewportDimensions();
var PANEL_X = 850;
var PANEL_Y = 600;
var BUTTON_SIZE = 20;
var PADDING = 20;

var DAMPING = 0.0;
var LIFETIME = 6000;
var ERROR_THRESH = 2.0;
var TIME_STEP = 80.0;

var MAX_POINTS_PER_LINE = 10;
var LINE_DIM = 10;
var LINE_WIDTH = 5.0;
var line;
var planetLines = [];
var trails = [];

var BOUNDS = 200;

//notify user if they are too close to domain bounds 
if (MyAvatar.position.x < BOUNDS || MyAvatar.position.x > TREE_SCALE - BOUNDS || MyAvatar.position.y < BOUNDS || MyAvatar.position.y > TREE_SCALE - BOUNDS || MyAvatar.position.z < BOUNDS || MyAvatar.position.z > TREE_SCALE - BOUNDS) {
    Window.alert("Please move at least 200m away from domain bounds.");
    return;
}

//starting position for the sun
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(MAX_RANGE, Quat.getFront(Camera.getOrientation())));
var SUN_SIZE = 8.0;
var LABEL_X = 10.0;
var LABEL_Y = 10.0;
var LABEL_Z = 10.0;
var offset = {x: 0.0, y: 10.0, z: 0.0};

var theSun = Entities.addEntity({
    type: "Model",
    modelURL: BASE_URL + "sun/sun.fbx",
    position: center,
    dimensions: {
        x: SUN_SIZE,
        y: SUN_SIZE,
        z: SUN_SIZE
    },
    angularDamping: DAMPING,
    damping: DAMPING,
    ignoreCollisions: false,
    lifetime: LIFETIME,
    collisionsWillMove: false
});


var planets = [];
var planet_properties = [];

//reference values
var radius = 7.0;
var T_ref = 1.0;
var size = 1.0;
var M = 250.0;
var m = M * 0.000000333;
var G = (Math.pow(radius, 3.0) / Math.pow((T_ref / (2.0 * Math.PI)), 2.0)) / M;
var G_ref = G;

//adjust size and distance as number of planets increases
var DELTA_RADIUS = 1.3;
var DELTA_SIZE = 0.2;

//  Initialize planets
for (var i = 0; i < NUM_PLANETS; ++i) {
    var v0 = Math.sqrt((G * M) / radius);
    var T = (2.0 * Math.PI) * Math.sqrt(Math.pow(radius, 3.0) / (G * M));

    if (i == 0) {
        var color = {red: 255, green: 255, blue: 255};
    } else if (i == 1) {
        var color = {red: 255, green: 160, blue: 110};
    } else if (i == 2) {
        var color = {red: 10, green: 150, blue: 100};
    } else if (i == 3) {
        var color = {red: 180, green: 70, blue: 10};
    } else if (i == 4) {
        var color = {red: 250, green: 140, blue: 0};
    } else if (i == 5) {
        var color = {red: 235, green: 215, blue: 0};
    } else if (i == 6) {
        var color = {red:135, green: 205, blue: 240};
    } else if (i == 7) {
        var color = {red:30, green: 140, blue: 255};
    }

    var offset = { 
        x: radius, 
        y: 0.0, 
        z: 0.0 
    };
    var prop = {
        radius: radius,
        position: Vec3.sum(center, offset),
        color: color,
        period: T,
        dimensions: size,
        velocity: {
            x: 0.0,
            y: v0,
            z: 0.0
        },
    };
    planet_properties.push(prop);

    planets.push(Entities.addEntity({
        type: "Model",
        modelURL: BASE_URL + (i + 1) + "/" + (i + 1) + ".fbx",
        position: prop.position,
        dimensions: {
            x: prop.dimensions,
            y: prop.dimensions,
            z: prop.dimensions
        },
        velocity: prop.velocity,
        angularDamping: DAMPING,
        damping: DAMPING,
        ignoreCollisions: false,
        lifetime: LIFETIME,
        collisionsWillMove: true,
    }));

    radius *= DELTA_RADIUS;
    size += DELTA_SIZE;
}

//UI panel
var panel = new Panel(PANEL_X, PANEL_Y);
var panelItems = [];


var pauseButton = Overlays.addOverlay("text", {
    backgroundColor: { red: 200, green: 200, blue: 255 },
    text: "Pause",
    x: PANEL_X,
    y: PANEL_Y - 30,
    width: 70,
    height: 20,
    alpha: 1.0,
    backgroundAlpha: 0.5,
    visible: true
});
var paused = false;
function mousePressEvent(event) {
    var clickedOverlay = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
    if(clickedOverlay == pauseButton) {
        paused = !paused;
        for (var i = 0; i < NUM_PLANETS; ++i) {
            Entities.editEntity(planets[i], { velocity: {x: 0.0, y: 0.0, z: 0.0} });
        }
        showLabels();
        if (paused == false) {
            hideLabels();
        }
    } 
}

var g_multiplier = 1.0;
panelItems.push(panel.newSlider("Adjust Gravitational Force: ", 0.1, 5.0,
	function (value) {
	    g_multiplier = value;
	    if (g_multiplier == 1.0) {
	        return;
	    }
	    G = G_ref * g_multiplier;
	},

	function () {
	    return g_multiplier;
	},
	function (value) {
	    return value.toFixed(1) + "x";
	}));

var period_multiplier = 1.0;
var last_alpha = period_multiplier;
panelItems.push(panel.newSlider("Adjust Orbital Period: ", 0.1, 3.0,
	function (value) {
	    period_multiplier = value;
	    if (period_multiplier == 1.0) {
	        return;
	    }
	    changePeriod(period_multiplier);
	},
	function () {
	    return period_multiplier;
	},
	function (value) {
	    return (value).toFixed(2) + "x";
	}));

panelItems.push(panel.newCheckbox("Leave Trails: ",
	function (value) {
	    trailsEnabled = value;
	    if (trailsEnabled) {
	        for (var i = 0; i < NUM_PLANETS; ++i) {
	            resetTrails(i);
	        }
	        //if trails are off and we've already created trails, remove existing trails
	    } else if (planetLines.length != 0) {
	        for (var i = 0; i < NUM_PLANETS; ++i) {
	            for (var j = 0; j < planetLines[i].length; ++j) {
	                Entities.deleteEntity(planetLines[i][j]);
	            }
	            planetLines[i] = [];
	        }
	    }
	},
	function () {
	    return trailsEnabled;
	},
	function (value) {
	    return value;
	}));

panelItems.push(panel.newCheckbox("Energy Error Calculations: ",
	function (value) {
	    energyConserved = value;
	},
	function () {
	    return energyConserved;
	},
	function (value) {
	    return value;
	}));

// Update global G constant, period, poke velocity to new value
function changePeriod(alpha) {
    var ratio = last_alpha / alpha;
    G = Math.pow(ratio, 2.0) * G;
    for (var i = 0; i < NUM_PLANETS; ++i) {
        var properties = planet_properties[i];
        properties.T = ratio * properties.T;
        properties.velocity = Vec3.multiply(ratio, properties.velocity);

    }
    last_alpha = alpha;
}

var labels = [];
var labelLines = [];
function showLabels() {
    for (var i = 0; i < NUM_PLANETS; i++) {
        var text;
        if (i == 0) {
            text = "Mercury";
        } else if (i == 1) {
            text = "Venus";
        } else if (i == 2) {
            text = "Earth";
        } else if (i == 3) {
            text = "Mars";
        } else if (i == 4) {
            text = "Jupiter";
        } else if (i == 5) {
            text = "Saturn";
        } else if (i == 6) {
            text = "Uranus";
        } else if (i == 7) {
            text = "Neptune";
        }

        labelLines.push(Entities.addEntity( {
            type: "Line",
            position: planet_properties[i].position,
            dimensions: {x: 10, y: 10, z: 10},
            lineWidth: 2.0,
            color: {red: 255, green: 255, blue: 255},
            linePoints: [planet_properties[i].position, Vec3.sum(planet_properties[i].position, {x: 0, y: 8.0, z: 0})],
            visible: true
        }));
        
        labels.push(Entities.addEntity( {
            type: "Text",
            text: text,
            dimensions: {x: 1, y: 0.3, z: 1},
            position: Vec3.sum(planet_properties[i].position, {x: 0.0, y: 8.0, z: 0}),
            backgroundColor: {red: 255, green: 255, blue: 255},
            textColor: {red: 50, green: 50, blue: 50},
            visible: true
        }));

    }
}

function hideLabels() {
    for (var i = 0; i < NUM_PLANETS; ++i) {
        Entities.deleteEntity(labels[i]);
        Entities.deleteEntity(labelLines[i]);
        labels = [];
        labelLines = [];
    }
}


var time = 0.0;
var elapsed;
var counter = 0;
var delta_time = 1.0 / TIME_STEP;

function update(deltaTime) {
    if (paused) {
        return;
        elapsed = 0.0;
    }

    deltaTime = delta_time;

    for (var i = 0; i < NUM_PLANETS; ++i) {
        var properties = planet_properties[i];

        var between = Vec3.subtract(properties.position, center);
        var speed = getAcceleration(properties.radius) * deltaTime;
        var vel = Vec3.multiply(speed, Vec3.normalize(between));

        //update velocity and position
        properties.velocity = Vec3.sum(properties.velocity, vel);
        properties.position = Vec3.sum(properties.position, Vec3.multiply(properties.velocity, deltaTime));
        Entities.editEntity(planets[i], {
            velocity: properties.velocity,
            position: properties.position
        });
        //RIDE: MyAvatar.position = planet_properties[2].position;

        //create new or update current trail
        if (trailsEnabled) {
            var lineStack = planetLines[i];
            var point = properties.position;
            trails[i].push(point);
            Entities.editEntity(lineStack[lineStack.length - 1], {
                linePoints: trails[i]
            });
            if (trails[i].length === MAX_POINTS_PER_LINE) {
                trails[i] = newLine(lineStack, point, properties.period, properties.color);
            }
        }

        //measure total energy every 10 updates, recalibrate velocity if necessary
        if (energyConserved) {
            if (counter % 10 === 0) {
                var error = calcEnergyError(planets[i], properties.radius, properties.v0, properties.velocity, properties.position);
              
                if (Math.abs(error) >= ERROR_THRESH) {
                    var speed = adjustVelocity(planets[i], properties.position);
                    properties.velocity = Vec3.multiply(speed, Vec3.normalize(properties.velocity));
                }
            }
        }
    }
    counter++;
    if (time % TIME_STEP == 0) {
        elapsed++;
    }
    time++;
};

function getAcceleration(radius) {
    var acc = -(G * M) * Math.pow(radius, (-2.0));
    return acc;
}

// Create a new trail
function resetTrails(planetIndex) {
    elapsed = 0.0;
    var properties = planet_properties[planetIndex];
 
    var trail = [];
    var lineStack = [];

    //add the first line to both the line entity stack and the trail
    trails.push(newLine(lineStack, properties.position, properties.period, properties.color));
    planetLines.push(lineStack);
}

// Make a new line
function newLine(lineStack, point, period, color) {
    if (elapsed < period * 1.4) {
        var line = Entities.addEntity({
            position: point,
            type: "Line",
            color: color,
            dimensions: {
                x: LINE_DIM,
                y: LINE_DIM,
                z: LINE_DIM
            },
            lifetime: LIFETIME,
            lineWidth: LINE_WIDTH
        });
        lineStack.push(line);
    } else {
        //begin overwriting first lines after one full revolution
        var firstLine = lineStack.shift(); 
        Entities.editEntity(firstLine, {
            linePoints: point
        });
        lineStack.push(firstLine);
    }
    var points = [];
    points.push(point);
    return points;
}

// Measure energy error, recalculate velocity to return to initial net energy
var totalEnergy;
var measuredEnergy;
var measuredPE;

function calcEnergyError(planet, radius, v0, v, pos) {
    totalEnergy = 0.5 * M * Math.pow(v0, 2.0) - ((G * M * m) / radius);
    measuredEnergy = 0.5 * M * Math.pow(v, 2.0) - ((G * M * m) / Vec3.distance(center, pos));
    var error = ((measuredEnergy - totalEnergy) / totalEnergy) * 100;
    return error;
}
function adjustVelocity(planet, pos) {
    var measuredPE = -(G * M * m) / Vec3.distance(center, pos);

    return Math.sqrt(2 * (totalEnergy - measuredPE) / M);
}


// Clean up models, UI panels, lines, and button overlays
function scriptEnding() {
    Entities.deleteEntity(theSun);
    for (var i = 0; i < NUM_PLANETS; ++i) {
        Entities.deleteEntity(planets[i]);
    }
    Menu.removeMenu("Developer > Scene");
    panel.destroy();
    Overlays.deleteOverlay(pauseButton);

    var e = Entities.findEntities(MyAvatar.position, 99999999999999);
    for (i = 0; i < e.length; i++) {
        var props = Entities.getEntityProperties(e[i]);
        if (props.type === "Line" || props.type === "Text") {
            Entities.deleteEntity(e[i]);
        }
    }

    
};




Controller.mouseMoveEvent.connect(function panelMouseMoveEvent(event) {
    return panel.mouseMoveEvent(event);
});
Controller.mousePressEvent.connect(function panelMousePressEvent(event) {
    return panel.mousePressEvent(event);
});
// Controller.mouseDoublePressEvent.connect(function panelMouseDoublePressEvent(event) {
//     return panel.mouseDoublePressEvent(event);
// });
Controller.mouseReleaseEvent.connect(function (event) {
    return panel.mouseReleaseEvent(event);
});
Controller.mousePressEvent.connect(mousePressEvent);

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);