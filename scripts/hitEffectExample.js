var hitEffectEnabled = false;

toggleHitEffect();

function toggleHitEffect() {
	Script.setTimeout(function() {
	  hitEffectEnabled = !hitEffectEnabled;
	  Scene.setEngineDisplayHitEffect(hitEffectEnabled);	
	   toggleHitEffect();
	}, 1000);
}





