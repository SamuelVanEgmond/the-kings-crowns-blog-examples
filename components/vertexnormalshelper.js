/* global AFRAME */
/* global THREE */

"use strict";

AFRAME.registerComponent('vertex-normals-helper', {
  schema: {
    meshName: { type: 'string', default: 'mesh' },
    size:     { type: 'number', default: 1 },
    color:    { type: 'color',  default: "#ff0000"}
  },

  init: function () {
    this.v1 = new THREE.Vector3();
    this.v2 = new THREE.Vector3();
    this.normalMatrix = new THREE.Matrix3();
    
    const mesh = this.el.getObject3D(this.data.meshName);
    if (!mesh) {
      throw Error(`Meshname '${this.data.meshName}' not found `)
    }

    const geometry = new THREE.BufferGeometry();

    const nNormals = mesh.geometry.attributes.normal.count;
    const positions = new THREE.Float32BufferAttribute(nNormals * 2 * 3, 3);

    geometry.setAttribute('position', positions);

    this.helper = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: this.data.color, toneMapped: false}));

    this.helper.mesh = mesh;
    this.helper.size = this.data.size;
    this.helper.type = 'VertexNormalsHelper';
    this.helper.matrixAutoUpdate = false;

    this.el.setObject3D('helper', this.helper);
  },

  update: function () {
    this.helper.updateMatrixWorld(true);
    this.normalMatrix.getNormalMatrix(this.helper.matrixWorld);
    const matrixWorld = this.helper.matrixWorld;
    const position = this.helper.geometry.attributes.position;

    const objGeometry = this.helper.mesh.geometry;

    if (objGeometry) {
      const objPos = objGeometry.attributes.position;
      const objNorm = objGeometry.attributes.normal;

      let idx = 0;

      for (let j = 0, jl = objPos.count; j < jl; j++) {
        this.v1.fromBufferAttribute(objPos, j).applyMatrix4(matrixWorld);
        this.v2.fromBufferAttribute(objNorm, j);
        this.v2.applyMatrix3(this.normalMatrix).normalize().multiplyScalar(this.helper.size).add(this.v1);

        position.setXYZ(idx, this.v1.x, this.v1.y, this.v1.z);
        idx = idx + 1;
        position.setXYZ(idx, this.v2.x, this.v2.y, this.v2.z);
        idx = idx + 1;
      }
    }
    position.needsUpdate = true;
  },

  remove: function() {
    this.el.removeObject3D('helper');
    this.helper.geometry.dispose();
    this.helper.material.dispose();
  }
});