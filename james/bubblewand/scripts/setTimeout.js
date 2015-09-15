(function() {

	var _t = this;

	this.unload = function(entityID) {
		Script.update.disconnect(this.internalUpdate);
		Script.clearTimeout(timeOut);
		this.properties = Entities.getEntityProperties(entityID);
		this.position = this.properties.position;
		print('position at unload::: ' + JSON.stringify(this.position));

	}

	this.preload = function(entityID) {
		this.entityID = entityID;
		Script.update.connect(this.internalUpdate)
	}

	
	var timeOut = 0;
	this.internalUpdate = function() {
		if (timeOut < 500) {
			var myTimeout = Script.setTimeout(_t.actionAfterTimeout, 1000);
			timeOut++;
		} else {
			return
		}

	}

	this.actionAfterTimeout = function() {
		print('action aftertimeout')
		Entities.editEntity(_t.entityID, {
			color: {
				red: 0,
				green: 0,
				blue: 255
			}
		})
	}

})

