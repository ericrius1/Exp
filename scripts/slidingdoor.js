(function() {
  var self = this;
  this.preload = function(entityId) {
    this.width = 1;
    this.entityId = entityId;
    this.properties = Entities.getEntityProperties(this.entityId);
    this.getUserData();

    Entities.editEntity(this.entityId, {
      dimensions: {
        x: this.width,
        y: 1.5,
        z: .2
      }
    });

    if (!this.properties.userData) {
      //if this is the door's true birth, then set it's state to closed
      this.userData = {};
      this.userData.state = "closed";
    }

  }

  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
    }

  }

  this.updateUserData = function() {
    Entities.editEntity(this.entityId, {
      userData: JSON.stringify(this.userData)
    });
  }

  this.toggle = function() {
    //We ignore user click if the door is in process of opening or closing
    if (this.userData.state === "opening" || this.userData.state === "closing") {
      return;
    }
    if (this.userData.state === "closed") {
      this.direction = Quat.getRight(this.properties.rotation);
      this.targetPosition = Vec3.sum(Vec3.multiply(this.direction, this.width), this.properties.position);
      this.userData.state = "opening";
      this.open();
    }
    if (this.userData.state === "open") {
      //reverse direction
      this.direction = Vec3.multiply(-1, Quat.getRight(this.properties.rotation));
      this.targetPosition = Vec3.sum(Vec3.multiply(this.direction, this.width), this.properties.position);
      this.userData.state = "closing";
    }

    this.updateUserData();
  }

  this.clickReleaseOnEntity = function(entityId, mouseEvent) {
    this.entityId = entityId;
    if (mouseEvent.isLeftButton) {
      this.toggle();
    }

  }
  this.getUserData = function() {
    if (this.properties.userData) {
      this.userData = JSON.parse(this.properties.userData);
    }
  }


  this.unload = function() {
    Script.update.disconnect(this.update);
    this.cleanUp();
  }

  this.cleanUp = function() {}

  this.open = function(){
    var current = {
      x: this.properties.position.x,
      y: this.properties.position.y,
      z: this.properties.position.z,
    }
    var end = {
      x: this.targetPosition.x,
      y: this.targetPosition.y,
      z: this.targetPosition.z,
    }
    var openTween = new TWEEN.Tween(current, 1000).
      to(end).
      onUpdate(function(){
        Entities.editEntity(self.entityId, {position: {x: current.x, y: current.y, z: current.z}});
      }).start();

  }
  this.update = function() {
    self.properties = Entities.getEntityProperties(self.entityId)
    self.getUserData();


    // if (self.userData.state === "opening" || self.userData.state === "closing") {
    //   self.newPosition = Vec3.mix(self.properties.position, self.targetPosition, 0.02);
    //   Entities.editEntity(self.entityId, {
    //     position: self.newPosition
    //   });

    //   self.distanceToTarget = Vec3.distance(self.newPosition, self.targetPosition);
    //   if (self.distanceToTarget < 0.05) {
    //     //We have reached target, now set state to either closed or open
    //     if (self.userData.state === "opening") {
    //       self.userData.state = "open";
    //     } else if (self.userData.state = "closing") {
    //       self.userData.state = "closed";
    //     }
    //     self.updateUserData();
    //   }
    // }

    TWEEN.update();

  }

  Script.update.connect(this.update);




  //TWEEEEN STUFF
  var TWEEN = TWEEN || (function() {

      var _tweens = [];

      return {

        REVISION: '14',

        getAll: function() {

          return _tweens;

        },

        removeAll: function() {

          _tweens = [];

        },

        add: function(tween) {

          _tweens.push(tween);

        },

        remove: function(tween) {

          var i = _tweens.indexOf(tween);

          if (i !== -1) {

            _tweens.splice(i, 1);

          }

        },

        update: function(time) {

          if (_tweens.length === 0) return false;

          var i = 0;

          time = time !== undefined ? time :new Date().getTime();

          while (i < _tweens.length) {

            if (_tweens[i].update(time)) {

              i++;

            } else {

              _tweens.splice(i, 1);

            }

          }

          return true;

        }
      };

    })();

  TWEEN.Tween = function(object) {

    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _valuesStartRepeat = {};
    var _duration = 1000;
    var _repeat = 0;
    var _yoyo = false;
    var _isPlaying = false;
    var _reversed = false;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTweens = [];
    var _onStartCallback = null;
    var _onStartCallbackFired = false;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    var _onStopCallback = null;

    // Set all starting values present on the target object
    for (var field in object) {

      _valuesStart[field] = parseFloat(object[field], 10);

    }

    this.to = function(properties, duration) {

      if (duration !== undefined) {

        _duration = duration;

      }

      _valuesEnd = properties;

      return this;

    };

    this.start = function(time) {

      TWEEN.add(this);

      _isPlaying = true;

      _onStartCallbackFired = false;

      _startTime = time !== undefined ? time :new Date().getTime();
      _startTime += _delayTime;

      for (var property in _valuesEnd) {

        // check if an Array was provided as property value
        if (_valuesEnd[property] instanceof Array) {

          if (_valuesEnd[property].length === 0) {

            continue;

          }

          // create a local copy of the Array with the start value at the front
          _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

        }

        _valuesStart[property] = _object[property];

        if ((_valuesStart[property] instanceof Array) === false) {
          _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
        }

        _valuesStartRepeat[property] = _valuesStart[property] || 0;

      }

      return this;

    };

    this.stop = function() {

      if (!_isPlaying) {
        return this;
      }

      TWEEN.remove(this);
      _isPlaying = false;

      if (_onStopCallback !== null) {

        _onStopCallback.call(_object);

      }

      this.stopChainedTweens();
      return this;

    };

    this.stopChainedTweens = function() {

      for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {

        _chainedTweens[i].stop();

      }

    };

    this.delay = function(amount) {

      _delayTime = amount;
      return this;

    };

    this.repeat = function(times) {

      _repeat = times;
      return this;

    };

    this.yoyo = function(yoyo) {

      _yoyo = yoyo;
      return this;

    };


    this.easing = function(easing) {

      _easingFunction = easing;
      return this;

    };

    this.interpolation = function(interpolation) {

      _interpolationFunction = interpolation;
      return this;

    };

    this.chain = function() {

      _chainedTweens = arguments;
      return this;

    };

    this.onStart = function(callback) {

      _onStartCallback = callback;
      return this;

    };

    this.onUpdate = function(callback) {

      _onUpdateCallback = callback;
      return this;

    };

    this.onComplete = function(callback) {

      _onCompleteCallback = callback;
      return this;

    };

    this.onStop = function(callback) {

      _onStopCallback = callback;
      return this;

    };

    this.update = function(time) {

      var property;

      if (time < _startTime) {

        return true;

      }

      if (_onStartCallbackFired === false) {

        if (_onStartCallback !== null) {

          _onStartCallback.call(_object);

        }

        _onStartCallbackFired = true;

      }

      var elapsed = (time - _startTime) / _duration;
      elapsed = elapsed > 1 ? 1 : elapsed;

      var value = _easingFunction(elapsed);

      for (property in _valuesEnd) {

        var start = _valuesStart[property] || 0;
        var end = _valuesEnd[property];

        if (end instanceof Array) {

          _object[property] = _interpolationFunction(end, value);

        } else {

          // Parses relative end values with start as base (e.g.: +10, -3)
          if (typeof (end) === "string") {
            end = start + parseFloat(end, 10);
          }

          // protect against non numeric properties.
          if (typeof (end) === "number") {
            _object[property] = start + (end - start) * value;
          }

        }

      }

      if (_onUpdateCallback !== null) {

        _onUpdateCallback.call(_object, value);

      }

      if (elapsed == 1) {

        if (_repeat > 0) {

          if (isFinite(_repeat)) {
            _repeat--;
          }

          // reassign starting values, restart by making startTime = now
          for (property in _valuesStartRepeat) {

            if (typeof (_valuesEnd[property]) === "string") {
              _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
            }

            if (_yoyo) {
              var tmp = _valuesStartRepeat[property];
              _valuesStartRepeat[property] = _valuesEnd[property];
              _valuesEnd[property] = tmp;
            }

            _valuesStart[property] = _valuesStartRepeat[property];

          }

          if (_yoyo) {
            _reversed = !_reversed;
          }

          _startTime = time + _delayTime;

          return true;

        } else {

          if (_onCompleteCallback !== null) {

            _onCompleteCallback.call(_object);

          }

          for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {

            _chainedTweens[i].start(time);

          }

          return false;

        }

      }

      return true;

    };

  };


  TWEEN.Easing = {

    Linear: {

      None: function(k) {

        return k;

      }

    },

    Quadratic: {

      In: function(k) {

        return k * k;

      },

      Out: function(k) {

        return k * (2 - k);

      },

      InOut: function(k) {

        if ((k *= 2) < 1) return 0.5 * k * k;
        return -0.5 * (--k * (k - 2) - 1);

      }

    },

    Cubic: {

      In: function(k) {

        return k * k * k;

      },

      Out: function(k) {

        return --k * k * k + 1;

      },

      InOut: function(k) {

        if ((k *= 2) < 1) return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);

      }

    },

    Quartic: {

      In: function(k) {

        return k * k * k * k;

      },

      Out: function(k) {

        return 1 - (--k * k * k * k);

      },

      InOut: function(k) {

        if ((k *= 2) < 1) return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2) * k * k * k - 2);

      }

    },

    Quintic: {

      In: function(k) {

        return k * k * k * k * k;

      },

      Out: function(k) {

        return --k * k * k * k * k + 1;

      },

      InOut: function(k) {

        if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);

      }

    },

    Sinusoidal: {

      In: function(k) {

        return 1 - Math.cos(k * Math.PI / 2);

      },

      Out: function(k) {

        return Math.sin(k * Math.PI / 2);

      },

      InOut: function(k) {

        return 0.5 * (1 - Math.cos(Math.PI * k));

      }

    },

    Exponential: {

      In: function(k) {

        return k === 0 ? 0 : Math.pow(1024, k - 1);

      },

      Out: function(k) {

        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);

      },

      InOut: function(k) {

        if (k === 0) return 0;
        if (k === 1) return 1;
        if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);

      }

    },

    Circular: {

      In: function(k) {

        return 1 - Math.sqrt(1 - k * k);

      },

      Out: function(k) {

        return Math.sqrt(1 - (--k * k));

      },

      InOut: function(k) {

        if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

      }

    },

    Elastic: {

      In: function(k) {

        var s,
          a = 0.1,
          p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
          a = 1;
          s = p / 4;
        }
        else
          s = p * Math.asin(1 / a) / (2 * Math.PI);
        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

      },

      Out: function(k) {

        var s,
          a = 0.1,
          p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
          a = 1;
          s = p / 4;
        }
        else
          s = p * Math.asin(1 / a) / (2 * Math.PI);
        return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

      },

      InOut: function(k) {

        var s,
          a = 0.1,
          p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
          a = 1;
          s = p / 4;
        }
        else
          s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

      }

    },

    Back: {

      In: function(k) {

        var s = 1.70158;
        return k * k * ((s + 1) * k - s);

      },

      Out: function(k) {

        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;

      },

      InOut: function(k) {

        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

      }

    },

    Bounce: {

      In: function(k) {

        return 1 - TWEEN.Easing.Bounce.Out(1 - k);

      },

      Out: function(k) {

        if (k < (1 / 2.75)) {

          return 7.5625 * k * k;

        } else if (k < (2 / 2.75)) {

          return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;

        } else if (k < (2.5 / 2.75)) {

          return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;

        } else {

          return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

        }

      },

      InOut: function(k) {

        if (k < 0.5) return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
        return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

      }

    }

  };

  TWEEN.Interpolation = {

    Linear: function(v, k) {

      var m = v.length - 1,
        f = m * k,
        i = Math.floor(f),
        fn = TWEEN.Interpolation.Utils.Linear;

      if (k < 0) return fn(v[0], v[1], f);
      if (k > 1) return fn(v[m], v[m - 1], m - f);

      return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

    },

    Bezier: function(v, k) {

      var b = 0,
        n = v.length - 1,
        pw = Math.pow,
        bn = TWEEN.Interpolation.Utils.Bernstein, i;

      for (i = 0; i <= n; i++) {
        b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
      }

      return b;

    },

    CatmullRom: function(v, k) {

      var m = v.length - 1,
        f = m * k,
        i = Math.floor(f),
        fn = TWEEN.Interpolation.Utils.CatmullRom;

      if (v[0] === v[m]) {

        if (k < 0)
          i = Math.floor(f = m * (1 + k));

        return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

      } else {

        if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
        if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);

        return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

      }

    },

    Utils: {

      Linear: function(p0, p1, t) {

        return (p1 - p0) * t + p0;

      },

      Bernstein: function(n, i) {

        var fc = TWEEN.Interpolation.Utils.Factorial;
        return fc(n) / fc(i) / fc(n - i);

      },

      Factorial: (function() {

        var a = [1];

        return function(n) {

          var s = 1, i;
          if (a[n]) return a[n];
          for (i = n; i > 1; i--) s *= i;
          return a[n] = s;

        };

      })(),

      CatmullRom: function(p0, p1, p2, p3, t) {

        var v0 = (p2 - p0) * 0.5,
          v1 = (p3 - p1) * 0.5,
          t2 = t * t,
          t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

      }

    }

  };



});



