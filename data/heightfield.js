"use strict";

class HeightField {
  
  constructor(path, size = 256, noise = null) {
    this.path = path;
    this.size = size;
    this.noise = noise;
    this.heights = this._createHeights();
  }

  // Create the heights in a Float32Array so we don't have to recalculate each time we need it
  _createHeights() { 
    
    // The terrain is size quads wide, so size + 1 vertices wide
    let heights = new Float32Array( (this.size + 1)**2 );
    let maxHeight = 0;
    
    // Create the heights from the distance from the path
    for (let z = 0; z <= this.size; z++) {
      for (let x = 0; x <= this.size; x++) {
        let height = this.path.distanceToPath(x,z);
        heights[z*(this.size+1) + x] = height;
        maxHeight = Math.max(maxHeight, height);
      }
    }

    // Scale the height to exactly 0 - 1 so it can be smooth stepped and scale it back up to size/4
    for (let z = 0; z <= this.size; z++) {
      for (let x = 0; x <= this.size; x++) {
        let height = heights[z*(this.size+1) + x] / maxHeight;

        // Smoothstep the height
        height = height * height * (3 - 2 * height); 
        
        if (this.noise) {
          // Add noise to the terrain for a more natural look
          // Scale the noise with the height itself so valleys are flat and mountains noisy (mountainous)
          // The noise tiles 8 x 8 on the terrain
          let noiseValue = this.noise.get(x / this.size * 8 * this.noise.size, 
                                          z / this.size * 8 * this.noise.size);
          height = Math.max(0, Math.min(1, height + (noiseValue * 0.3 - 0.15) * height));
        }
        
        // Now we scale the heights back to real world units
        heights[z*(this.size+1) + x] = height * this.size/4;
      }
    }

    // Average the heights a bit to get rid of most of the spiked ridges
    for (let z = 1; z < this.size; z++) {
      for (let x = 1; x < this.size; x++) {
        let index = z * (this.size+1) + x;
        heights[index] = (heights[index] + heights[index-1] + heights[index+1] + 
                          heights[index-this.size-1] + heights[index+this.size+1])/5;
      }
    }    

    return heights;
  } 
  
  // Get the height of any point on the map, interpolate between vertices
  getHeight(x, z) { 
    let size = this.size;
    
    // Central tower for shadow debugging
    //if (Math.abs(x-size/2) < 5 && Math.abs(z-size/2) < 5) return size/16;
    
    if (x < 0) x = 0;
    if (z < 0) z = 0;

    // Get integer and fractional parts of coordinates
    const x1 = Math.min(size, Math.floor(x));
    const x2 = Math.min(size, x1 + 1);
    const z1 = Math.min(size, Math.floor(z));
    const z2 = Math.min(size, z1 + 1);

    // Bilinear interpolation
    const dx  = x - x1;
    const rdx = 1 - dx;
    const dz = z - z1;
    const rdz = 1 - dz;
    let height = (this.heights[z1*(size+1)+x1] * rdx + 
                  this.heights[z1*(size+1)+x2] *  dx ) * rdz +
                 (this.heights[z2*(size+1)+x1] * rdx + 
                  this.heights[z2*(size+1)+x2] *  dx ) * dz;

    return height;
  } 
  
  // Get the normal for any point on the map, interpolate between vertices
  getNormal(x, z) {     
    
    // Retrieve the heights for all four adjacent coordinates
    let heightX1 = this.getHeight(x-1, z);
    let heightX2 = this.getHeight(x+1, z);
    let heightZ1 = this.getHeight(x, z-1);
    let heightZ2 = this.getHeight(x, z+1);

    // Determine the normal
    let gradX  = (heightX1 - heightX2) / 2;
    let gradZ  = (heightZ1 - heightZ2) / 2;
    let len    = Math.sqrt(gradX**2 + gradZ**2 + 1);    
    let normal = { x: gradX / len, y: 1 / len, z: gradZ / len };  
    
    return normal;
  }
}