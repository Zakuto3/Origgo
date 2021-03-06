//Creation of map with Openlayers API, requires script-tags in html
let mouseZoom = (document.getElementById("search")) ? true : false;

const map = new ol.Map({
  target: 'map',
  interactions: ol.interaction.defaults({mouseWheelZoom:mouseZoom}),

  layers: [
    new ol.layer.Tile({
       source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: [0, 100],
    zoom: 3
  })
});	

let planeLayer; //moved, needed access in flyToPlane()


initAirplanes("/addAirplanes", { limit : 200 });

initHover();

//Adds planes to the map
function initAirplanes(url, options){
  planeLayer = new ol.layer.Vector();
  const planeOptions ={
    url : url,
    layer: planeLayer,
    limit : options.limit || 0,
    updates : options.updates || true,
    updateInterval: options.updateInterval || 60000
  };
  /*loader takes a function that loads the source*/
  var planeSource = new ol.source.Vector({
    loader: loadLayer(planeOptions, planeLoader)
  });
  planeLayer.setSource(planeSource);
  map.addLayer(planeLayer);
}

/*Convert degrees to radians*/
function toRadians(degrees){
  return degrees * Math.PI/180;
};

/*function to call when loading layer source.
options - contains url, layer, limit.
loader - function to be called that add the layer*/
function loadLayer(options, loader){
  if(options.limit > 0){
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
    req.open("GET", options.url+"?limit="+options.limit);
    req.send();
  }
};

/*loader function for airplanes.
Adds specified amount of airplanes to a source
for a layer and adds that layer*/
function planeLoader(planes, layer, limit){
  let source = layer.getSource();
  for(let i = 0; i < planes.length && i < limit; i++){
    loadPlane(planes[i]);
  }
  /*After all planes are added to the source, add the layer
  connected to source to the map*/
  //map.addLayer(layer);
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
        let existingPlane = source.getFeatureById(planes[i].flightIcao) || undefined;
        if(existingPlane){
          //console.log("planes[i]: ",planes[i]);
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
function flyToPlane(flightIcao){
  let view = map.getView();
  let source = planeLayer.getSource();
  let plane = source.getFeatureById(flightIcao);

  //If searched plane exists
  if(plane) {

    let coords = plane.getGeometry().getCoordinates();
    view.animate({
      zoom: 3,
      duration: 1000
    },
    { center: coords,
      zoom: 10,
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
    click.dispatchEvent({
      type: 'select',
      selected: [plane]
    });
  }
  else{
    if(document.getElementById("map-search-err")){
      let err = document.getElementById("map-search-err");
      if(err.style.display != "block"){
        err.style.display = "block";
        setTimeout(()=>{err.style.display = "none"}, 2800);
      }
    }
    console.log("Plane not found on map");
    addPlaneByFlight(flightIcao, true);
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

function addPlaneByFlight(flightIcao, flyTo){
  AJAXget("/addAirplanes?flightIcao="+flightIcao, function(data){
    var plane = JSON.parse(data);
    console.log("addPlane flightIcao: ",flightIcao);
    if(plane.length > 0){
      loadPlane(plane[0]);
      if(flyTo) flyToPlane(flightIcao);
    }
    else { console.log("Plane not found from API")}

  })
}

//loads a plane to a layer
function loadPlane(plane){
  /*Convert the coordinates to our system*/
  let coords = ol.proj.transform([plane.lon, plane.lat], 'EPSG:4326', 'EPSG:3857');
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
      rotation: toRadians(plane.direction)
    })
  }));
  /*set Id for point to be able to find it later*/
  newPlane.setId(plane.flightIcao);
  /*Add plane to the source connected to the layer*/
  planeLayer.getSource().addFeature(newPlane);
}

function initHover(){
  var hover = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove
  });

  map.addInteraction(hover);

  hover.on("select", (e) => {
    let plane = map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feat){return feat;})
    let features = planeLayer.getSource().getFeatures();
      features.forEach((feat) => {
        let planeId = plane ? plane.getId() : undefined;
        src = (feat.getId() === planeId) ? 'pictures/vector-plane-highlight.png' : 'pictures/vector-plane.png';
        let oldImage = feat.getStyle().getImage();
        feat.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
          scale: oldImage.getScale(),
          src: src,
          /*Openlayers wants radians*/
          rotation: oldImage.getRotation()
        })
      }))
      })
  })
}


