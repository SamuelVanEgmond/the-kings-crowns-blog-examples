class Path {

  // Create random waypoints and connect them 
  constructor(waypointCount = 100, size = 256) {
    this.size = size;
    this.wayPoints = this._generateWayPoints(waypointCount);
    
    // For debugging use a fixed set of waypoints
    //this.wayPoints = [{"x":128,"y":128},{"x":105.18260741146437,"y":123.54895955450738},{"x":25.706716272210635,"y":157.17670576171136},{"x":32.17765315851257,"y":193.42952857369997},{"x":203.60744699971602,"y":186.8619330260072},{"x":213.69980431137338,"y":207.86876843950964},{"x":118.12298540424209,"y":64.20471734014177},{"x":178.76891280172399,"y":155.32856875617986},{"x":222.17189721172667,"y":37.75071646504335},{"x":42.032371335147715,"y":189.2512168087285},{"x":76.11125252015991,"y":74.44491717735679},{"x":204.09706699355874,"y":218.76037782521922},{"x":124.25467121496945,"y":86.39806536325486},{"x":31.331401778773582,"y":66.83643792826257},{"x":90.94864244989296,"y":39.41321901090532},{"x":128.7422790549897,"y":106.95038949024524},{"x":92.31398222207164,"y":215.47253069999903},{"x":194.8916120224678,"y":59.29477737701682},{"x":29.983031938192653,"y":133.4152261376573},{"x":54.53248668477477,"y":141.1362352868353},{"x":222.46414206815194,"y":204.13934872885375},{"x":196.64096650671945,"y":147.0069974078636},{"x":117.42678687855005,"y":200.7964660599882},{"x":65.91358893597643,"y":222.6069365355349},{"x":74.027440708417,"y":184.06059692874365},{"x":93.63258510295387,"y":125.86474440618039},{"x":45.73184065408832,"y":157.54955449753615},{"x":229.68462551781218,"y":131.07421494847722},{"x":70.81096842851252,"y":27.11559397601218},{"x":133.50905146804607,"y":223.32801362822835},{"x":219.19158937610374,"y":224.03271473638785},{"x":209.46511041071773,"y":44.21853128495113},{"x":192.49048176322648,"y":103.18185187700547},{"x":38.69195864049307,"y":212.5989159676296},{"x":125.89178512093159,"y":136.81296690947553},{"x":123.80455442386321,"y":169.26035788896746},{"x":123.12462622732923,"y":42.9445770124315},{"x":80.26274796631283,"y":32.938021167492394},{"x":176.99101412483682,"y":143.60275242083276},{"x":208.8736948931712,"y":204.11127106727258},{"x":78.16219439803041,"y":208.59551946469878},{"x":156.6736090521018,"y":225.2550475093072},{"x":83.58159353589039,"y":85.9030268233943},{"x":129.89818127360383,"y":179.3333016474969},{"x":37.15274162479109,"y":214.90244474221237},{"x":191.25632760613198,"y":74.56985154320395},{"x":147.2763040767279,"y":50.907659392083815},{"x":173.5018126826006,"y":165.65654376174288},{"x":142.79307914350457,"y":102.90691812558973},{"x":196.3297645293184,"y":145.34504703488255},{"x":143.40414614924217,"y":66.31995125165099},{"x":144.50603533035533,"y":136.6029827621465},{"x":230.173141654748,"y":136.69252926491154},{"x":226.55897353593272,"y":112.4750760523516},{"x":94.27670311409952,"y":201.84416246961447},{"x":84.17479864396327,"y":99.91232391389414},{"x":167.4652988914191,"y":126.18731842509447},{"x":168.12713611418872,"y":195.88413346179883},{"x":228.37037615960682,"y":190.82099372550456},{"x":179.36191289569953,"y":80.5936594041178},{"x":165.11367596763512,"y":161.69241340327864},{"x":66.1502981938082,"y":98.88046295213454},{"x":192.78807924603475,"y":65.75870908167562},{"x":144.94517744812694,"y":226.38616618196906},{"x":34.53082017751481,"y":165.88470139845177},{"x":80.71347356694113,"y":203.11702178505197},{"x":183.40801661159148,"y":54.82620202882213},{"x":218.70752112005434,"y":117.29823374340754},{"x":114.86774715517433,"y":145.7941294866892},{"x":211.52492845513058,"y":61.23137996934893},{"x":54.54386909142372,"y":72.56831016095822},{"x":88.09215390116202,"y":54.87439730142091},{"x":178.13622628490188,"y":107.18491208823363},{"x":40.09184048686066,"y":38.207677473138624},{"x":191.38517636222556,"y":162.83091844942214},{"x":84.92737260845803,"y":146.23585123203029},{"x":60.4624259412944,"y":217.7509107025649},{"x":49.778241501316465,"y":69.29711538186476},{"x":216.2719428006733,"y":224.16228341891565},{"x":123.69593324449684,"y":102.37648595176347},{"x":151.37052539001553,"y":75.4627682308149},{"x":211.34783432990608,"y":209.45864750517654},{"x":83.76472828732035,"y":55.70526206774426},{"x":227.90289477920484,"y":95.8806776616718},{"x":95.81567354068724,"y":93.81358235796552},{"x":89.6318438095661,"y":173.16527683531422},{"x":89.44818493790882,"y":126.8121712893581},{"x":173.6040169052313,"y":146.73775185900055},{"x":62.69418947228496,"y":119.00490245371716},{"x":138.7321739158875,"y":42.87482721669235},{"x":74.37206154278428,"y":26.952909165627307},{"x":202.21154494446014,"y":189.22668628533606},{"x":53.38958005592222,"y":57.256903996462285},{"x":79.28430845305539,"y":137.48425133900102},{"x":157.18787658082698,"y":157.97652691547106},{"x":133.18048167140574,"y":114.89014402533232},{"x":160.0273256234184,"y":206.26653196860525},{"x":227.9480885694552,"y":40.721363817506926},{"x":116.68290098431359,"y":104.36147473447},{"x":122.37776902383212,"y":83.11543859828262},{"x":67.50581164278829,"y":49.56197342528281}];
    
    this.connections = this._findConnections(this.wayPoints);
    this._determineMaxDistance();
  }

  // Generate random waypoints away from the edges which results in mountains all around
  _generateWayPoints(waypointCount) {
    let wayPoints = [];
    
    // Make sure we have a valley where the gate will be in the middle of the terrain
    wayPoints.push( {x:this.size/2, y:this.size/2} );
    
    // Create random way points, except along the edges where the mountains are
    for (let p = 0; p < waypointCount; p++) {
      wayPoints.push({
        x: (Math.random() * 0.8 + 0.1) * this.size,
        y: (Math.random() * 0.8 + 0.1) * this.size
      });
    }

    return wayPoints;
  }

  // Use Prim's algorithm to determine the shortest path to connect all waypoints
  // https://en.wikipedia.org/wiki/Prim%27s_algorithm
  _findConnections(wayPoints) {
    const N = wayPoints.length;
    const visited = new Array(N).fill(false);
    visited[0] = true;
    let connections = [];

    while (connections.length < N - 1) {
      let minDist = Infinity;
      let connection = null;
      for (let i = 0; i < wayPoints.length; i++) {
        if (visited[i]) {
          for (let j = 0; j < wayPoints.length; j++) {
            if (!visited[j]) {
              let dist = this._distance(wayPoints[i], wayPoints[j]);
              if (dist < minDist) {
                minDist = dist;
                connection = [wayPoints[i], wayPoints[j]];
              }
            }
          }
        }
      }
      visited[wayPoints.indexOf(connection[1])] = true;
      connections.push(connection);
    }
    return connections;
  }  

  // Calculates the distance between two points (point = {x,y})
  _distance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Determine the maximum distance from the path to allow exact height scaling between 0 and 1
  _determineMaxDistance() {
    this.maxDistance = 0;
    for (let z=0; z<=this.size; z++) {
      for (let x=0; x<=this.size; x++) {
        this.maxDistance = Math.max(this.maxDistance, this.distanceToPath(x,z));
      }
    }    
  }
  
  // Loop over all connections to find the nearest one
  // x, y in terrain size coordinates
  distanceToPath(x, y) {
    let minDist = Number.MAX_VALUE;
    for (let c = 0; c < this.connections.length; c++) {
      let dist = this._distanceToLine( x, y, this.connections[c] );
      minDist = Math.min(minDist, dist);
    }

    return minDist;
  }  

  // Calculates the distance to a line section (line = [{x,y},{x,y}]) 
  // From https://stackoverflow.com/a/6853926
  _distanceToLine(x, y, line) {
    let A = x - line[0].x;
    let B = y - line[0].y;
    let C = line[1].x - line[0].x;
    let D = line[1].y - line[0].y;

    let dot = A * C + B * D;
    let lenSq = C * C + D * D;
    let param = -1;
    if (lenSq != 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = line[0].x;
      yy = line[0].y;
    } else if (param > 1) {
      xx = line[1].x;
      yy = line[1].y;
    } else {
      xx = line[0].x + param * C;
      yy = line[0].y + param * D;
    }

    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }          
}        
