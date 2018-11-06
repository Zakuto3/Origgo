//Creation of map with Openlayers API, requires script-tags in html
// var planeList = [];
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

let planeLayer; //moved, needed access in flyToPlane()

initAirplanes("/addAirplanes", { limit : 50 });

//Adds planes to the map
function initAirplanes(url, options){
  planeLayer = new ol.layer.Vector();
  const planeOptions ={
    url : url,
    layer: planeLayer,
    limit : options.limit || 1000,
    updates : options.updates || true,
    updateInterval: options.updateInterval || 10000
  };
  /*loader takes a function that loads the source*/
  var planeSource = new ol.source.Vector({
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
function planeLoader(planes, layer, limit){
  
  let source = layer.getSource();
  for(let i = 0; i < planes.length && i < limit; i++){
    /*Convert the coordinates to our system*/
    let coords = ol.proj.transform([planes[i].lon, planes[i].lat], 'EPSG:4326', 'EPSG:3857');
    /*Create a point for the plane*/
    let newPlane = new ol.Feature({
      geometry: new ol.geom.Point([coords[0], coords[1]])
    });
    /*Set the image of the plane*/
    newPlane.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        scale: 0.03,
        src: 'pictures/vector-plane.png',
        /*Openlayers wants radians*/
        rotation: toRadians(planes[i].direction)
      })
    }));
    /*set Id for point to be able to find it later*/
    newPlane.setId(planes[i].icao24);
    planeList.push(planes[i]);
    /*Add plane to the source connected to the layer*/
    source.addFeature(newPlane);
  }
    /*After all planes are added to the source, add the layer
    connected to source to the map*/
    map.addLayer(layer);
}

/*Similar to airplaneloader but updates
the coordinates on planes existing in layer*/
function updateAirplanesCoords(url, layer){
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      let planes = JSON.parse(this.responseText);
      let source = layer.getSource();
      for (let i = 0; i < planes.length; i++) {
        /*Plane need to exist in layer already, we can't update a nonexisting plane*/
        let existingPlane = source.getFeatureById(planes[i].icao24) || undefined;
        if(existingPlane){
          /*Convert the coordinates to our system before updating*/
          let newCoords = ol.proj.transform([planes[i].lon, planes[i].lat], 'EPSG:4326', 'EPSG:3857');
          let geom = existingPlane.getGeometry().setCoordinates(newCoords);
          /*degress must be converted to radians for Openlayers*/
          existingPlane.getStyle().getImage().setRotation(toRadians(planes[i].direction));
        }
      }
      console.log("Updated airplane coordinates");
    }
  }
  req.open("GET", url);
  req.send();
}

let intervalId; //needed to cancel intervals

/*takes a planes icao24 number that is plane
id in map. Then zooms on it and keeps centered*/
function flyToPlane(icao24){
  let view = map.getView();
  let source = planeLayer.getSource();
  let plane = source.getFeatureById(icao24);

  //If searched plane exists
  if(plane) {
    let coords = plane.getGeometry().getCoordinates();
    view.animate({
      zoom: 3,
      duration: 1000
    },
    { center: coords,
      zoom: 12,
      duration: 1000
    });
    //clear any ongoing intervals before setting new
    clearInterval(intervalId);
    //interval will keep map centered on plane
    intervalId = setInterval(function() { keepCentered(plane);}, 100);
    //dragging the map will cancel the interval
    map.on("pointerdrag", function(){
      clearInterval(intervalId); 
      map.removeEventListener("pointerdrag");
    }); 
  }
  else{
    console.log("Plane not found on map");
  }
}

function keepCentered(plane){
  let view = map.getView();
  let coords = plane.getGeometry().getCoordinates();
  view.animate({
    center: coords,
    duration: 100
  });
}

