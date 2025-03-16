/* global AFRAME */

"use strict";

// Add follow component to the skydome entity so it stays centered over the camera
AFRAME.registerComponent('follow', {
  tick: function (time, timeDelta) {
    this.el.sceneEl.camera.getWorldPosition(this.el.object3D.position);
  }
});