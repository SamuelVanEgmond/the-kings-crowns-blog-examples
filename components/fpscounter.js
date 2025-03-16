/* global AFRAME */

"use strict";

// The fpscounter shows the most important stats in the scene:
//   fps: frames per second 
// calls: number of draw calls
//  tris: number of triangles rendered (note: x 2 in VR!)
// Usage: <a-scene fpscounter> for HUD fps 

// OR <a-text fpscounter position="0 2 0" width="1"></a-text> to show static in scene
// In the latter case only value and color text properties are set, rest can be used as usual

AFRAME.registerComponent('fpscounter', {
  schema: { 
    // Set full:false to show only fps
    full: { type: 'boolean', default: true }
  },
  
  init: function () {
    if (!this.el.sceneEl.renderer || !this.el.sceneEl.camera) {
      return;
    }

    if (this.el.tagName === 'A-TEXT') {
      // Use the text on which the fpscounter is set
      this.text = this.el;
    }
    else {
      // Attach a text element to the camera
      this.text = document.createElement("a-text");
      this.text.setAttribute("position", this.data.full ? "-0.04 0.05 -0.25" : "0 0.05 -0.25");
      this.text.setAttribute("rotation", "15 0 0");
      this.text.setAttribute("width", "0.25");
      this.text.setAttribute("align", this.data.full ? "left" : "center");
      this.text.setAttribute("anchor", "align");
      this.text.setAttribute("font", "sourcecodepro");
      this.el.sceneEl.camera.el.appendChild(this.text);
    }
    
    this.minFps = 45;
    this.expectedFps = 58;
    if (window.navigator.userAgent.includes('Quest')) {
      this.minFps = 55;
      this.expectedFps = 88;      
    }
    
    this.frameCount = 0;
    this.lastTime = 0;    
  },
  
  tick: function () {
    if (!this.text) {
      // In case the camera was not intialized yet just try it again
      this.init();
    }
    else {
      this.frameCount++;
      let now = Math.round((new Date()).getTime());

       // Update the information every 0.5 seconds
      if (now - this.lastTime > 500) {
        
        // Determine the fps
        let fps = Math.round(1000*this.frameCount/(now-this.lastTime)) || '';
        
        if (this.data.full) {
          // Get the draw calls and tirangles from the render info
          let calls = this.el.sceneEl.renderer.info.render.calls;
          let triangles = this.el.sceneEl.renderer.info.render.triangles;
          this.text.setAttribute('value', `‎ ‎ fps: ${fps}\r\ncalls: ${calls}\r\n‎ tris: ${triangles}`);
        }
        else {
          this.text.setAttribute('value', `${fps}`);
        }

        // Set the color depending on the fps
        if (fps < this.minFps) 
          this.text.setAttribute('color', '#FF0000'); 
        else if (fps < this.expectedFps) 
          this.text.setAttribute('color', '#FF8000');
        else
          this.text.setAttribute('color', '#00FF00');

        this.frameCount = 0;
        this.lastTime = now;
      }
    }
  },
  
  remove: function () {
    if (this.text) {
      this.text.remove();
    }
  }
});
