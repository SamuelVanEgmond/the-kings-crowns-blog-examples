"use strict";

class FlexShader {

  static uniforms = {   // Just ignore 'unexpected token =' error in glitch editor, it doesn't understand static members.
    time: { type: 'time', is: 'uniform' },
    playerpos: new THREE.Uniform( new THREE.Vector3() )
  };

  static shaderModifier(shader) {

    // Link the shader's uniforms to the static uniforms above
    shader.uniforms.time = FlexShader.uniforms.time;
    shader.uniforms.playerpos = FlexShader.uniforms.playerpos;

    // Change the vertexShader by adding the uniforms and extra input attribute for flex to the begin
    // and adding vertex transformations after the <begin-vertex> shader chunk.
    shader.vertexShader = `
      in float flex;  // Per vertex, ground level = 0, top of the grass = 1
      uniform float time;
      uniform vec3 playerpos;
    ` + shader.vertexShader.replace('#include <begin_vertex>',
    `#include <begin_vertex>

      // Grass waves in the wind
      transformed += vec3(sin(time+transformed.x/5.)*sin(time+transformed.z/7.) * abs(flex)*0.25, 0., 0.);

      // Move the grass out of the way of the player in a radius of 2 meters
      const float radius = 2.;
      float distance = length(transformed.xz - playerpos.xz);
      if (distance < radius && flex > 0.) {
        float offset = max(0., 1. - distance/radius) * flex;
        transformed.xz += normalize(transformed.xz - playerpos.xz) * offset;
        transformed.y  -= offset * .5;
      } 
    `);
  };
}