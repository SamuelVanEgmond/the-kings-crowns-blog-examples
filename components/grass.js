/* global AFRAME */
/* global THREE */
/* global GrassMapGenerator */
/* global FlexShader */

"use strict";

// Create an A-Frame grass component to use in the scene
AFRAME.registerComponent("grass", {

  schema: { 
    tuftCount:    { default: 25000 },
    grassMapSize: { default: 512 },
    maxElevation: { default: 0.02 }
  },

  init: function () {
    const terrain = document.querySelector('[terrain]').components['terrain'] 
    const heightField = terrain.heightField;
    const terrainMap = terrain.terrainMap;

    // The lightmap is queried to darken grass in the shadows
    // So get the image data for easy access
    const lightMap = terrain.lightMap;
    const ctxLight = lightMap.getContext('2d', { willReadFrequently:true });
    const imageDataLight = ctxLight.getImageData(0, 0, lightMap.width, lightMap.height);
    const lightData = imageDataLight.data;     

    const grassMap = GrassMapGenerator.generateGrassMap(this.data.grassMapSize);

    const locations = this._determineLocations(heightField);

    // Create the grass mesh and add extra grass tuft shadows to the terrainMap
    let grassMesh = this._createMesh(locations, heightField, lightData, grassMap, terrainMap);

    // Set the mesh on the entity,
    this.el.setObject3D('grass', grassMesh);
  },  

  tick: function (time, timedelta) {
    FlexShader.uniforms.time.value = time/750;
    this.el.sceneEl.camera.getWorldPosition(FlexShader.uniforms.playerpos.value);

    // For debugging move the player position in the grass
    //FlexShader.uniforms.playerpos.value.x += 3;
  },

  _createMesh(locations, heightField, lightData, grassMap, terrainMap) {

    // The GrassMeshCreator draws grass shadows directly on the terrain map 
    // It has a higher resolution than the light map and this won't interfere with the lightmap
    let ctxTerrain = terrainMap.getContext('2d', { willReadFrequently:true });

    ctxTerrain.save();

    // Begin path for all grass shadows
    ctxTerrain.beginPath();    

    let mesh = this._createMeshForLocations(locations, heightField, lightData, grassMap, ctxTerrain); 

    // Draw all shadows at once
    ctxTerrain.strokeStyle = 'rgba(0,0,0,0.25)';
    ctxTerrain.lineWidth = 2;
    ctxTerrain.lineCap = 'round';
    ctxTerrain.stroke();     
    ctxTerrain.restore();    

    return mesh;
  },

  _determineLocations(heightField, objectTracker) {

    let locations = [];
    for (let l=0; l<this.data.tuftCount; l++) {
      let x = 0;
      let y = 0;
      let z = 0;

      // Generate locations, up to the maximum elevation with less grass higher up
      do {
        x = Math.random() * heightField.size;
        z = Math.random() * heightField.size;
        y = heightField.getHeight(x, z);
      } while(y > Math.random() * heightField.size * this.data.maxElevation)

      locations.push({ x, y,z });
    }

    return locations;
  },

  _createMeshForLocations(locations, heightField, lightData, grassMap, ctxTerrain) {
    let geometry = new THREE.BufferGeometry();

    const position = new Float32Array( locations.length * 4 * 3);
    const color    = new Float32Array( locations.length * 4 * 3);
    const uv       = new Float32Array( locations.length * 4 * 2);

    // Add a flex attribute that determines whether the vertex can flex from the wind
    const flex     = new Float32Array( locations.length * 4 * 1);

    const index    = [];

    let posi   = 0;
    let coli   = 0;
    let uvi    = 0;    
    let flexi  = 0;
    let indexi = 0;

    // Calculate resolution conversions
    const worldToMap   = ctxTerrain.canvas.width / heightField.size;
    const lightMapSize = Math.sqrt(lightData.length/4); // lightData contains RGBA bytes
    const worldToLight = lightMapSize / heightField.size;

    const tuftColor = { r:1, g:1, b:1 };

    for (let l=0; l<locations.length; l++) {
      let x = locations[l].x;
      let y = locations[l].y;
      let z = locations[l].z;

      let rotation = Math.random()*Math.PI*2;
      let scale = 0.75 + Math.random()/2;
      let sin = Math.sin(rotation);
      let cos = Math.cos(rotation);

      // Varying the tuft color makes for a less artificial look
      tuftColor.r = 1 + Math.random()**2;
      tuftColor.g = 1;
      tuftColor.b = 1 - Math.random()**2;

      // Predefined vertices that will be scaled, moved and rotated
      let vertices = [ { x:-0.3, y:0.00, z:-0.3, u:0, v:0.00 },
                       { x:-0.3, y:0.85, z:-0.3, u:0, v:0.95 }, 
                       { x: 0.3, y:0.85, z: 0.3, u:1, v:0.95 }, 
                       { x: 0.3, y:0.00, z: 0.3, u:1, v:0.00 } 
                     ];

      // Vary the width an height a bit as well as the scale
      let xOffset = (0.75 + Math.random()*0.5);
      let zOffset = (0.75 + Math.random()*0.5);

      // Loop over the 4 predefined vertices and move  / rotate them
      for (let i=0; i<4; i++) {
        let v = vertices[i];

        // Grass size is in world units!! I.e. bigger world same size grass
        const vx = v.x * scale * xOffset;
        const vz = v.z * scale * zOffset;
        v.x  = cos*vx - vz*sin;
        v.z  = sin*vx + vz*cos;
        v.y = (i === 1 || i === 2 ? v.y*scale : 0);

        // Get the terrain light & shadows at this location, squared to make the shadows more pronounced
        const light = (lightData[(Math.round(worldToLight * z)*lightMapSize + Math.round(worldToLight * x))*4] / 255) ** 2;

        // The terrain is centered around 0,0,0, so move the grass half the terrain size
        position[posi++] = v.x + (x-heightField.size/2);
        position[posi++] = v.y + (heightField.getHeight(x + v.x, z + v.z));
        position[posi++] = v.z + (z-heightField.size/2);

        // Per vertex set the tuft color as vertex color
        color[coli++] = tuftColor.r * light;
        color[coli++] = tuftColor.g * light;
        color[coli++] = tuftColor.b * light;

        // Set the grass map uv's
        uv[uvi++] = v.u;
        uv[uvi++] = v.v;

        // The flex attribute determines how far the grass flexes, 0 at ground level, more for higher tufts
        flex[flexi++] = v.y;   

        // Create the two triangle faces
        index[indexi++] = l * 4 + 0;
        index[indexi++] = l * 4 + 1;
        index[indexi++] = l * 4 + 2;

        index[indexi++] = l * 4 + 2;
        index[indexi++] = l * 4 + 3;
        index[indexi++] = l * 4 + 0;        
      }

      // Draw grass shadows on the terrain texture      
      let v0 = vertices[0];
      let v1 = vertices[1];
      let v2 = vertices[2];
      let v3 = vertices[3];

      // I had beginPath and stroke around these lines in the loop
      // That gave WebGL context lost errors which I assumed was due to to many canvases
      // Still no idea why you get errors with beginPath and stroke here!?
      for (let s=0; s<=1; s+=0.05) {
        ctxTerrain.moveTo(worldToMap * (x + v0.x * (1-s) + v3.x * s + (Math.random()*0.2-0.1)) , 
                          worldToMap * (z + v0.z * (1-s) + v3.z * s + (Math.random()*0.2-0.1)));
        ctxTerrain.lineTo(worldToMap * (x + v0.x * (1-s) + v3.x * s - (0.3+Math.random()*0.3)*scale), 
                          worldToMap * (z + v0.z * (1-s) + v3.z * s - (0.3+Math.random()*0.3)*scale));
      }
    } 

    // Set the geometry attribute buffers
    // Since this is MeshBAsicMaterial, no need for normals
    // Since we are using textures no need for colors
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3) );
    geometry.setAttribute( 'color',    new THREE.Float32BufferAttribute( color, 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.setAttribute( 'flex',     new THREE.Float32BufferAttribute( flex, 1) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( index );

    // Add the groups for each material
    geometry.addGroup(0, index.length, 0);

    geometry.computeBoundingBox();

    // Create the grass material double sides, 
    // using alphaTest and alphaToCoverage for best effect
    let material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      vertexColors: true, 
      color: new THREE.Color(1,1,1),
      alphaTest: 0.1,
      alphaToCoverage: true,
      map: (function() {
        let texture = new THREE.CanvasTexture(grassMap);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.premultiplyAlpha = true;
        return texture;
      }).bind(this)()            
    });   

    // Use the FlexShader.shaderModifier to change the shader behavior for the MeshBasicMaterial
    material.onBeforeCompile = FlexShader.shaderModifier;

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

});      
