/* global AFRAME */

"use strict";

// Keep track of objects to prevent overlapping objects and to handle object/player collisions
AFRAME.registerSystem('objecttracker', {
  init() {
    this.objects = [];
    this.maxRadius = 0;
  },

  addObject(x, y, radius) {
    let fx = Math.floor(x);
    let fy = Math.floor(y);
    
    if (!this.objects[fy])
      this.objects[fy] = [];
    if (!this.objects[fy][fx])
      this.objects[fy][fx] = [];
    
    // Add objects by storing their location and radius in one array per square unit / meter
    this.objects[fy][fx].push({x,y,radius});
    this.maxRadius = Math.max(radius, this.maxRadius);
  },

  getNearestObject(x, y, distance) {
    let nearestObject = null;
    let nearestDistance = Number.MAX_VALUE
    
    // Only look for the nearest object in the surrounding square meters
    for (let j = Math.floor(y-distance-this.maxRadius); j<y+distance+this.maxRadius; j++) {
      for (let i = Math.floor(x-distance-this.maxRadius); i<x+distance+this.maxRadius; i++) {
        let objects = this.objects[j]?.[i];
        if (objects) {
          for (let o=0; o<objects.length; o++) {
            let object = objects[o];
            let distance = (object.x-x)**2 + (object.y-y)**2;
            
            // Remember the nearest object
            if (distance < nearestDistance) {
              nearestObject = object;
              nearestDistance = distance;
            }
          }
        }
      }
    }

    // We are only inerested if the nearest object overlaps with the search radius
    if (nearestObject) {
      if (Math.sqrt(nearestDistance) - nearestObject.radius > distance) {
        nearestObject = null;
      }
    }

    return nearestObject;
  }
});