//
// platform.js
//
// Created by Seiji Emery on 8/19/15
// Copyright 2015 High Fidelity, Inc.
//
// Spawns a platform under your avatar made up of randomly deformed cubes that follows you around.
// Makes some assumptions (ie. avatar offset height = 1.5), and uses very large numbers of entities
// (default 400) that may get left behind if your client crashes. Use at your own risk.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var SCRIPT_NAME = "platform.js";

Script.include('http://public.highfidelity.io/scripts/libraries/uiwidgets.js');
Script.include('https://dl.dropboxusercontent.com/u/4386006/hifi/js/js-utils.js');

// Platform script
(function() {

    var SCRIPT_NAME = "platform.js";
    var LOG_ENTITY_CREATION_MESSAGES = false;
    var LOG_UPDATE_STATUS_MESSAGES = false;

    var MAX_UPDATE_INTERVAL = 0.2; // restrict to 5 updates / sec

    var STRESS_TEST = false;

    var AVATAR_HEIGHT_OFFSET = 1.5;
    var NUM_PLATFORM_ENTITIES = 400;
    var RADIUS = 5.0;
    // var HEIGHT_TOLERANCE = 0.1;
    // var HUE_RANGE   = [ -15, 15 ];

    if (STRESS_TEST) {
        RADIUS = 25.0;
        NUM_PLATFORM_ENTITIES = 20000;
    }


    // color = random SHADE_RANGE + random component range
    // var SHADE_RANGE = [ 25, 225 ];
    // var RED_RANGE   = [ -10, 10 ];
    // var GREEN_RANGE = [ -10, 10 ];
    // var BLUE_RANGE  = [ -10, 10 ];


    if (typeof(Math.randRange) === 'undefined') {
        Math.randRange = function(min, max) {
            return Math.random() * (max - min) + min;
        }
    }
    if (typeof(Math.randInt) === 'undefined') {
        Math.randInt = function(n) {
            return Math.floor(Math.random() * n) | 0;
        }
    }

    // RNG models
    (function() {
        var RandomColorModel = this.RandomColorModel = function() {
            // this.hueRange  = 200;
            // this.shadeAvg  = 100;
            // this.shadeRange = 200;
            // this.redRange   = 100;
            // this.greenRange = 10;
            // this.blueRange  = 0;
            this.shadeRange = 0;
            this.shadeAvg = 55;
            this.redRange = 255;
            this.greenRange = 0;
            this.blueRange = 0;
        };
        RandomColorModel.prototype.generateSeed = function() {
            return [Math.random(), Math.random(), Math.random(), Math.random()];
        };
        RandomColorModel.prototype.getRandom = function(s) {
            // logMessage("initialized color " + JSON.stringify(s));
            var shade = (s[0] - 0.5) * this.shadeRange + this.shadeAvg;
            var color = {
                red: shade + s[1] * this.redRange,
                green: shade + s[2] * this.greenRange,
                blue: shade + s[3] * this.blueRange
            };
            // logMessage("shade: " + shade, COLORS.GREEN);
            // logMessage("this: " + JSON.stringify(this));
            // logMessage("color: " + JSON.stringify(color), COLORS.RED);
            return color;
        };
        RandomColorModel.prototype.setupUI = function(callback) {
            var _this = this;
            ['shadeRange', 'shadeAvg', 'redRange', 'greenRange', 'blueRange'].forEach(function(k) {
                callback(k, _this[k], 0, 255, function(value) {
                    _this[k] = value
                });
            });
        }

        var RandomShapeModel = this.RandomShapeModel = function() {
            this.widthRange = [0.3, 0.7];
            this.depthRange = [0.5, 0.8];
            this.heightRange = [0.01, 0.08];
        };
        RandomShapeModel.prototype.generateSeed = function() {
            return [Math.random(), Math.random(), Math.random()];
        }
        RandomShapeModel.prototype.getRandom = function(s) {
            return {
                x: s[0] * (this.widthRange[1] - this.widthRange[0]) + this.widthRange[0],
                y: s[1] * (this.heightRange[1] - this.heightRange[0]) + this.heightRange[0],
                z: s[2] * (this.depthRange[1] - this.depthRange[0]) + this.depthRange[0]
            };
        }
        RandomShapeModel.prototype.setupUI = function(callback) {
            var _this = this;
            [
                ['widthRange', 'width'],
                ['depthRange', 'depth'],
                ['heightRange', 'height']
            ].forEach(function(k) {
                callback(k[1], _this[k[0]], 0.0001, 2.0, function(value) {
                    _this[k[0]] = value
                });
            });
        }

        var RandomAttribModel = this.RandomAttribModel = function() {
            this.colorModel = new RandomColorModel();
            this.shapeModel = new RandomShapeModel();
        }
        RandomAttribModel.prototype.randomizeShapeAndColor = function(obj) {
            // logMessage("randomizing " + JSON.stringify(obj));
            obj._colorSeed = this.colorModel.generateSeed();
            obj._shapeSeed = this.shapeModel.generateSeed();
            this.updateShapeAndColor(obj);
            // logMessage("color seed: " + JSON.stringify(obj._colorSeed), COLORS.RED);
            // logMessage("randomized color: " + JSON.stringify(obj.color), COLORS.RED);
            // logMessage("randomized: " + JSON.stringify(obj));
            return obj;
        }
        RandomAttribModel.prototype.updateShapeAndColor = function(obj) {
            try {
                // logMessage("update shape and color: " + this.colorModel);
                obj.color = this.colorModel.getRandom(obj._colorSeed);
                obj.dimensions = this.shapeModel.getRandom(obj._shapeSeed);
            } catch (e) {
                logMessage("update shape / color failed", COLORS.RED);
                logMessage('' + e, COLORS.RED);
                logMessage("obj._colorSeed = " + JSON.stringify(obj._colorSeed));
                logMessage("obj._shapeSeed = " + JSON.stringify(obj._shapeSeed));
                // logMessage("obj = " + JSON.stringify(obj));
                throw e;
            }


            return obj;
        }
    })();

    var HUE_RANGE = 200;
    var SHADE_AVG = 100;
    var SHADE_RANGE = 200;

    var RED_BIAS = 1.0;
    var GREEN_BIAS = 0.1;
    var BLUE_BIAS = 0.0;

    var SHADE_RANGE = [SHADE_AVG - SHADE_RANGE * 0.5, SHADE_AVG + SHADE_RANGE * 0.5];
    // var RED_RANGE  = [ -HUE_RANGE * 0.5 * RED_BIAS,   +HUE_RANGE * 0.5 * RED_BIAS   ];
    // var GREEN_RANGE = [ -HUE_RANGE * 0.5 * GREEN_BIAS, +HUE_RANGE * 0.5 * GREEN_BIAS ];
    // var BLUE_RANGE  = [ -HUE_RANGE * 0.5 * BLUE_BIAS,  +HUE_RANGE * 0.5 * BLUE_BIAS  ];
    var RED_RANGE = [0, +HUE_RANGE * 0.5 * RED_BIAS];
    var GREEN_RANGE = [0, +HUE_RANGE * 0.5 * GREEN_BIAS];
    var BLUE_RANGE = [0, +HUE_RANGE * 0.5 * BLUE_BIAS];


    var USE_FIXED_COLOR_POOL = false;
    var COLOR_POOL = [

    ];


    // Used to detect teleportation. If user moves faster than this over one time step (times dt),
    // then we trigger a complete rebuild at their new height.
    var MAX_ACCELERATION_THRESHOLD = 20.0;

    // Box shape properties
    var WIDTH_RANGE = [0.3, 0.8];
    var DEPTH_RANGE = [0.4, 1.8];
    var HEIGHT_RANGE = [0.01, 0.08];


    // Status / logging UI (ignore this)
    (function() {
        var COLORS = this.COLORS = {
            'GREEN': new Color("#2D870C"),
            'RED': new Color("#AF1E07"),
            'LIGHT_GRAY': new Color("#CCCCCC"),
            'DARK_GRAY': new Color("#4E4E4E")
        };

        var LINE_WIDTH = 400;
        var LINE_HEIGHT = 20;

        var lines = [];
        var lineIndex = 0;
        for (var i = 0; i < 20; ++i) {
            lines.push(new UI.Label({
                text: " ",
                visible: false,
                width: LINE_WIDTH,
                height: LINE_HEIGHT,
            }));
        }
        var title = new UI.Label({
            text: SCRIPT_NAME,
            visible: true,
            width: LINE_WIDTH,
            height: LINE_HEIGHT,
        });

        var overlay = new UI.Box({
            visible: true,
            width: LINE_WIDTH,
            height: 0,
            backgroundColor: COLORS.DARK_GRAY,
            backgroundAlpha: 0.3
        });
        overlay.setPosition(280, 10);
        relayoutFrom(0);
        UI.updateLayout();

        function relayoutFrom(n) {
            var layoutPos = {
                x: overlay.position.x,
                y: overlay.position.y
            };

            title.setPosition(layoutPos.x, layoutPos.y);
            layoutPos.y += LINE_HEIGHT;

            // for (var i = n; i >= 0; --i) {
            for (var i = n + 1; i < lines.length; ++i) {
                if (lines[i].visible) {
                    lines[i].setPosition(layoutPos.x, layoutPos.y);
                    layoutPos.y += LINE_HEIGHT;
                }
            }
            // for (var i = lines.length - 1; i > n; --i) {
            for (var i = 0; i <= n; ++i) {
                if (lines[i].visible) {
                    lines[i].setPosition(layoutPos.x, layoutPos.y);
                    layoutPos.y += LINE_HEIGHT;
                }
            }
            overlay.height = (layoutPos.y - overlay.position.y + 10);
            overlay.getOverlay().update({
                height: overlay.height
            });
        }
        this.logMessage = function(text, color, alpha) {
            lines[lineIndex].setVisible(true);
            relayoutFrom(lineIndex);

            lines[lineIndex].getOverlay().update({
                text: text,
                visible: true,
                color: color || COLORS.LIGHT_GRAY,
                alpha: alpha !== undefined ? alpha : 1.0,
                x: lines[lineIndex].position.x,
                y: lines[lineIndex].position.y
            });
            lineIndex = (lineIndex + 1) % lines.length;
            UI.updateLayout();
        }
        var dragStart = null;
        var initialPos = null;

        // function onMousePress (event) {
        //  // logMessage("mouse pressed");
        //  try {
        //  var mouseover = Overlays.getOverlayAtPoint(event.x, event.y);
        //  logMessage("event.x = " + event.x + ", event.y = " + event.y);
        //  logMessage("mousover = " + mouseover + ", target overlay = " + overlay.getOverlay().getId());


        //  if (mouseover == overlay.getOverlay().getId()) {
        //  logMessage("start drag");
        //  dragStart  = { x: event.x, y: event.y };
        //  initialPos = { x: overlay.position.x, y: overlay.position.y };
        //  } else {
        //  logMessage('' + mouseover + " != " + overlay.getOverlay().getId());
        //  }
        // } catch (e) {
        //  logMessage('' + e, COLORS.RED);
        // }
        // }
        // function onMouseMove (event) {
        //  logMessage("mouse move");
        //  if (dragStart) {
        //  overlay.setPosition(
        //  initialPos.x + event.x - dragStart.x,
        //  initialPos.y + event.y - dragStart.y);
        //  relayoutFrom(lineIndex);
        //  UI.updateLayout();
        //  logMessage("drag update");
        //  }
        // }
        // function onMouseRelease (event) {
        //  dragStart = initialPos = null;
        //  logMessage("end drag");
        // }

        // Controller.mousePressEvent.connect(onMousePress);
        // Controller.mouseMoveEvent.connect(onMouseMove);
        // Controller.mouseReleaseEvent.connect(onMouseRelease);
        // Script.scriptEnding.connect(function () {
        //  Controller.mousePressEvent.disconnect(onMousePress);
        //  Controller.mouseMoveEvent.disconnect(onMouseMove);
        //  Controller.mouseReleaseEvent.disconnect(onMouseRelease);
        // });

        // UI.debug.setVisible(true);
    })();

    // Utils (ignore)
    (function() {
        // Utility function
        this.withDefaults = function(properties, defaults) {
            // logMessage("withDefaults: " + JSON.stringify(properties) + JSON.stringify(defaults));
            properties = properties || {};
            if (defaults) {
                for (var k in defaults) {
                    properties[k] = defaults[k];
                }
            }
            return properties;
        }

        // Math utils
        if (typeof(Math.randRange) === 'undefined') {
            Math.randRange = function(min, max) {
                return Math.random() * (max - min) + min;
            }
        }
        if (typeof(Math.randInt) === 'undefined') {
            Math.randInt = function(n) {
                return Math.floor(Math.random() * n) | 0;
            }
        }

        // Get a random point within a circle on the xz plane with radius r.
        this.randomCirclePoint = function(r, pos) {
            var a = Math.random(),
                b = Math.random();
            if (b < a) {
                var tmp = b;
                b = a;
                a = tmp;
                // b ^= (a ^ (a=b));
            }
            var point = {
                x: pos.x + b * r * Math.cos(2 * Math.PI * a / b),
                y: pos.y,
                z: pos.z + b * r * Math.sin(2 * Math.PI * a / b)
            };
            if (LOG_ENTITY_CREATION_MESSAGES) {
                // logMessage("input params: " + JSON.stringify({ radius: r, position: pos }), COLORS.GREEN);
                // logMessage("a = " + a + ", b = " + b);
                logMessage("generated point: " + JSON.stringify(point), COLORS.RED);
            }
            return point;
        }

        // Entity utils
        var makeEntity = this.makeEntity = function(properties) {
            if (LOG_ENTITY_CREATION_MESSAGES) {
                logMessage("Creating entity: " + JSON.stringify(properties));
            }
            var entity = Entities.addEntity(properties);
            return {
                update: function(properties) {
                    Entities.editEntity(entity, properties);
                },
                destroy: function() {
                    Entities.deleteEntity(entity)
                }
            };
        }
        this.makeLight = function(properties) {
            return makeEntity(withDefaults(properties, {
                type: "Light",
                isSpotlight: false,
                diffuseColor: {
                    red: 255,
                    green: 100,
                    blue: 100
                },
                ambientColor: {
                    red: 200,
                    green: 80,
                    blue: 80
                }
            }));
        }
        this.makeBox = function(properties) {
            // logMessage("Creating box: " + JSON.stringify(properties));
            return makeEntity(withDefaults(properties, {
                type: "Box"
            }));
        }
    })();

    DEFAULT_COLOR = {
        red: 255,
        green: 200,
        blue: 200,
        clone: function() {
            return {
                red: this.red,
                green: this.green,
                blue: this.blue
            };
        }
    };

    // Platform
    (function() {
        var PlatformComponent = this.PlatformComponent = function(properties) {
            // logMessage("initialize with " + Object.keys(properties), COLORS.GREEN);

            this.position = properties.position || null;
            this.color = properties.color || null;
            this.dimensions = properties.dimensions || null;

            if (properties._colorSeed)
                this._colorSeed = properties._colorSeed;
            if (properties._shapeSeed)
                this._shapeSeed = properties._shapeSeed;

            // logMessage("dimensions: " + JSON.stringify(this.dimensions));
            // logMessage("color: " + JSON.stringify(this.color));

            this.box = makeBox({
                dimensions: this.dimensions,
                color: this.color,
                position: this.position,
                alpha: 0.5
            });
        };
        PlatformComponent.prototype.update = function(position) {
            if (position)
                this.position = position;
            // logMessage("updating with " + JSON.stringify(this));
            this.box.update(this);
        }

        function swap(a, b) {
            var tmp = a;
            a = b;
            b = tmp;
        }
        PlatformComponent.prototype.swap = function(other) {
            swap(this.position, other.position);
            swap(this.dimensions, other.dimensions);
            swap(this.color, other.color);
        }
        PlatformComponent.prototype.destroy = function() {
            if (this.box) {
                this.box.destroy();
                this.box = null;
            }
        }

        function inRange(p1, p2, radius) {
            return Vec3.distance(p1, p2) < Math.abs(radius);
        }

        var DynamicPlatform = this.DynamicPlatform = function(n, position, radius) {
            this.position = position;
            this.radius = radius;
            this.randomizer = new RandomAttribModel();

            var boxes = this.boxes = [];
            // logMessage("Spawning " + n + " entities", COLORS.GREEN);
            while (n > 0) {
                var properties = {
                    position: this.randomPoint()
                };
                this.randomizer.randomizeShapeAndColor(properties);
                // logMessage("properties: " + JSON.stringify(properties));
                boxes.push(new PlatformComponent(properties));
                --n;
            }
            this.targetDensity = this.getEntityDensity();
            this.pendingUpdates = {};
            this.updateTimer = 0.0;

            this.platformHeight = position.y;
            this.oldPos = {
                x: position.x,
                y: position.y,
                z: position.z
            };
            this.oldRadius = radius;
        }
        DynamicPlatform.prototype.toString = function() {
            return "[DynamicPlatform (" + this.boxes.length + " entities)]";
        }
        DynamicPlatform.prototype.updateEntityAttribs = function() {
            var _this = this;
            this.setPendingUpdate('updateEntityAttribs', function() {
                // logMessage("updating model", COLORS.GREEN);
                _this.boxes.forEach(function(box) {
                    this.randomizer.updateShapeAndColor(box);
                    box.update();
                }, _this);
            });
        }

        // Uses the update loop to limit potentially expensive updates to only execute every x seconds.
        DynamicPlatform.prototype.setPendingUpdate = function(name, callback) {
            if (!this.pendingUpdates[name]) {
                this.pendingUpdates[name] = {
                    callback: callback,
                    timer: 0.0,
                    skippedUpdates: 0
                }
            } else {
                this.pendingUpdates[name].callback = callback;
                this.pendingUpdates[name].skippedUpdates++;
                // logMessage("scheduling update for \"" + name + "\" to run in " + this.pendingUpdates[name].timer + " seconds");
            }
        }
        DynamicPlatform.prototype.processPendingUpdates = function(dt) {
            for (var k in this.pendingUpdates) {
                if (this.pendingUpdates[k].timer >= 0.0)
                    this.pendingUpdates[k].timer -= dt;

                if (this.pendingUpdates[k].callback && this.pendingUpdates[k].timer < 0.0) {
                    // logMessage("Running update for \"" + k + "\" (skipped " + this.pendingUpdates[k].skippedUpdates + ")");
                    try {
                        this.pendingUpdates[k].callback();
                    } catch (e) {
                        logMessage("update for \"" + k + "\" failed: " + e, COLORS.RED);
                    }
                    this.pendingUpdates[k].timer = MAX_UPDATE_INTERVAL;
                    this.pendingUpdates[k].skippedUpdates = 0;
                    this.pendingUpdates[k].callback = null;
                }
            }
        }
        DynamicPlatform.prototype.update = function(dt, position) {
            // logMessage("updating " + this);
            position.y = this.platformHeight;
            this.position = position;

            var toUpdate = [];
            this.boxes.forEach(function(box, i) {
                // if (Math.abs(box.position.y - position.y) > HEIGHT_TOLERANCE || !inRange(box, position, radius)) {
                if (!inRange(box.position, this.position, this.radius)) {
                    toUpdate.push(i);
                }
            }, this);

            var MAX_TRIES = toUpdate.length * 8;
            var tries = MAX_TRIES;
            var moved = 0;
            var recalcs = 0;
            toUpdate.forEach(function(index) {
                if ((index % 2 == 0) || tries > 0) {
                    do {
                        var randomPoint = this.randomPoint(this.position, this.radius);
                        ++recalcs
                    } while (--tries > 0 && inRange(randomPoint, this.oldPos, this.oldRadiuss));

                    if (LOG_UPDATE_STATUS_MESSAGES && tries <= 0) {
                        logMessage("updatePlatform() gave up after " + MAX_TRIES + " iterations (" + moved + " / " + toUpdate.length + " successful updates)", COLORS.RED);
                        logMessage("old pos: " + JSON.stringify(this.oldPos) + ", old radius: " + this.oldRadius);
                        logMessage("new pos: " + JSON.stringify(this.position) + ", new radius: " + this.radius);
                    }
                } else {
                    var randomPoint = this.randomPoint(position, this.radius);
                }

                this.randomizer.randomizeShapeAndColor(this.boxes[index]);
                this.boxes[index].update(randomPoint);
                // this.boxes[index].setValues({
                //  position: randomPoint,
                //  // dimensions: this.randomDimensions(),
                //  // color: this.randomColor()
                // });
                ++moved;
            }, this);
            recalcs = recalcs - toUpdate.length;

            this.oldPos = position;
            this.oldRadius = this.radius;
            if (LOG_UPDATE_STATUS_MESSAGES && toUpdate.length > 0) {
                logMessage("updated " + toUpdate.length + " entities w/ " + recalcs + " recalcs");
            }

            this.processPendingUpdates(dt);
        }
        DynamicPlatform.prototype.getEntityCount = function() {
            return this.boxes.length;
        }
        DynamicPlatform.prototype.setEntityCount = function(n) {
            if (n > this.boxes.length) {
                // logMessage("Setting entity count to " + n + " (adding " + (n - this.boxes.length) + " entities)", COLORS.GREEN);

                // Spawn new boxes
                n = n - this.boxes.length;
                for (; n > 0; --n) {
                    var properties = {
                        position: this.randomPoint()
                    };
                    this.randomizer.randomizeShapeAndColor(properties);
                    this.boxes.push(new PlatformComponent(properties));
                }
            } else if (n < this.boxes.length) {
                // logMessage("Setting entity count to " + n + " (removing " + (this.boxes.length - n) + " entities)", COLORS.GREEN);

                // Destroy random boxes (technically, the most recent ones, but it should be sorta random)
                n = this.boxes.length - n;
                for (; n > 0; --n) {
                    this.boxes.pop().destroy();
                }
            }
        }
        DynamicPlatform.prototype.getEntityDensity = function() {
            return (this.boxes.length * 1.0) / (Math.PI * this.radius * this.radius);
        }
        DynamicPlatform.prototype.setDensityOnNextUpdate = function(density) {
            var _this = this;
            this.targetDensity = density;
            this.setPendingUpdate('density', function() {
                _this.updateEntityDensity(density);
            });
        }
        DynamicPlatform.prototype.updateEntityDensity = function(density) {
            this.setEntityCount(Math.floor(density * Math.PI * this.radius * this.radius));
        }
        DynamicPlatform.prototype.getRadius = function() {
            return this.radius;
        }
        DynamicPlatform.prototype.setRadiusOnNextUpdate = function(radius) {
            var _this = this;
            this.setPendingUpdate('radius', function() {
                _this.setRadius(radius);
            });
        }
        var DEBUG_RADIUS_RECALC = false;
        DynamicPlatform.prototype.setRadius = function(radius) {
            if (radius < this.radius) {
                // logMessage("Setting radius to " + radius + " (shrink by " + (this.radius - radius) + ")", COLORS.GREEN );
                this.radius = radius;

                // // Remove all entities outside of current bounds. Requires swapping, since we want to maintain a continuous array.
                // var count = this.boxes.length;
                // for (var i = 0; i < count; ++i) {
                //  if (!inRange(this.boxes[i], this.position, this.radius)) {
                //  this.boxes[i].swap(this.boxes[count - 1]);
                //  --count;
                //  }
                // }

                // Remove all entities outside of current bounds. Requires swapping, since we want to maintain a continuous array.
                // Algorithm: two pointers at front and back. We traverse fwd and back, swapping elems so that all entities in bounds
                // are at the front of the array, and all entities out of bounds are at the back.
                var count = this.boxes.length;
                var toDelete = 0;
                var swapList = [];
                if (DEBUG_RADIUS_RECALC) {
                    logMessage("starting at i = 0, j = " + (count - 1));
                }
                for (var i = 0, j = count - 1; i < j;) {
                    // Find first elem outside of bounds that we can move to the back
                    while (inRange(this.boxes[i].position, this.position, this.radius) && i < j) {
                        ++i;
                    }
                    // Find first elem in bounds that we can move to the front
                    while (!inRange(this.boxes[j].position, this.position, this.radius) && i < j) {
                        --j;
                        ++toDelete;
                    }
                    if (i < j) {
                        // swapList.push([i, j]);
                        if (DEBUG_RADIUS_RECALC) {
                            logMessage("swapping " + i + ", " + j);
                        }
                        this.boxes[i].swap(this.boxes[j]);
                        ++i, --j;
                        ++toDelete;
                    } else {
                        if (DEBUG_RADIUS_RECALC) {
                            logMessage("terminated at i = " + i + ", j = " + j, COLORS.RED);
                        }
                    }
                }
                // logMessage('' + swapList.length + " swaps: ");
                // logMessage(swapList.map(function (p) {
                // return '(' + p[0]  + ', ' + p[1] + ')'
                // }).join(', '));
                if (DEBUG_RADIUS_RECALC) {
                    logMessage("toDelete = " + toDelete, COLORS.RED);
                }
                if (toDelete > this.boxes.length) {
                    logMessage("Error: toDelete " + toDelete + " > entity count " + this.boxes.length + " (setRadius algorithm)", COLORS.RED);
                    toDelete = this.boxes.length;
                }

                if (toDelete > 0) {
                    // logMessage("Deleting " + toDelete + " entities as part of radius resize", COLORS.GREEN);
                }
                // Delete cleared boxes
                for (; toDelete > 0; --toDelete) {
                    this.boxes.pop().destroy();
                }

                // fix entity density (just in case)
                this.updateEntityDensity(this.targetDensity);
            } else if (radius > this.radius) {
                // logMessage("Setting radius to " + radius + " (grow by " + (radius - this.radius) + ")", COLORS.GREEN);

                // Add entities based on entity density
                // var density = this.getEntityDensity();
                var density = this.targetDensity;
                var oldArea = Math.PI * this.radius * this.radius;
                var n = Math.floor(density * Math.PI * (radius * radius - this.radius * this.radius));

                if (n > 0) {
                    // logMessage("Adding " + n + " entities", COLORS.GREEN);

                    // Add entities (we use a slightly different algorithm to place them in the area between two concentric circles)
                    for (; n > 0; --n) {
                        var theta = Math.randRange(0.0, Math.PI * 2.0);
                        var r = Math.randRange(this.radius, radius);
                        // logMessage("theta = " + theta + ", r = " + r);
                        var pos = {
                            x: Math.cos(theta) * r + this.position.x,
                            y: this.position.y,
                            z: Math.sin(theta) * r + this.position.y
                        };

                        var properties = {
                            position: pos
                        };
                        this.randomizer.randomizeShapeAndColor(properties);
                        this.boxes.push(new PlatformComponent(properties));
                    }
                }

                this.radius = radius;
            }
        }
        DynamicPlatform.prototype.updateHeight = function(height) {
            this.platformHeight = height;

            // Invalidate current boxes to trigger a rebuild
            this.boxes.forEach(function(box) {
                box.position.x += this.oldRadius * 100;
            });
            // this.update(dt, position, radius);
        }
        DynamicPlatform.prototype.randomPoint = function(position, radius) {
            position = position || this.position;
            radius = radius !== undefined ? radius : this.radius;
            return randomCirclePoint(radius, position);
        }
        DynamicPlatform.prototype.randomDimensions = function() {
            return {
                x: Math.randRange(WIDTH_RANGE[0], WIDTH_RANGE[1]),
                y: Math.randRange(HEIGHT_RANGE[0], HEIGHT_RANGE[1]),
                z: Math.randRange(DEPTH_RANGE[0], DEPTH_RANGE[1])
            };
        }
        DynamicPlatform.prototype.randomColor = function() {
            var shade = Math.randRange(SHADE_RANGE[0], SHADE_RANGE[1]);
            // var h = HUE_RANGE;
            return {
                red: shade + Math.randRange(RED_RANGE[0], RED_RANGE[1]) | 0,
                green: shade + Math.randRange(GREEN_RANGE[0], GREEN_RANGE[1]) | 0,
                blue: shade + Math.randRange(BLUE_RANGE[0], BLUE_RANGE[1]) | 0
            }
            // return COLORS[Math.randInt(COLORS.length)]
        }
        DynamicPlatform.prototype.destroy = function() {
            this.boxes.forEach(function(box) {
                box.destroy();
            });
            this.boxes = [];
        }
    })();

    // function catchErrors(fcn) {
    //  return function () {
    //  try {
    //  fcn.apply(this, arguments);
    //  } catch (e) {
    //  logMessage('' + e, COLORS.RED);
    //  logMessage("while calling " + fcn);
    //  logMessage("Called by: " + arguments.callee.caller);
    //  }
    //  };
    // }

    function catchErrors(fcn) {
        return fcn;
    }

    // UI
    (function() {
        function makePanel(dir, properties) {
            return new UI.WidgetStack(withDefaults(properties, {
                dir: dir
            }));
        }

        function addSpacing(parent, width, height) {
            parent.add(new UI.Box({
                backgroundAlpha: 0.0,
                width: width,
                height: height
            }));
        }

        function addLabel(parent, text) {
            return parent.add(new UI.Label({
                text: text,
                width: 200,
                height: 20
            }));
        }

        function addSlider(parent, label, min, max, getValue, onValueChanged) {
            try {
                var layout = parent.add(new UI.WidgetStack({
                    dir: "+x"
                }));
                var textLabel = layout.add(new UI.Label({
                    text: label,
                    width: 150,
                    height: 20
                }));
                var valueLabel = layout.add(new UI.Label({
                    text: "" + (+getValue().toFixed(1)),
                    width: 40,
                    height: 20
                }));
                var slider = layout.add(new UI.Slider({
                    value: getValue(),
                    minValue: min,
                    maxValue: max,
                    width: 300,
                    height: 20,
                    slider: {
                        width: 30,
                        height: 18
                    },
                    onValueChanged: function(value) {
                        valueLabel.setText("" + (+value.toFixed(1)));
                        onValueChanged(value, slider);
                        UI.updateLayout();
                    }
                }));
                return slider;
            } catch (e) {
                logMessage("" + e, COLORS.RED);
                logMessage("parent: " + parent, COLORS.RED);
                logMessage("label:  " + label, COLORS.RED);
                logMessage("min:    " + min, COLORS.RED);
                logMessage("max:    " + max, COLORS.RED);
                logMessage("getValue: " + getValue, COLORS.RED);
                logMessage("onValueChanged: " + onValueChanged, COLORS.RED);
                throw e;
            }
        }

        function addPushButton(parent, label, onClicked, setActive) {
            var button = parent.add(new UI.Box({
                text: label,
                width: 120,
                height: 20
            }));
        }

        function moveToBottomLeftScreenCorner(widget) {
            var border = 5;
            var pos = {
                x: border,
                y: Controller.getViewportDimensions().y - widget.getHeight() - border
            };
            if (widget.position.x != pos.x || widget.position.y != pos.y) {
                widget.setPosition(pos.x, pos.y);
                UI.updateLayout();
            }
        }
        var _export = this;

        function _setupUI(platform) {
            var layoutContainer = makePanel("+y", {
                visible: false
            });
            // layoutContainer.setPosition(10, 280);
            // makeDraggable(layoutContainer);
            _export.onScreenResize = function() {
                moveToBottomLeftScreenCorner(layoutContainer);
            }
            var topSection = layoutContainer.add(makePanel("+x"));
            addSpacing(layoutContainer, 1, 5);
            var btmSection = layoutContainer.add(makePanel("+x"));

            var controls = topSection.add(makePanel("+y"));
            addSpacing(topSection, 20, 1);
            var buttons = topSection.add(makePanel("+y"));
            addSpacing(topSection, 20, 1);

            var colorControls = btmSection.add(makePanel("+y"));
            addSpacing(btmSection, 20, 1);
            var shapeControls = btmSection.add(makePanel("+y"));
            addSpacing(btmSection, 20, 1);

            // Top controls
            addLabel(controls, "Platform (platform.js)");
            controls.radiusSlider = addSlider(controls, "radius", 1.0, 15.0, function() {
                    return platform.getRadius()
                },
                function(value) {
                    platform.setRadiusOnNextUpdate(value);
                    controls.spacingSlider.setValue(platform.getEntityCount());
                });
            addSpacing(controls, 1, 2);
            controls.densitySlider = addSlider(controls, "entity density", 0.0, 35.0, function() {
                    return platform.getEntityDensity()
                },
                function(value) {
                    platform.setDensityOnNextUpdate(value);
                    controls.spacingSlider.setValue(platform.getEntityCount());
                });
            addSpacing(controls, 1, 2);
            controls.spacingSlider = addSlider(controls, "entity count", 0, 20000, function() {
                    return platform.getEntityCount()
                },
                function(value) {
                    // platform.setEntityCount(Math.floor(value));
                });
            controls.spacingSlider.actions = {}; // hack: make this slider readonly (clears all attached actions)
            controls.spacingSlider.slider.actions = {};

            // addLabel(buttons, "");
            // addSpacing(buttons, 1, 2);
            // addPushButton(buttons, "foo");
            // addSpacing(buttons, 1, 2);
            // addPushButton(buttons, "bar");
            // addSpacing(buttons, 1, 2);
            // addPushButton(buttons, "baz");


            // moveToBottomLeftScreenCorner(layoutContainer);

            // Bottom controls
            // // Do the same for the shape (dimensions) model
            platform.randomizer.shapeModel.setupUI(function(name, value, min, max, setValue) {
                // logMessage("platform.randomizer.shapeModel." + name + " = " + value);
                var internal = {
                    avg: (value[0] + value[1]) * 0.5,
                    range: Math.abs(value[0] - value[1])
                };
                // logMessage(JSON.stringify(internal), COLORS.GREEN);

                addSlider(shapeControls, name + ' avg', min, max, function() {
                    return internal.avg;
                }, function(value) {
                    internal.avg = value;
                    setValue([internal.avg - internal.range * 0.5, internal.avg + internal.range * 0.5]);
                    platform.updateEntityAttribs();
                });
                addSpacing(shapeControls, 1, 2);
                addSlider(shapeControls, name + ' range', min, max, function() {
                    return internal.range
                }, function(value) {
                    internal.range = value;
                    setValue([internal.avg - internal.range * 0.5, internal.avg + internal.range * 0.5]);
                    platform.updateEntityAttribs();
                });
                addSpacing(shapeControls, 1, 2);
            });
            // Iterate over controls (making sliders) for the RNG color model
            platform.randomizer.colorModel.setupUI(function(name, value, min, max, setValue) {
                // logMessage("platform.randomizer.colorModel." + name + " = " + value);
                addSlider(colorControls, name, min, max, function() {
                    return value;
                }, function(value) {
                    setValue(value);
                    platform.updateEntityAttribs();
                });
                addSpacing(shapeControls, 1, 2);
            });

            moveToBottomLeftScreenCorner(layoutContainer);
            layoutContainer.setVisible(true);
        }

        this.setupUI = function(platform) {
            var CATCH_SETUP_ERRORS = true;
            if (CATCH_SETUP_ERRORS) {
                try {
                    _setupUI(platform);
                } catch (e) {
                    logMessage("Error setting up ui: " + e, COLORS.RED);
                }
            } else {
                _setupUI(platform);
            }
        }
    })();



    // Setup everything
    (function() {
        function getPlatformPosition() {
            var pos = MyAvatar.position;
            pos.y -= AVATAR_HEIGHT_OFFSET;
            return pos;
        }

        var platform = this.platform = null;
        var lastHeight = null;

        var CATCH_INIT_ERRORS = true;
        this.init = function() {
            function _init() {
                logMessage("initializing...");
                Script.update.disconnect(init);

                platform = new DynamicPlatform(NUM_PLATFORM_ENTITIES, getPlatformPosition(), RADIUS);
                lastHeight = getPlatformPosition().y;
                setupUI(platform);

                Script.update.connect(update);
                logMessage("finished initializing.", COLORS.GREEN);
            }
            if (CATCH_INIT_ERRORS) {
                try {
                    _init();
                } catch (e) {
                    logMessage("error while initializing: " + e, COLORS.RED);
                }
            } else {
                _init();
            }
        }
        var lastDimensions = Controller.getViewportDimensions();

        function checkScreenDimensions() {
            var dimensions = Controller.getViewportDimensions();
            if (dimensions.x != lastDimensions.x || dimensions.y != lastDimensions.y) {
                onScreenResize(dimensions.x, dimensions.y);
            }
            lastDimensions = dimensions;
        }

        this.update = function(dt) {
            try {
                checkScreenDimensions();

                var pos = getPlatformPosition();
                if (Math.abs(pos.y - lastHeight) * dt > MAX_ACCELERATION_THRESHOLD) {
                    // User likely teleported
                    logMessage("Height rebuild (" +
                        "(" + Math.abs(pos.y - lastHeight) + " * " + dt + " = " + (Math.abs(pos.y - lastHeight) * dt) + ")" +
                        " > " + MAX_ACCELERATION_THRESHOLD + ")");
                    platform.updateHeight(pos.y);
                }
                platform.update(dt, getPlatformPosition(), platform.getRadius());
                lastHeight = pos.y;
            } catch (e) {
                logMessage("" + e, COLORS.RED);
            }
        }
        this.teardown = function() {
            try {
                platform.destroy();
                UI.teardown();
            } catch (e) {
                logMessage("" + e, COLORS.RED);
            }
        }
    })();


    // UI utils (ignore)
    (function() {
        var makeDraggable = this.makeDraggable = function(widget, target) {
            target = widget || target;
            if (widget) {
                var dragStart = null;
                var initial = null;

                widget.addAction('onMouseDown', function(event) {
                    dragStart = {
                        x: event.x,
                        y: event.y
                    };
                    initial = {
                        x: target.position.x,
                        y: target.position.y
                    };
                });
                widget.addAction('onDragUpdate', function(event) {
                    target.setPosition(
                        initial.x + event.x - dragStart.x,
                        initial.y + event.y - dragStart.y
                    );
                    UI.updateLayout();
                });
                widget.addAction('onMouseUp', function() {
                    dragStart = dragEnd = null;
                });
            }
        }

        UI.MinMaxSlider = function(localMin, localMax, absMin, absMax, properties) {

            logMessage("Creating UI.MinMaxSlider");
            UI.Box.prototype.constructor.call(this, {
                width: properties.width,
                height: properties.height,
                position: properties.position,
                backgroundColor: properties.backgroundColor,
                backgroundAlpha: properties.backgroundAlpha,
                visible: true
            });
            this.minSlider = new UI.Slider(withDefaults(properties, {
                value: localMin,
                minValue: absMin,
                maxValue: absMax,
                width: properties.width,
                height: properties.height,
                position: properties.position,
                backgroundAlpha: 0.0
            }));
            this.maxSlider = new UI.Slider(withDefaults(properties, {
                value: localMax,
                minValue: absMin,
                maxValue: absMax,
                width: properties.width,
                height: properties.height,
                position: properties.position,
                backgroundAlpha: 0.0
            }));
            this.minSlider.parent = this;
            this.maxSlider.parent = this;

            this.onMinChanged = properties.onMinChanged || function() {};
            this.onMaxChanged = properties.onMaxChanged || function() {};

            function fwdAction(from, action, to) {
                from.addAction(action, function(event, widget) {
                    to.actions[action].call(event, widget);
                });
            }
            ['onMouseDown', 'onMouseUp', 'onDragUpdate'].forEach(function(action) {
                fwdAction(this.minSlider, action, this);
                fwdAction(this.maxSlider, action, this);
            }, this);

            this.minSlider.onValueChanged = function(value) {
                this.onMinChanged(value);
                if (value > this.maxSlider.getValue()) {
                    this.maxSlider.value = Math.min(value, absMax);
                    this.onMaxChanged(value);
                    UI.updateLayout();
                }
            }
            this.maxSlider.onValueChanged = function(value) {
                this.onMaxChanged(value);
                if (value < this.minSlider.getValue()) {
                    this.minSlider.value = Math.max(value, absMin);
                    this.onMinChanged(value);
                    UI.updateLayout();
                }
            }
            this.getMin = function() {
                return this.minSlider.getMin();
            }
            this.getMax = function() {
                return this.maxSlider.getMax();
            }
            this.setMin = function(value) {
                this.minSlider.setValue(value);
            }
            this.setMax = function(value) {
                this.maxSlider.setValue(max);
            }
            this.toString = function() {
                return "[ UI.MinMaxSlider " + this.id + " ]";
            }
            this.applyLayout = function() {
                this.minSlider.setPosition(this.position.x, this.position.y);
                this.maxSlider.setPosition(this.position.x, this.position.y);
            }
        }
        UI.MinMaxSlider.prototype = {};
        UI.MinMaxSlider.prototype = Object.create(UI.Box.prototype, {});
        // UI.MinMaxSlider.prototype = new UI.Box();
        // UI.MinMaxSlider.prototype.constructor = UI.MinMaxSlider;
        // UI.MinMaxSlider.prototype.toString = function () {
        //  return "[ UI.MinMaxSlider " + this.id + " ]";
        // }
        // UI.MinMaxSlider.prototype.applyLayout = function () {
        //  print("Calling UI.MinMaxSlider: " + this);
        //  this.minSlider.setPosition(this.position.x, this.position.y);
        //  this.maxSlider.setPosition(this.position.x, this.position.y);
        // }
    })();




    Script.update.connect(catchErrors(init));
    Script.scriptEnding.connect(catchErrors(teardown));

    Controller.mousePressEvent.connect(catchErrors(UI.handleMousePress));
    Controller.mouseMoveEvent.connect(catchErrors(UI.handleMouseMove));
    Controller.mouseReleaseEvent.connect(catchErrors(UI.handleMouseRelease));

})();