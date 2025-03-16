/* global AFRAME */
/* global THREE */

"use strict";

AFRAME.registerSystem('timeofday', {
  init: function () {
    this.ambientLight = new THREE.Color(1,1,1);
    this.dayState = 'day';
    this.timeOfDay = 0.5;
  },

  tick: function (time, timeDelta) {
    let cameraPosition = new THREE.Vector3();
    this.el.sceneEl.camera.getWorldPosition(cameraPosition);

    // Check if the player passes through the sun gate (positioned at (0,0,0) )
    let playerInSunGate = Math.abs(cameraPosition.x)<1 && Math.abs(cameraPosition.z)<0.25;
    
    // Handle changing between night and day and vice versa
    this.handleDayAndNight(playerInSunGate, timeDelta, time);
  },

  // Handle the Day to Night or Night to Day transition
  handleDayAndNight(playerInSunGate, timeDelta, time) {
    switch (this.dayState) {
      case 'day': {
        this.dayState = playerInSunGate ? 'toNight' : 'day';
        break;
      }
      case 'night': {
        this.dayState = playerInSunGate ? 'toDay' : 'night';
        break;
      }
      case 'toDay': {
        this.timeOfDay += timeDelta/10000; 
        if (this.timeOfDay >= 0.5) {
          this.timeOfDay = 0.5;
          this.dayState = 'day';
        }
        break;
      }
      case 'toNight': {
        this.timeOfDay += timeDelta/10000; 
        if (this.timeOfDay >= 1) {
          this.timeOfDay = 0;
          this.dayState = 'night';
        }
        break;
      }
    }

    this.setTimeOfDay(time, this.timeOfDay);
  },     

  // Change the time of day during a transition
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
