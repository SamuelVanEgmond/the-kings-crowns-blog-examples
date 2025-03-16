"use strict";

/* global AFRAME */
/* global noiseFunctions */

var shaderVariables = `
    uniform float time;
    uniform float timeofday;
    varying vec4 cloudColor;
    varying vec4 darkCloudColor;
    varying vec4 sunColor;
    varying vec4 skyColor;
    varying float t;
    varying vec3 p;
    varying vec3 pSun;
    varying vec3 nPos;
    varying float n123;
    varying float y;
`;

AFRAME.registerShader('skyshader', {
  schema: {
    time: { type: 'time', is: 'uniform' },
    timeofday: { type: 'float', is: 'uniform', default: 1 }
  },

  // The vertex shader is executed per vertex and the resulting varying's are interpolated by te GPU per fragment
  vertexShader: noiseFunctions + shaderVariables + `
    void main()
    {
      cloudColor     = timeofday * vec4(1.00, 0.90, 0.90, 1.0) + (1. - timeofday) * vec4(0.1, 0.1, 0.1, 1.0);
      darkCloudColor = timeofday * vec4(0.65, 0.70, 0.80 ,1.0) + (1. - timeofday) * vec4(0.05, 0.05, 0.05, 1.0);
      sunColor       = timeofday>0.5 ? vec4(3., 2., 1., 1.) : vec4(0.8, 0.9, 1.0, 1.);

      t = time / 20000.;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      p = position;
      pSun = position;

      // Make the clouds move
      p.x += sin(t/2.)*0.2;
      p.z += cos(t/2.)*0.2;

      // Define a normalized position (i.e. projected on a sphere)
      nPos = 200. * normalize(p);

      // Calculate the cloud gradients per vertex 
      n123 = noise(nPos * 0.01 + t)/2. - 
             noise(nPos * 0.04 + t)/4. +
             noise(nPos * 0.08 + t)/8.;

      // More sky, less clouds
      n123 = n123*n123*3.;

      // Sky color gradient from blue to light blue at the horizon
      y = normalize(p).y;
      skyColor =    timeofday  * ((1. - y) * vec4(0.85, 0.90, 1., 1.) + y * vec4(0.100, 0.200, 0.400, 1.)) +\
                (1.-timeofday) * ((1. - y) * vec4(0.1, 0.2, 0.3, 1.) + y * vec4(0.0, 0.0, 0.0, 1.));

      // No clouds at the horizon
      n123 = n123 * y;
    }
  `,

  // The fragment shader is called once per pixel of a triangle to determine the final color and transparency
  fragmentShader: noiseFunctions + shaderVariables + `
    // Gradient noise from https://blog.frost.kiwi/GLSL-noise-and-radial-gradient/
    // To prevent very clear banding sky gradient
    float gradientNoise(in vec2 uv)
    {
      return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
    }

    const vec3 sunDirection = normalize(vec3(0.6, 1, 0.6));

    void main() {

      // Calculate the distance in the sky from the sun using the dot product to the sun direction
      float sunDistance = max(dot(normalize(pSun), normalize(sunDirection + vec3(0,abs(0.75-1.5*timeofday)-0.75,0))), 0.);

      // Create the sun with a hazy glare around it, but the moon has a much more clearly defined rim
      float sun = smoothstep(0.9997, 1.0-(timeofday<0.5?0.00025:0.), sunDistance) + smoothstep(0.999, 1.0, sunDistance) / 3.;

      // Add extra detail to cloud
      float n4567 = noise(nPos * 0.32 + t) / 32. +
                    noise(nPos * 0.64 + t) / 64.;

      // Create the clouds by combining the noise octaves with a hole for the sun
      float noCloud = smoothstep(0.9999, 0.999, sunDistance)/4.+0.75;
      float cloud   = noCloud * smoothstep((n123 + n4567*2.)*2., 0., 0.2);

      vec4 color = sun * sunColor + (1.-sun) * skyColor;

      // Clouds are Perlin noise with a gradient from sky color to (almost) white to darker for thick clouds
      // mix(mix(color1, color2, x/middle), mix(color2, color3, (x - middle)/(1.0 - middle)), step(middle, x));
      const float middle = 0.8;
      gl_FragColor = mix(mix(color, cloudColor, cloud/middle), 
                         mix(cloudColor, darkCloudColor, (cloud - middle)/(1.0 - middle)), 
                         step(middle, cloud));     
      
      gl_FragColor = vec4(gl_FragColor.xyz + (gradientNoise(gl_FragCoord.xy) - 0.5) / 255.0, 1.);
    }
  `
}); 

