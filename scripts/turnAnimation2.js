Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js")
var leftTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx";
var rightTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn_noHipRotation.fbx";

var yawIncrement = 15;
var checkIntervalTime = 1000;
var headTurning = false
var bodyTurning = false;
var minDeltaYawForTurn = 30;
var startingHeadYaw;
var startingBodyYaw;



var checkTimeout;

// MyAvatar.startAnimation(leftTurnAnimation, 7, 1, false, false)

function keyPressEvent(event) {
	if (event.text === "a") {
		if(!headTurning){
			headTurning = true;
			startingHeadYaw = MyAvatar.headYaw; 
			startingBodyYaw = MyAvatar.bodyYaw;
			print('startinng headYaw ' + startingHeadYaw);
			print('starting bodyYaw ' + startingBodyYaw)
			checkTimeout = Script.setTimeout(function() {
				checkForTurn();
			}, checkIntervalTime)
		}
		if(!bodyTurning){
		  MyAvatar.headYaw += yawIncrement;	
		}
	}

}

function cleanup() {
	MyAvatar.headYaw = 0;
	Script.clearInterval(checkTimeout);
}

function update() {
	TWEEN.update();
}


function checkForTurn() {
	var deltaYaw = MyAvatar.headYaw - startingHeadYaw;
	if (deltaYaw > minDeltaYawForTurn) {
		print("TURN");
		var currentProps = {
			yaw: startingBodyYaw
		};
		var endProps = {
			yaw: startingBodyYaw + MyAvatar.headYaw
		}
		MyAvatar.startAnimation(leftTurnAnimation, 15, 1, false, false);
		var turnTween = new TWEEN.Tween(currentProps).
		  to(endProps, 2000).
		  onUpdate(function() {
		  	MyAvatar.bodyYaw =  currentProps.yaw;
		  }).start();
	    bodyTurning = true;
	    turnTween.onComplete(function() {
	    	bodyTurning = false;
	    })
	}
	headTurning = false;

}


Controller.keyPressEvent.connect(keyPressEvent);
Script.scriptEnding.connect(cleanup);
Script.update.connect(update);