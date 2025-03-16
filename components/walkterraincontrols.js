/* global AFRAME */
/* global THREE */

"use strict";

AFRAME.registerComponent('walkterraincontrols', {
  schema: {
   fly: { default: false }          
  },
  init: function () {
    this.heightField = document.querySelector('[terrain]').components['terrain'].heightField;
    this.cameraRigEl = document.querySelector('#camerarig');
    this.cameraRig = this.cameraRigEl.object3D;
    this.cameraEl = document.querySelector('[camera]');
    this.camera = this.cameraEl.object3D;
    this.cameraPosition = new THREE.Vector3();
  },

  update: function () {},

  tick: function (time, timeDelta) {
    // Determine the terrain height at the location of the player
    let groundLevel = this.getGroundLevel();

    // Move the player up or down according to the terrain height
    if (this.data.fly) 
      this.cameraRig.position.y = Math.max(this.cameraRig.position.y, groundLevel);
    else {
      // Don't allow the player to go higher than the maxWalkHeight, gently nudge them down
      // If you change the maxWalkHeight also change the frictionFactor
      const maxWalkHeight = 1;
      const frictionFactor = 0.005;
      if (groundLevel>maxWalkHeight) {
        let normal = this.getGroundNormal();
        this.cameraRig.position.x += normal.x * timeDelta * (groundLevel-maxWalkHeight) * frictionFactor;
        this.cameraRig.position.z += normal.z * timeDelta * (groundLevel-maxWalkHeight) * frictionFactor;
      }     

      // Set the player back on the ground in the current/new position
      this.cameraRig.position.y = this.getGroundLevel();
    }
  },

  getGroundLevel() {
    // Determine the terrain height at the location of the camera
    this.el.sceneEl.camera.getWorldPosition(this.cameraPosition);
    return this.heightField.getHeight(this.cameraPosition.x + this.heightField.size/2, 
                                      this.cameraPosition.z + this.heightField.size/2);
  },

  getGroundNormal() {
    // Determine the terrain normal at the location of the camera
    this.el.sceneEl.camera.getWorldPosition(this.cameraPosition);
    return this.heightField.getNormal(this.cameraPosition.x + this.heightField.size/2, 
                                      this.cameraPosition.z + this.heightField.size/2);
  }
});
