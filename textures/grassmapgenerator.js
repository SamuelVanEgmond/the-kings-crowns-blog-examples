class GrassMapGenerator {
  
  static generateGrassMap(size = 512) {  
    
    // Create a new canvas for the grass map
    let grassMap = document.createElement('canvas');
    grassMap.width = size;
    grassMap.height = size;
    
    this._createGrassMap(grassMap, size);
        
    return grassMap;
  }
  
  static _createGrassMap(grassMap, size) {

    let width  = size;
    let height = size;

    let ctx = grassMap.getContext("2d", { willReadFrequently:false });

    ctx.lineCap = "round";

    // Create 200 grass blades
    const bladeCount = 200;
    for (let blade = 0; blade < bladeCount; blade++) {

      // Set up the random parameters for each blade
      // Draw the blades from back to front
      // Back blades higher off the ground and darker to create depth
      let xPos         = (Math.random()*0.8+0.1)*width;
      let offsetTop    = (Math.random()-0.5)*0.125*width;
      let offsetBottom = (Math.random()-0.5)*0.125*width;
      let offsetGround = (1-blade/bladeCount)*height*0.15;  
      let bladeHeight  = (Math.random()*0.7+0.25)*height;
      let curve        = (Math.random()-0.5)*0.125*width;

      // Create a vertical gradient per blade darker for first drawn blades 'in the back'
      let gradient = ctx.createLinearGradient(0, bladeHeight, 0, 0);
      let c = Math.floor(blade/(bladeCount+1)*6); // 0-5
      gradient.addColorStop(0, `#${3+c}${4+c}0`);
      gradient.addColorStop(1, '#8D0');
      ctx.strokeStyle = gradient;

      // Draw the blade, slowly becoming thinner to the top
      for (let d = 0; d<1; d += 0.01) {
        let e = d + 0.05;
        ctx.beginPath();
        ctx.lineWidth = width/bladeCount*2*(1-d*0.8);
        ctx.moveTo(xPos + offsetBottom*(1-d) + offsetTop*(d) + Math.sin(d*3.14)*curve, (height-offsetGround)*(1-d) + (height-bladeHeight)*d);
        ctx.lineTo(xPos + offsetBottom*(1-e) + offsetTop*(e) + Math.sin(e*3.14)*curve, (height-offsetGround)*(1-e) + (height-bladeHeight)*e);
        ctx.stroke();
      }
    }

    // Draw a black to transparent gradient from the bottom up to create fake ambient occlusion
    let gradient = ctx.createLinearGradient(0, height, 0, height/2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height); 
    ctx.globalCompositeOperation = 'source-over';
  }
  
}

