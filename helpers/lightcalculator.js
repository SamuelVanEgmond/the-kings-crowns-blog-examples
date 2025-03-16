class LightCalculator {

  constructor(lightDirection) {
    
    // Normalize the light direction
    let length = Math.sqrt(lightDirection.x**2 + lightDirection.y**2 + lightDirection.z**2);
    this.lightDirection = { x: lightDirection.x / length, 
                            y: lightDirection.y / length, 
                            z: lightDirection.z / length };
  }
 
  // Returns 0 = full shadow to 1 = full light 
  calculateLight(normal) {
    
    // The lighting is calculated using the dot product
    // of the normal and the sun direction
    let dot =
      this.lightDirection.x * normal.x +
      this.lightDirection.y * normal.y +
      this.lightDirection.z * normal.z;        
    let light = Math.max(0, dot); 
    
    light = Math.min(1, light);
    
    return light; 
  }
}