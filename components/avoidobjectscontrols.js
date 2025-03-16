/* global AFRAME */
/* global THREE */

"use strict";

// This component moves the player out of the way in case of a collision with an object
AFRAME.registerComponent('avoidobjectscontrols', {
  schema: {
   // The player cylinder radius 
   radius: { default: 0.1 }          
  },

  init: function () {
    // Store all relevant info for performance
    this.cameraRigEl = document.querySelector('#camerarig');
    this.cameraRig = this.cameraRigEl.object3D;
    this.cameraEl = document.querySelector('[camera]');
    this.camera = this.cameraEl.object3D;
    this.cameraPosition = new THREE.Vector3();
    this.objectTracker = this.el.sceneEl.systems['objecttracker'];          
  },

  tick: function (time, timeDelta) {
    let playerX = this.cameraRig.position.x;
    let playerZ = this.cameraRig.position.z;

    // Find the nearest object at max 4 meters distance (for speed)
    let nearest = this.objectTracker.getNearestObject(playerX, playerZ, 4);
    if (nearest) {
      let dx = playerX - nearest.x;
      let dz = playerZ - nearest.y;
      let distance = Math.sqrt(dx * dx + dz * dz);
      let overlap = nearest.radius + this.data.radius - distance;

      // Check if the player / camera circle overlaps with the nearest object circle
      if (overlap > 0) {

        // Move the camera away from the object so the circles just touch
        let angle = Math.atan2(dz, dx);
        this.cameraRig.position.x = nearest.x + (nearest.radius + this.data.radius) * Math.cos(angle);
        this.cameraRig.position.z = nearest.y + (nearest.radius + this.data.radius) * Math.sin(angle);
      }     
    }
  }
});   