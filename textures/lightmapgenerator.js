/* global LightCalculator */

class LightMapGenerator {
  
  static generateLightMap(heightField, size = 512, sunHeight = 1) {   
    
    // Create a new canvas for the light map
    let lightMap = document.createElement('canvas');
    lightMap.width = size;
    lightMap.height = size;

    // Since the lightmap and heightfield (can) have different resolutions we need to convert between them
    // Note that a lightmap is in pixels, the heightmap is in vertices. Pixels are between vertices, so + 0.5
    const toHeightSize = (heightField.size)/size;
    let getHeight = (x, z) => heightField.getHeight((x + 0.5)*toHeightSize, (z + 0.5)*toHeightSize);
    let getNormal = (x, z) => heightField.getNormal((x + 0.5)*toHeightSize, (z + 0.5)*toHeightSize);
    
    // Calculate the shadows
    let shadows = this._calculateShadows(getHeight, size, sunHeight * toHeightSize);
    
    // Create the light map including shadows
    let lightCalculator = new LightCalculator( { x:1, y:sunHeight, z:1} );
    this._createLightMap(getNormal, size, lightCalculator, shadows, lightMap);
    
    // Blur the light map
    const blurPixels = size / heightField.size;
    const ctx = lightMap.getContext('2d');
    ctx.filter = `blur(${blurPixels}px)`;
    ctx.drawImage(lightMap, 0, 0);   
    
    return lightMap;
  }
  
  static _createLightMap(getNormal, size, lightCalculator, shadows, lightMap) {  
    
    // Retrieve the image data from the light map canvas
    let ctx = lightMap.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, size, size);
    let data = imageData.data;    
    
    let imgIndex = 0;
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {

        // Determine the lighting via the calculated normal for the pixel (a pixel is between two vertices, hence + 0.5)
        let light = lightCalculator.calculateLight(getNormal(x, z));

        // Add the shadows
        if (shadows[z * size + x] === 1) {
          light = 0;
        }
        
        // Add ambient light
        light += 0.5;
                       
        // Set rgb bytes and alpha byte
        data[imgIndex++] = light*255; 
        data[imgIndex++] = light*255; 
        data[imgIndex++] = light*255;
        data[imgIndex++] = 255;
      }
    } 

    ctx.putImageData(imageData, 0, 0);
  }
  
  static _calculateShadows(getHeight, size, sunHeight) {

    const shadows = new Uint8Array(size**2);

    // Start at the side closest to the sun
    for (let z = size; z > 0; z--) {
      for (let x = size; x > 0; x--) {

        // If this vertex is already in the shadow it can't cast a shadow itself 
        if (shadows[z * size + x] === 0) {

          // Send a ray downwards from the vertex and mark every next vertex
          // that is lower as the ray as being in the shadow until you hit terrain
          let rayHeight = getHeight(x, z);
          for (let d = 1; d <= size; d++) {
            rayHeight -= sunHeight;
            if (x - d < 0 || z - d < 0 || getHeight(x - d, z - d) >= rayHeight) {

              // The next vertex is higher or level, so stop here
              break;
            }

            // The next vertex is lower, so in the shadow, continue downwards
            shadows[(z - d) * size + (x - d)] = 1;
          }              
        }
      }   
    }

    return shadows;
  }
  
}