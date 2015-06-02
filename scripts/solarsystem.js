// solarSystem.js 
// 
// Adapted from harmonicOscillator.js, Created by Philip Rosedale on May 5, 2015 
// Created by Bridget Went on June 1, 2015
// Copyright 2015 High Fidelity, Inc.
//
// An object moves around the edge of a disc while 
// changing color.  The script is continuously updating
// position, velocity, rotation, and color.  The movement 
// should appear perfectly smooth to someone else, 
// provided their network connection is good.  
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


var time = 0.0; 
var omega = 2.0 * Math.PI / 16.0;
var angular_velocity = 60.0 * Math.PI / 180.0;

var planets = [];
var planetProperties = [];

var BASE_URL = "https://hifi-staff.s3.amazonaws.com/bridget/bridget/";

var theSun = {
  url: BASE_URL + "sun/sun.fbx",
  radius: 0.0,
  size: 3.0
};


var mercury = {
  url: BASE_URL + "mercury/mercury.fbx",
  radius: 1.387,
  size: 0.883
}; 
planetProperties.push(mercury);



var venus = {
  url: BASE_URL + "venus/venus.fbx",
  radius: 1.723,
  size: 0.949
}; 
planetProperties.push(venus);

var earth = {
  url: BASE_URL + "earth/earth.fbx",
  radius: 2.0,
  size: 1.0
}; 
planetProperties.push(earth);

var mars = {
  url: BASE_URL + "mars/mars.fbx",
  radius: 2.22,
  size: 0.532
};
planetProperties.push(mars); 


var jupiter = {
  url: BASE_URL + "jupiter/jupiter.fbx",
  radius: 3.20,
  size: 2.01
}; 
planetProperties.push(jupiter);


var saturn = {
  url: BASE_URL + "saturn/saturn.fbx",
  radius: 4.08,
  size: 1.45
}; 
planetProperties.push(saturn);


var uranus = {
  url: BASE_URL + "uranus/uranus.fbx",
  radius: 5.20,
  size: 1.81
}; 
planetProperties.push(uranus);


var neptune = {
  url: BASE_URL + "neptune/neptune.fbx",
  radius: 6.05,
  size: 1.81
}; 
planetProperties.push(neptune);


var basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(20.0, Quat.getFront(Camera.getOrientation())));

//add  sun to the scene
var sun = Entities.addEntity(
  { type: "Model",
    modelURL: theSun.url,
    position: basePosition,
    dimensions: { x: theSun.size, y: theSun.size, z: theSun.size} 
  });

//add all planets in array to scene
for (var i = 0; i < planetProperties.length; ++i) {
  
  
  planets.push(Entities.addEntity(
  { type: "Model",
    modelURL: planetProperties[i].url,
    position: Vec3.sum(basePosition, {x: planetProperties[i].radius, y: 0.0, z: planetProperties[i].radius}),
    dimensions: { x: planetProperties[i].size / 5.0, y: planetProperties[i].size / 5.0, z: planetProperties[i].size / 5.0},  
    angularVelocity: angular_velocity,
  }));

  
  
}

Script.setTimeout(function(){
    Script.update.connect(update);
  }, 5000);



function update(deltaTime) {
  
  time += deltaTime;
  rotation = Quat.angleAxis(time * omega  /Math.PI * 180.0, { x: 0, y: 1, z: 0 });


  
  //update each planet's position using its distance from the sun
  for (var i = 0; i < planets.length; ++i) {
    var prop;

    Entities.editEntity(planets[i], 
    {
    position: { x: basePosition.x  + Math.sin(time * omega) / 2.0 * planetProperties[i].radius, 
                  y: basePosition.y, 
         z: basePosition.z + Math.cos(time * omega) / 2.0 * planetProperties[i].radius },  
    // velocity: { x: Math.cos(time * omega)/2.0 * planetProperties[i].radius * omega, 
    //               y: 0.0, 
    //      z: -Math.sin(time * omega)/2.0 * planetProperties[i].radius * omega},
    rotation: rotation 
    }); 

  }


 //  Entities.editEntity(earth, 
  // {
  //   position: { x: basePosition.x + Math.sin(time * omega) / 2.0 * earthRadius, 
 //                  y: basePosition.y, 
  //       z: basePosition.z + Math.cos(time * omega) / 2.0 * earthRadius },  
  //   velocity: { x: Math.cos(time * omega)/2.0 * earthRadius * omega, 
 //                  y: 0.0, 
  //       z: -Math.sin(time * omega)/2.0 * earthRadius * omega},
  //   rotation: rotation 
 //  }); 

 //  Entities.editEntity(mercury, 
 //  {
 //    position: { x: basePosition.x + Math.sin(time * omega) / 2.0 * mercuryRadius, 
 //                  y: basePosition.y, 
 //         z: basePosition.z + Math.cos(time * omega) / 2.0 * mercuryRadius },  
 //    velocity: { x: Math.cos(time * omega)/2.0 * mercuryRadius * omega, 
 //                  y: 0.0, 
 //         z: -Math.sin(time * omega)/2.0 * mercuryRadius * omega},
 //    rotation: rotation 
 //  }); 

  
}

function scriptEnding() {
  
  //remove sun
  Entities.deleteEntity(sun);
  
  //remove all planets
  for (var i = 0; i < planets.length; ++i) {
      Entities.deleteEntity(planets[i]);
  }

}



Script.scriptEnding.connect(scriptEnding);

