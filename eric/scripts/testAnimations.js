var currentAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx";


MyAvatar.startAnimation(currentAnimation, 6, 1, true, false, 0);

function cleanup() {
	MyAvatar.stopAnimation(currentAnimation);
}




function update() {
	var details = MyAvatar.getAnimationDetails(currentAnimation);
	print(details.frameIndex);
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup);