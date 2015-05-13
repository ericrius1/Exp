var grabSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/CloseClamp.wav");
var releaseSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/ReleaseClamp.wav");

var yar = Script.load('hydraGrab.js');
Script.load('mouseGrab.js');


function cleanup(){
  print("YAR " + JSON.stringify(yar))
  yar.stop();
  Script.stop();
}

Script.scriptEnding.connect(cleanup);