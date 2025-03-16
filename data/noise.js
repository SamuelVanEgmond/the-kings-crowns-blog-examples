"use strict";

// A home brewn seamless value noise implementation for integer(!!) coordinates.
// Because it is seamless we precalculate the smaller size for speed.
// The end result guarantees return values in the whole range from 0 to 1
class ValueNoise {

  constructor(size = 512, octaves = 8, seed) {
    if (size && (size & (size - 1)) !== 0) {
      throw(`Size ${size} is not a power of two`);
    }
    this.size  = size;
    this.seed  = seed || Math.random()*100000;
    this.noise = this._preCalculateNoise(this.size, octaves ?? 8);
  }

  get(x, y) {
    return this.noise[((y%this.size) | 0)*this.size+((x%this.size) | 0)];
  }
  
  // Precalculate the noise in a Float32Array for better performance
  _preCalculateNoise(size, octaves) {
    const noise = new Float32Array(size * size);
    const maxOctaves = Math.min(octaves, 10);
    let scale = size / 2;
    let alpha = 1;
    let min = Number.MAX_VALUE;
    let max = 0;

    // Layer the different octaves, each next one with half the grid size and opacity
    for (let octave = 1; octave <= maxOctaves; octave++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          
          // Get integer coordinates and remainders at the current octave scale
          const fx = Math.floor(x / scale) * scale;
          const fy = Math.floor(y / scale) * scale;
          const rx = (x - fx) / scale;
          const ry = (y - fy) / scale;

          // Get the fixed random values at the four corners for the scale
          let v0 = this._getRandom( fx                 ,  fy                 );
          let v1 = this._getRandom((fx+scale)%this.size,  fy                 );
          let v2 = this._getRandom( fx                 , (fy+scale)%this.size);
          let v3 = this._getRandom((fx+scale)%this.size, (fy+scale)%this.size);

          // Interplolate the four corners
          const v01 = this._interpolate(rx, v0, v1);
          const v23 = this._interpolate(rx, v2, v3);
          const v   = this._interpolate(ry, v01, v23);

          const index = y * size + x;
          noise[index] = alpha * v + (1 - alpha) * noise[index];
          min = Math.min(min, noise[index]);
          max = Math.max(max, noise[index]);
        }
      }
      scale /= 2;
      alpha /= 2;
    }

    // Rescale into exactly 0 - 1 range (both inclusive)
    const range = max - min;
    for (let i = 0; i < noise.length; i++) {
      noise[i] = (noise[i] - min) / range;
    }

    return noise;
  }
  
  // Seeded fixed random number generator for x and y
  // From: https://stackoverflow.com/a/37221804
  _getRandom(x, y){   
    let h = this.seed + x*374761393 + y*668265263; //all constants are prime
    h = (h^(h >> 13))*1274126177;
    return (h^(h >> 16));
  }

  // Interpolate using smootherstep for x
  _interpolate(x, a, b) {
    return a + (x * x * x * (x * (x * 6 - 15) + 10)) * (b-a);
  }
}