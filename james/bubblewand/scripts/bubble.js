//  bubble.js
//  part of bubblewand
//
//  Created by James B. Pollack @imgntn -- 09/03/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  example of a nested entity. it doesn't do much now besides delete itself if it collides with something (bubbles are fragile!  it would be cool if it sometimes merged with other bubbbles it hit)
//  todo: play bubble sounds & particle bursts from the bubble itself instead of the wand. 
//  blocker: needs some sound fixes and a way to find its own position before unload for spatialization
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
    Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

    var POP_SOUNDS = [
        SoundCache.getSound("http://hifi-public.s3.amazonaws.com/james/bubblewand/sounds/pop0.wav"),
        SoundCache.getSound("http://hifi-public.s3.amazonaws.com/james/bubblewand/sounds/pop1.wav"),
        SoundCache.getSound("http://hifi-public.s3.amazonaws.com/james/bubblewand/sounds/pop2.wav"),
        SoundCache.getSound("http://hifi-public.s3.amazonaws.com/james/bubblewand/sounds/pop3.wav")
    ]

    BUBBLE_PARTICLE_COLOR = {
        red: 0,
        green: 40,
        blue: 255,
    }

    var properties;
    var checkPositionInterval;
    this.preload = function(entityID) {
        //  print('bubble preload')
        // var _t = this;
        // _t.entityID = entityID;
        // properties = Entities.getEntityProperties(entityID);
        // checkPositionInterval = Script.setInterval(function() {
        //     properties = Entities.getEntityProperties(entityID);
        //   //  print('properties AT CHECK::' + JSON.stringify(properties));
        // }, 200);

        // _t.loadShader(entityID);
    };

    this.loadShader = function(entityID) {
        setEntityUserData(entityID, {
            "ProceduralEntity": {
                "shaderUrl": "http://localhost:8080/shaders/bubble.fs?" + randInt(0, 10000),
                // "shaderUrl": "https://s3.amazonaws.com/Oculus/shadertoys/quora.fs?"+ randInt(0, 10000),       
            }
        })
    };


    this.leaveEntity = function(entityID) {
        //   print('LEAVE ENTITY:' + entityID)
    };

    this.collisionWithEntity = function(myID, otherID, collision) {
        //Entities.deleteEntity(myID);
        // Entities.deleteEntity(otherID);
    };

    // this.beforeUnload = function(entityID) {
    //     print('BEFORE UNLOAD:' + entityID);
    //     var properties = Entities.getEntityProperties(entityID);
    //     var position = properties.position;
    //     print('BEFOREUNLOAD PROPS' + JSON.stringify(position));

    // };

    this.unload = function(entityID) {
        // Script.clearInterval(checkPositionInterval);
        // var position = properties.position;
        // this.endOfBubble(position);
        var properties = Entities.getEntityProperties(entityID)
        var position = properties.position;
        //print('UNLOAD PROPS' + JSON.stringify(position));
    };

    this.endOfBubble = function(position) {
        this.burstBubbleSound(position);
        this.createBurstParticles(position);
    }

    this.burstBubbleSound = function(position) {
        var audioOptions = {
            volume: 0.5,
            position: position
        }
        Audio.playSound(POP_SOUNDS[randInt(0, 4)], audioOptions);

    }

    this.createBurstParticles = function(position) {
        var _t = this;
        //get the current position of the bubble
        var position = properties.position;
        //var orientation = properties.orientation;

        var animationSettings = JSON.stringify({
            fps: 30,
            frameIndex: 0,
            running: true,
            firstFrame: 0,
            lastFrame: 30,
            loop: false
        });

        var particleBurst = Entities.addEntity({
            type: "ParticleEffect",
            animationSettings: animationSettings,
            animationIsPlaying: true,
            position: position,
            lifetime: 1.0,
            dimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitVelocity: {
                x: 0,
                y: -1,
                z: 0
            },
            velocitySpread: {
                x: 1,
                y: 0,
                z: 1
            },
            emitAcceleration: {
                x: 0,
                y: -1,
                z: 0
            },
            textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
            color: BUBBLE_PARTICLE_COLOR,
            lifespan: 1.0,
            visible: true,
            locked: false
        });

    }


})