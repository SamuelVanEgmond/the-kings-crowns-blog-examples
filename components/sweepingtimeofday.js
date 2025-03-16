/* global AFRAME */
/* global THREE */

"use strict";

AFRAME.registerSystem('timeofday', {
  init: function () {
    this.ambientLight = new THREE.Color(1,1,1);
  },

  tick: function (time, timeDelta) {
    this.setTimeOfDay(time, Math.abs((((time + 20000) / 40000) % 2) - 1));
  },

  setTimeOfDay(time, timeOfDay) {
    let day = 0.5-Math.cos(timeOfDay*Math.PI*2)/2;
    let night = 1-day;

    // Set the ambient light to (0.05, 0.1, 1.15) for night and (1,1,1) for day
    this.ambientLight.set(night*0.05 + day*1,night*0.1 + day*1,night*0.15 + day*1);    

    // Change the fog from light to dark
    let scene = document.getElementById("scene");
    scene.setAttribute('fog', 'color', `rgba(${Math.round(day*187)}, ${Math.round(day*204)}, ${Math.round(day*221)}, 1)`);

    // Set the time of day
    let sky = document.getElementById("sky");
    sky.setAttribute('material', 'timeofday', day);

    // Setting the timeofday attribute also sets the time, so the automatic A-Frame time parameter does not work
    sky.setAttribute('material', 'time', time);
  }

});
