/* global AFRAME */
/* global THREE */

"use strict";

AFRAME.registerComponent('ambientlight', {
  tick: function() {
    // Overrule the material colors so they use the day/night ambient light instead
    let ambientLight = this.el.sceneEl.systems['timeofday'].ambientLight;
    let object3D = this.el.object3D;
    let el = this.el;
    object3D.traverse(function (node) {
      if (node.material) {
        // One mesh can have multiple materials or just one
        if(Array.isArray(node.material)) {
          for (let m=0; m<node.material.length; m++) {
            node.material[m].color = ambientLight;
          };
        } 
        else {
          node.material.color = ambientLight;
        }
      }
    });

    // Replace the material color only once after everything is initialized
    this.el.removeAttribute('ambientlight');
  }
});