(function() {

	Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
	Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");
	var _t = this;
	var timeOut;
	this.unload = function(entityID) {
		Script.update.disconnect(this.internalUpdate);
		Script.clearTimeout(timeOut);
		this.properties = Entities.getEntityProperties(EntityID);
		this.position = this.properties.position;
		print('position at unload::: ' + JSON.stringify(this.position));

	}

	this.preload = function(entityID) {
		this.entityID = entityID;
		Script.update.connect(this.internalUpdate);

	}
	
	// var interval = 1;
	// var timer=0;
	var timeOut;
	this.internalUpdate = function(deltaTime) {
		// print('dt::'+deltaTime)
		// if((timer-=deltaTime)<0){
		// 	timer=interval;
		// 	_t.actionAfterTimeout();
		// }


		if (timeOut === undefined) {
			timeOut = Script.setTimeout(_t.actionAfterTimeout, 1000);
		} else {
			return
		}

	}

	this.actionAfterTimeout = function() {
		print('action aftertimeout')
		Entities.editEntity(_t.entityID, {
			color: {
				red: randInt(0, 255),
				green: randInt(0, 255),
				blue: randInt(0, 255)
			}
		})
	
		timeOut=undefined;
	}

})