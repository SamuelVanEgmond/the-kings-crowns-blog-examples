/* global AFRAME */
/* global THREE */

"use strict";

// A half sphere skydome to be used with a sky shader
AFRAME.registerGeometry('skydome', {
    schema: {
        divisions: { default: 4 }
    },

    init: function (data) {
        this.data = data;
      
        let vTop      = new THREE.Vector3(0,1,0);
        let vFront    = new THREE.Vector3(0,0,-1);
        let vRight    = new THREE.Vector3(1,0,0);
        let vBack     = new THREE.Vector3(0,0,1);
        let vLeft     = new THREE.Vector3(-1,0,0);
        let positions = [];

        // Generate and subdivide all 8 sides
        this.subdivideAndCreate(vFront, vTop, vRight, positions, data.divisions );
        this.subdivideAndCreate(vRight, vTop, vBack, positions, data.divisions );
        this.subdivideAndCreate(vBack, vTop, vLeft, positions, data.divisions );
        this.subdivideAndCreate(vLeft, vTop, vFront, positions, data.divisions );
      
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

        this.geometry.computeBoundingBox();
    },

    subdivideAndCreate: function (vA, vB, vC, positions, divisions) {
        if (divisions === 0) {
            var vIndex = positions.length;                 
            positions.push(vA.x, vA.y, vA.z);  
            positions.push(vB.x, vB.y, vB.z);  
            positions.push(vC.x, vC.y, vC.z);  
        }
        else {
            var vBA = vB.clone(); vBA.lerp(vA, 0.5).normalize();  
            var vBC = vB.clone(); vBC.lerp(vC, 0.5).normalize();  
            var vAC = vA.clone(); vAC.lerp(vC, 0.5).normalize(); 
            this.subdivideAndCreate(vBA, vB, vBC, positions, divisions-1);
            this.subdivideAndCreate(vA, vBA, vAC, positions, divisions-1);
            this.subdivideAndCreate(vAC, vBC, vC, positions, divisions-1);
            this.subdivideAndCreate(vBA, vBC, vAC, positions, divisions-1);
        }
    }
}); 
