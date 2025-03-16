/* global AFRAME */
/* global THREE */
/* global SVOX */

"use strict";

AFRAME.registerComponent('stones', {
  schema: {
   count: { default: 100 }          
  },

  init: function () {

    const heightField = document.querySelector('[terrain]').components['terrain'].heightField;
    const terrainMap = document.querySelector('[terrain]').components['terrain'].terrainMap;

    this.worldToMap = terrainMap.width / heightField.size;
    this.center     = heightField.size/2;

    // Draw the stone shadows directly on the terrain map for higher resolution / sharper shadows
    let ctxTerrain = terrainMap.getContext('2d', { willReadFrequently:true });
    ctxTerrain.save();

    // Begin path for all shadows
    ctxTerrain.beginPath();    

    // Add the legs of the Sun Gate to the object tracker to prevent overlapping blocks and for collision detection
    const objectTracker = this.el.sceneEl.systems['objecttracker'];
    objectTracker.addObject(-1.5, 0, 0.75);
    objectTracker.addObject( 1.5, 0, 0.75);

    // Create a lot of stones, laying in the terrain
    let stones = "";
    for (let l = 0; l < this.data.count; l++) {
      let x = 0;
      let y = 0;
      let z = 0;

      // Generate locations, up to the maximum elevation with less stones higher up
      do {
        x = (Math.random() - 0.5) * heightField.size;
        z = (Math.random() - 0.5) * heightField.size;
        y = heightField.getHeight(x + this.center, z + this.center);
      } while((y > Math.random() * heightField.size * 0.005) ||
              objectTracker.getNearestObject(x,z,2))

      // Add this stone to the object tracker  
      objectTracker.addObject(x, z, 0.75);

      // Add the new stone with a random color at the right position to the model
      let color = ['C88', '8C8', '88C', 'CC8', 'C8C'][Math.floor(Math.random()*5)];
      stones += `group clone = Stone, position = ${x} ${y} ${z}, recolor = A:#${color}\n`;

      this.drawShadow(ctxTerrain, x, 0, z);
    }      

    // Add the shadows for the Sun Gate stones
    this.drawShadow(ctxTerrain, -1.5, 0, 0);
    this.drawShadow(ctxTerrain, -1.5, 1, 0);
    this.drawShadow(ctxTerrain, -1.5, 2, 0);
    this.drawShadow(ctxTerrain, -1.5, 3, 0);
    this.drawShadow(ctxTerrain, -1.5, 4, 0);
    this.drawShadow(ctxTerrain, -0.5, 4, 0);
    this.drawShadow(ctxTerrain,  0.5, 4, 0);
    this.drawShadow(ctxTerrain,  1.5, 4, 0);
    this.drawShadow(ctxTerrain,  1.5, 3, 0);
    this.drawShadow(ctxTerrain,  1.5, 2, 0);
    this.drawShadow(ctxTerrain,  1.5, 1, 0);
    this.drawShadow(ctxTerrain,  1.5, 0, 0);

    // Draw all shadows at once
    ctxTerrain.fillStyle = 'rgba(0,0,0,0.3)';    
    ctxTerrain.fill();

    ctxTerrain.restore();    

    SVOX.models.Stones = `
      // A simple small bump texture for the stones 
      texture id = Stone, cube = false, size = 64 64, borderoffset = 0.5, image = data:image/webp;base64,UklGRpIDAABXRUJQVlA4WAoAAAAIAAAAPwAAPwAAVlA4IJYCAABQEQCdASpAAEAAPjUaikMhBEEzBQDRPSdw9Ab+FWUAtQRol0u1xZJoGOygJaxNtNHp+BZ7TP6+j5uKEp5/If/wc+t6hfNlq7jaM4HvW3QTuN1uLyS6hb6Qw7c1RkDOYExi+YHxdh4WXGk743yo83oJdDbS60IZ7KsVq0/0/uAu3DIj23StV11wmT2DChtVpGQdAIAA/vzSLljybjpA6eZvI15csPZttGDoaGKyKgvNdQB3VyMuEHJw+qgap6f8o9C1rtsdCLfGZm68WG79t0TENr94g3FdzFPfqM3zYmEisCEHZaERaRyP8vG/TIoBMKI01XTeM+ho3dskmRspGmYguWC/l5MpDzci56UFQlo6U7LNrVZeWXGb0qwb/mBZ2entHLQOjtBUH7+qgBprHDl0sVQWWVEOATq8xQju9oF2PJ0XUC/RTQcDPF0nS1esbo+BBUevsk2R4H92Mg0nT9vs3/poSSfGFYPj9sVBndnAtdwau+2FM7bMuHK61K/dy0okTd8qXpEwPSn4FcTKit2Pi/2T73u7XUFWJ7vv1eIL8IoyV/pdSTN601cCGdCOB0XHM0njb4sTJOl+zAfDAyiqyjTmC0TgYu0qXZIBN1Kzkhud1x5+mV/FAxrstlfINDMqafFMPLUBaeYuHHBrOdQQmerju/XbrzptBByeCWPi1liBsTLx8KBw2q0uGn5JVhEF9ei03FRL+QQyXEAOLajj/8198sR9feIhXobDcurfvkoxZPWQntz7De4xWpzjYsI/mHqsQFFlPmjrRhFqtbwksYUQQPLg12iG1870TsOwAtnn6R6AOYXYSPu5T9hPp4aCPMKrDrWW4suAf+IaHmGGBlbxXNkB5ibMUlGekH9uMggFIzygAEVYSUbWAAAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAwAAADEBAgAQAAAAZgAAAGmHBAABAAAAdgAAAAAAAACjkwAA6AMAAKOTAADoAwAAUGFpbnQuTkVUIDUuMS40AAUAAJAHAAQAAAAwMjMwAaADAAEAAAABAAAAAqAEAAEAAABAAAAAA6AEAAEAAABAAAAABaAEAAEAAAC4AAAAAAAAAAIAAQACAAQAAABSOTgAAgAHAAQAAAAwMTAwAAAAAA==

      model
      size = 10 10 10

      // No real time lighting, but Smooth Voxels supports vertex baked lighting
      light intensity = 0.5  // Ambient light
      light intensity = 0.7, direction =  1 1  1 // Sun / Moon
      light intensity = 0.2, direction = -1 1 -1 // Sky

      // We create a stone prefab from the voxels shown below
      group id = Stone, origin = -y, prefab = true, shape = box, scale = 0.1
      material group = Stone, type = basic, lighting = smooth, deform = 1
               map = Stone, maptransform = 1.5 1.5, fade = true, colors = A:#B97

      // The Sun Gate from cloned stones
      group clone = Stone, position = -1.5 0 0
      group clone = Stone, position = -1.5 1 0
      group clone = Stone, position = -1.5 2 0
      group clone = Stone, position = -1.5 3 0
      group clone = Stone, position = -1.5 4 0
      group clone = Stone, position = -0.5 4 0
      group clone = Stone, position =  0.5 4 0
      group clone = Stone, position =  1.5 4 0
      group clone = Stone, position =  1.5 3 0
      group clone = Stone, position =  1.5 2 0
      group clone = Stone, position =  1.5 1 0
      group clone = Stone, position =  1.5 0 0

      // The other stones strewn around
      ${stones}

      voxels
      AAAAAAAAAA AAAAAAAAAA 6(AA------AA) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(AAAAAAAAAA) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(-AAAAAAAA-) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(AAAAAAAAAA) AAAAAAAAAA AAAAAAAAAA
      AAAAAAAAAA AAAAAAAAAA 6(AA------AA) AAAAAAAAAA AAAAAAAAAA
    `;    

    this.el.setAttribute('svox', 'model:Stones;');
    this.el.setAttribute('ambientlight', '');
  },

  drawShadow: function(ctxTerrain, x, y, z) {
    // Hardcoded shadow for a cube. In The Kings Crowns the stones are rotated, but here all stones are axis aligned
    ctxTerrain.moveTo(this.worldToMap * (this.center + x + 0.5 - y), this.worldToMap * (this.center + z + 0.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x - 0.5 - y), this.worldToMap * (this.center + z + 0.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x - 1.5 - y), this.worldToMap * (this.center + z - 0.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x - 1.5 - y), this.worldToMap * (this.center + z - 1.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x - 0.5 - y), this.worldToMap * (this.center + z - 1.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x + 0.5 - y), this.worldToMap * (this.center + z - 0.5 - y));
    ctxTerrain.lineTo(this.worldToMap * (this.center + x + 0.5 - y), this.worldToMap * (this.center + z + 0.5 - y));
  }
});