(()=>{ 
  let req = new XMLHttpRequest();
  req.open('post','/checkuser');
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){ 
      console.log(window.location.pathname)
      if(req.responseText != ""){
          let user = JSON.parse(req.responseText);
          if(user.usertype == "admin" || !user.usertype){
            initPopUp(false);
          }
          else{
            initPopUp(true);
          }
      }
      else {
        initPopUp(false);}
    }

    else if (this.status !== 200 && this.readyState != 4) {
      alert('Request failed.  Returned status of ' + req.status);
    }
  }
  req.send(); 
})();

//initPopUp();
let click;
function initPopUp(includeSave = true){
  let pop = document.createElement("div");
  pop.classList.add("popup");

  let closePop = document.createElement("button");
  closePop.classList.add("popup-close");
  closePop.innerHTML = "X";
  closePop.addEventListener("click", function(evt) { document.getElementsByClassName("popup")[0].style.display = "none";/* overlay.setPosition(undefined);*/click.getFeatures().clear(); });

  let popText = document.createElement("p");
  popText.classList.add("popup-paragraph");

  let popTitle = document.createElement("span");
  popTitle.classList.add("popup-title");

  let saveBtn = document.createElement("button");
  saveBtn.id = "save-flight-map";
  saveBtn.classList.add("popup-save");
  saveBtn.innerHTML = "Save this flight";

  let successMsg = document.createElement("span");
  successMsg.id="pop-success-msg";
  successMsg.classList.add("saved-flight");
  successMsg.style.opacity = "0";
  successMsg.innerHTML = "Flight saved";

  let overlay = new ol.Overlay({
    element: pop
  });

  map.addOverlay(overlay);

  click = new ol.interaction.Select({
    condition : ol.events.condition.click
  });

  map.addInteraction(click);

  click.on("select", function(e){
    //let plane = map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feat){return feat;});
    let plane = e.selected[0];
    if(plane){
      let coords = plane.getGeometry().getCoordinates();
      let flightIcao = plane.getId();
      AJAXget("/getAirplane?flightIcao="+flightIcao, (planeInfo) => {
        if(planeInfo != ""){
          planeInfo = JSON.parse(planeInfo);
          let arrivalAirport = planeInfo.arrivalAirport ? `&emsp; <b>Country:</b> ${planeInfo.arrivalAirport.country}<br>
            &emsp; <b>City:</b> ${planeInfo.arrivalAirport.city}<br>
            &emsp; <b>Airport:</b> ${planeInfo.arrivalAirport.name}` : "&emsp;Unavailable";

          let depatureAirport = planeInfo.depatureAirport ? `&emsp; <b>Country:</b> ${planeInfo.depatureAirport.country}<br>
            &emsp; <b>City:</b> ${planeInfo.depatureAirport.city}<br>
            &emsp; <b>Airport:</b> ${planeInfo.depatureAirport.name}` : "&emsp;Unavailable";

          popTitle.innerHTML = `<b>Flight:</b> ${planeInfo.flightIcao}`
          popText.innerHTML = `<b>Arriving at:</b><br> ${arrivalAirport}.<br>
          <b>Departed from:</b><br> ${depatureAirport}.`;

          saveBtn.addEventListener("click", function save(e) {
            console.log("BOI");
            addUserFlight(flightIcao);
            let msg = document.getElementById("pop-success-msg");
            //msg.style.display = "block";
            msg.style.opacity = "1";
            setTimeout(()=>{msg.style.opacity = "0";
              /*msg.style.display = "none"*/;}, 2800)
            saveBtn.removeEventListener("click", save);
          });

          pop.appendChild(popTitle);
          pop.appendChild(closePop);
          pop.appendChild(popText);

          
          if(includeSave) {
            pop.appendChild(saveBtn);
            pop.appendChild(successMsg);
          }
          else{ document.getElementsByClassName("popup-paragraph")[0].style.paddingBottom ="1em"; }
          document.getElementsByClassName("popup")[0].style.display = "block";
          overlay.setPosition(coords);
          //pop.appendChild(successMsg.firstChild);
        }
        else { 

          pop.innerHTML = "Unavailable";
          pop.appendChild(closePop);
          overlay.setPosition(coords); 
          document.getElementsByClassName("popup")[0].style.display = "block";
        }
      })
    }
  })
}

function removePlane(flightIcao){
  if(planeLayer.getSource().getFeatureById(flightIcao))
    planeLayer.getSource().removeFeature(planeLayer.getSource().getFeatureById(flightIcao));
}
