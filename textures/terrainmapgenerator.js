class TerrainMapGenerator {
  
  static generateTerrainMap(heightField, size = 4096, noise) {   

    // Create a new canvas for the terrain map
    let terrainMap = document.createElement('canvas');
    terrainMap.width = size;
    terrainMap.height = size;
    
    this._createTerrainMap(terrainMap, size, heightField, noise);
        
    return terrainMap;
  }
  
  static _createTerrainMap(terrainMap, size, heightField, noise) {  

    // Retrieve the image data from the light map canvas
    let ctx = terrainMap.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, size, size);
    let data = imageData.data;    
    
    let toHeightSize = (heightField.size)/size;
    
    let imgIndex = 0;
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {

        // Get the height
        let height = heightField.getHeight((x + 0.5)*toHeightSize, (z + 0.5)*toHeightSize);
        
        // Hight is 0 - heightField.size/4, scale it back to 0 - 1
        height /= (heightField.size/4);
        
        // Add noise otherwise you would get horizontal boundaries
        // Since the same noise is use for the mountains, the boundaries undulate naturally
        let noiseValue = noise.get((x*8)/size*noise.size, (z*8)/size*noise.size)
        height += height * (noiseValue*2-1)/2;
        
        let color = undefined;
        let rnd = Math.random();
        
        const GRASSHEIGHT = 0.01;
        const ROCKHEIGHT  = 0.20;
        const SNOWHEIGHT  = 0.60;
        
        if (height < (ROCKHEIGHT+SNOWHEIGHT)/2) {
          // Randomize the height for a bit of stippling to look more natural
          // Except for the snow boundary
          height += Math.random() * 0.015;
        }
        
        if (height < GRASSHEIGHT) {
          
          // PATH: Green en light green noise
          color = { r: 50 + rnd * 50, g: 75 + rnd * 50, b: 0 };
          
        } else if (height < ROCKHEIGHT) {
          
          // GRASS: Dark green with noise
            color = { r: 50 - height * 150 + rnd * 25, g: 75 - height * 225 + rnd * 25, b: 0 };
          
        } else if (height < SNOWHEIGHT) {
          
          // ROCK: Dark blue rocks with sandstone highlights
          let c = rnd*10;
          color = { r: c + 10 + noiseValue * noiseValue * 150, 
                    g: c + 20 + noiseValue * noiseValue * 120, 
                    b: c + 30 + noiseValue * noiseValue * 90 
                  };
          
        } else { 
          
          // SNOW: Light blue snow with white highlights and a blueish rim
          let c = 180 + rnd*10;
          let rim = Math.pow(Math.max(0, (1-(height - SNOWHEIGHT)*10)),2) * 100;
          color = { r: c + 0  + noiseValue * 65 - rim, 
                    g: c + 0  + noiseValue * 65 - rim*0.66, 
                    b: c + 40 + noiseValue * 25 - rim*0.33
                  };
          
        }
        
        // Debug shadows & lighting
        // color = { r:255, g:255, b:255 };

        //color = { r:255, g:255, b:255 };
        data[imgIndex++] = color.r;
        data[imgIndex++] = color.g;
        data[imgIndex++] = color.b;
        data[imgIndex++] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
}