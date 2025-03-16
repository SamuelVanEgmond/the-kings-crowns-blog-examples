/* global AFRAME */
/* global THREE */
/* global Path */
/* global ValueNoise */
/* global HeightField */
/* global TerrainMapGenerator */
/* global LightMapGenerator */

"use strict";

// Create an A-Frame terrain component to use in the scene
AFRAME.registerComponent("terrain", {

  schema: { 
    terrainSize: { default: 256 },
    lightMapSize: { default: 512 },
    terrainMapSize: { default: 4096 },
    waypoints: { default: 100 }
  },

  init: function () {
    this.path = new Path(this.data.waypoints, this.data.terrainSize);
    this.noise = new ValueNoise(this.data.terrainMapSize / 8);
    this.heightField = new HeightField(this.path, this.data.terrainSize, this.noise);
    this.terrainMap = TerrainMapGenerator.generateTerrainMap(this.heightField, this.data.terrainMapSize, this.noise);
    this.lightMap = LightMapGenerator.generateLightMap(this.heightField, this.data.lightMapSize);
    this.firstTick = true;
  },
  
  tick() {
    // Only the first time combine the lightmap and the terrain map after trees added the shadows
    if (this.firstTick) {
      // Multiply the lightmap and the terrain map
      const ctx = this.terrainMap.getContext('2d');
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(this.lightMap, 0, 0, this.data.terrainMapSize, this.data.terrainMapSize);  

      // Create the terrain mesh from the heightfield and set the terrain map canvas as texture
      let terrainMesh = this.createMesh(this.heightField, this.terrainMap);

      // Set the mesh on the entity,
      this.el.setObject3D('terrain', terrainMesh);
      
      this.firstTick = false;
    }
  },

  createMesh(heightField, terrainMapCanvas) {

    const terrainSize = this.data.terrainSize;

    // Create a BufferGeometry geometry and Float32Arrays with the correct lengths
    let geometry = new THREE.BufferGeometry();
    let position = new Float32Array( (terrainSize + 1) * (terrainSize + 1) * 3);
    let uv       = new Float32Array( (terrainSize + 1) * (terrainSize + 1) * 2);

    let posi = 0;
    let uvi  = 0;

    for (let z = 0; z <= terrainSize; z++) {
      for (let x = 0; x <= terrainSize; x++) {

        let height = this.heightField.getHeight(x, z);

        // Set the vertex positions
        position[posi++] = (x-terrainSize/2);
        position[posi++] = height;
        position[posi++] = (z-terrainSize/2);

        // Set the uv texture coordinates
        uv[uvi++] = x / terrainSize;
        uv[uvi++] = 1 - z / terrainSize;
      }
    }

    let index = [];
    let i = 0;

    for (let z = 0; z < terrainSize; z++) {
      for (let x = 0; x < terrainSize; x++) {

        // Now we have positions for the vertices but we need to create the faces (triangles).
        // One square has two triangles, which we need to create by adding the vertices in the correct order
        index[i++] = (z    ) * (terrainSize + 1) + (x + 1);
        index[i++] = (z    ) * (terrainSize + 1) + (x    );
        index[i++] = (z + 1) * (terrainSize + 1) + (x    );

        index[i++] = (z + 1) * (terrainSize + 1) + (x    );
        index[i++] = (z + 1) * (terrainSize + 1) + (x + 1);
        index[i++] = (z    ) * (terrainSize + 1) + (x + 1);
      }
    }

    // Set the geometry attribute buffers
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.setIndex( index );

    // Add the groups for each material, in this case only one material
    geometry.addGroup(0, index.length, 0);

    // Create a bounding box so the renderer can skip the object when it is out of view
    geometry.computeBoundingBox();

    // Create the terrain material
    let material = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      vertexColors: false,  // No more vertex colors needed
      color: new THREE.Color(1,1,1),  // Set to white since we're using a texture !!
      map: (function() {
        let texture = new THREE.CanvasTexture(terrainMapCanvas);
        texture.colorSpace = THREE.SRGBColorSpace
        return texture;
      }).bind(this)()            
    });
    
    // Create the mesh from the geometry and the material (for multiple materials use an array)
    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

});      
