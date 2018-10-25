//Creation of map with Openlayers API, requires script-tags in html
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
       source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 3
  })
});	

initAirplanes("/addAirplanes", { limit : 50 });

//Adds planes to the map
function initAirplanes(url, options){
  let planeLayer = new ol.layer.Vector();
  const planeOptions ={
    url : url,
    layer: planeLayer,
    limit : options.limit || 1000,
    updates : options.updates || true,
    updateInterval: options.updateInterval || 10000
  };
  /*loader takes a function that loads the source*/
  let planeSource = new ol.source.Vector({
    loader: loadLayer(planeOptions, planeLoader)
  });
  planeLayer.setSource(planeSource);
}

/*Convert degrees to radians*/
function toRadians(degrees){
  return degrees * Math.PI/180;
};

/*function to call when loading layer source.
options - contains url, layer, limit.
loader - function to be called that add the layer*/
function loadLayer(options, loader){
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let data = JSON.parse(this.responseText);
      loader(data, options.layer, options.limit);
      if(options.updates){
        setInterval(function(){ updateAirplanesCoords(options.url, options.layer); }, options.updateInterval);
      }
    }
  }
  req.open("GET", options.url);
  req.send();
};

/*loader function for airplanes.
Adds specified amount of airplanes to a source
for a layer and adds that layer*/
function planeLoader(data, layer, limit){
  /*States is array from response that contains
  a plane on each index, can be null*/
  let states = data.states || undefined;
  if(states){
    let source = layer.getSource();
    let count = 0;
    states.forEach(function(plane){
      /*Boolean if plane is on ground*/
      let planeGrounded = plane[8];
      /*Indexes 5,6 contains coordinates for the plane*/
      let lat = plane[6];
      let lon = plane[5];
      if(!planeGrounded && lat && lon && count < limit){
        /*Convert the coordinates to our system*/
        let coords = ol.proj.transform([lon,lat], 'EPSG:4326', 'EPSG:3857');
        /*Create a point for the plane*/
        let newPlane = new ol.Feature({
          geometry: new ol.geom.Point([coords[0], coords[1]])
        });
        /*Set the image of the plane*/
        newPlane.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            scale: 0.03,
            src: 'plane.png',
            /*Index 10 contains plane rotation in degrees
            North is 0 degrees. Openlayers wants radians*/
            rotation: toRadians(plane[10])
          })
        }));
        /*index 0 is the unique icao24 code*/
        newPlane.setId(plane[0]);
        /*Add plane to the source connected to the layer*/
        source.addFeature(newPlane);
        count++;
      }
    });
    /*After all planes are added to the source, add the layer
    connected to source to the map*/
    map.addLayer(layer);
  }
};

/*Similar to airplaneloader but updates
the coordinates on planes existing in layer*/
function updateAirplanesCoords(url, layer){
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let data = JSON.parse(this.responseText);
      let states = data.states || undefined;
      if(states){
        let source = layer.getSource();
        states.forEach(function(plane){
          /*Indexes 5,6 contains coordinates for the plane*/
          let lat = plane[6];
          let lon = plane[5];
          /*lookup if plane with icao24(plane[0]) code exists*/
          let existingPlane = source.getFeatureById(plane[0]) || undefined;
          if(lat && lon && existingPlane){
            /*Convert the coordinates to our system before updating*/
            let newCoords = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
            let geom = existingPlane.getGeometry().setCoordinates(newCoords);
            /*plane[10] contains direction in degrees, north = 0*/
            existingPlane.getStyle().getImage().setRotation(toRadians(plane[10]));
          }
        });
        console.log("Airplanes coordinates updated");
      }
      else{
        console.log("States array was null");
      }
    }
  }
  req.open("GET", url);
  req.send();
}

