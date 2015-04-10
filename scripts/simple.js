//Simple entity script with update
(function(){
    this.preload = function(){
        this.xPosition = 10;
    }
    
    this.update = function(){
        this.xPosition += 0.2;
        print("What is this? ", this);
        print("XPOSITION " + this.xPosition);
    }
    Script.update.connect(this.update);
});