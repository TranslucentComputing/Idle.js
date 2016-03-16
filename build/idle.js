(function() {
  "use strict";
  var Idle;

  Idle = {};

  Idle = (function() {
    Idle.isAway = false;

    Idle.awayTimeout = 3000;

    Idle.awayTimestamp = 0;

    Idle.awayTimer = null;

    Idle.onAway = null;

    Idle.onAwayBack = null;

    Idle.onVisible = null;

    Idle.onHidden = null;

    function Idle(options) {
      var activity;
      if (options) {
        this.awayTimeout = parseInt(options.awayTimeout, 10);
        this.onAway = options.onAway;
        this.onAwayBack = options.onAwayBack;
        this.onVisible = options.onVisible;
        this.onHidden = options.onHidden;
      }
      activity = this;
      this.activeMethod = function() {
        return activity.onActive();
      };
      window.addEventListener("onclick", this.activeMethod);
      window.addEventListener("onmousemove", this.activeMethod);
      window.addEventListener("onmouseenter", this.activeMethod);
      window.addEventListener("onkeydown", this.activeMethod);
      window.addEventListener("onscroll", this.activeMethod);
      window.addEventListener("onmousewheel", this.activeMethod);
      window.addEventListener("ontouchmove", this.activeMethod);
      window.addEventListener("ontouchstart", this.activeMethod);
    }

    Idle.prototype.onActive = function() {
      this.awayTimestamp = new Date().getTime() + this.awayTimeout;
      if (this.isAway) {
        if (this.onAwayBack) {
          this.onAwayBack();
        }
        this.start();
      }
      this.isAway = false;
      return true;
    };

    Idle.prototype.start = function() {
      var activity;
      if (!this.listener) {
        this.listener = (function() {
          return activity.handleVisibilityChange();
        });
        document.addEventListener("visibilitychange", this.listener, false);
        document.addEventListener("webkitvisibilitychange", this.listener, false);
        document.addEventListener("msvisibilitychange", this.listener, false);
      }
      this.awayTimestamp = new Date().getTime() + this.awayTimeout;
      if (this.awayTimer !== null) {
        clearTimeout(this.awayTimer);
      }
      activity = this;
      this.awayTimer = setTimeout((function() {
        return activity.checkAway();
      }), this.awayTimeout + 100);
      return this;
    };

    Idle.prototype.stop = function() {
      window.removeEventListener("onclick", this.activeMethod);
      window.removeEventListener("onmousemove", this.activeMethod);
      window.removeEventListener("onmouseenter", this.activeMethod);
      window.removeEventListener("onkeydown", this.activeMethod);
      window.removeEventListener("onscroll", this.activeMethod);
      window.removeEventListener("onmousewheel", this.activeMethod);
      window.removeEventListener("ontouchmove", this.activeMethod);
      window.removeEventListener("ontouchstart", this.activeMethod);
      if (this.awayTimer !== null) {
        clearTimeout(this.awayTimer);
      }
      if (this.listener !== null) {
        document.removeEventListener("visibilitychange", this.listener);
        document.removeEventListener("webkitvisibilitychange", this.listener);
        document.removeEventListener("msvisibilitychange", this.listener);
        this.listener = null;
      }
      return this;
    };

    Idle.prototype.setAwayTimeout = function(ms) {
      this.awayTimeout = parseInt(ms, 10);
      return this;
    };

    Idle.prototype.checkAway = function() {
      var activity, t;
      console.log("Started Check Away");
      t = new Date().getTime();
      if (t < this.awayTimestamp) {
        console.log("Not Away");
        this.isAway = false;
        activity = this;
        this.awayTimer = setTimeout((function() {
          return activity.checkAway();
        }), this.awayTimestamp - t + 100);
        return;
      }
      console.log("Away");
      if (this.awayTimer !== null) {
        console.log("Clear away timer");
        clearTimeout(this.awayTimer);
      }
      this.isAway = true;
      if (this.onAway) {
        console.log("Running onAway");
        return this.onAway();
      }
    };

    Idle.prototype.handleVisibilityChange = function() {
      if (document.hidden || document.msHidden || document.webkitHidden) {
        if (this.onHidden) {
          return this.onHidden();
        }
      } else {
        if (this.onVisible) {
          return this.onVisible();
        }
      }
    };

    return Idle;

  })();

  if (typeof define === 'function' && define.amd) {
    define([], Idle);
  } else if (typeof exports === 'object') {
    module.exports = Idle;
  } else {
    window.Idle = Idle;
  }

}).call(this);
