(function(){

	this.preload = function(){
		print("LOADD")
	}

	this.update = function(){
		print('update');
	}

	Script.update.connect(this.update);


});