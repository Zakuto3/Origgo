

function searchAirports(str){
    AJAXget('/search?q='+str, function(result){
        if(result != ""){
            var json = JSON.parse(result);
            var drp = document.getElementById("drop");
            var a = drp.getElementsByTagName("a");
            for (let index = 0; index < 5; index++) {
                if (isEmpty(json[index]) == false) {
                    a[index].innerHTML = json[index].iataCode + " " + json[index].city;
                    a[index].id = json[index].iataCode;
                    a[index].style.display = "";
                } else {
                    a[index].innerHTML = "";
                    a[index].style.display = "none";
                    a[index].onClick = function () {};
                }
            }
        }
        else{
            console.log("Airports: no response");
        }
    });
}


function track(callSign){
    AJAXget('/getAirplane?callsign=' + callSign, function(result){
        if(result != ""){
            var plane = JSON.parse(result);
            console.log("plane: ", plane);
            flyToPlane(plane.regNumb);
            addInfo(plane);
            saveUserFlight(plane.regNumb);
        }
        else{
            alert("Plane not found");
            console.log("track: no response");
        }
    });
}

function addInfoByFlightIcao(flightIcao){
    AJAXget('/getAirplane?flightIcao='+flightIcao, function(data){
        if(data != ""){
            let plane = JSON.parse(data);
            addInfo(plane);
        }
        else { console.log("addInfoByIcao24: no response"); }
    })
}

function addInfo(plane) {
    console.log("addInfo: ",plane);
    var depatureAirport = plane.depatureAirport.cityIata +", "+ plane.depatureAirport.country || plane.depatureAirport;
    var arrivalAirport = plane.arrivalAirport.cityIata +", "+ plane.arrivalAirport.country || plane.arrivalAirport;
    document.getElementById("info").innerHTML = 
        "Callsign:<br>"+plane.callsign+"<br><br>"+
        //"Origin country:<br>"+plane.depatureAirport.country+"<br><br>"+
        //"Velocity:<br>"+json["velocity"]+"m/s<br><br>"+
        "Altitude:<br>"+plane.altitude+"m<br><br>"+
        "Departure:<br>"+depatureAirport+"<br><br>"+
        "Arrival:<br>"+arrivalAirport;
    document.getElementById("info").style.display = "block";
}


/*Add flight to a user in DB*/
function addUserFlight(icao24){
    AJAXget('/flightToDB?icao24=' + icao24, function(result){
        if(result == "true"){
            console.log("Flight added to user");
        }
        else{
            console.log("Could not add flight to user");
        }
    });
}

/*Save or update user flight in DB depending
 if user has saved one already*/
function saveUserFlight(icao24){
    AJAXget('/checkUserSaved?icao24=' + icao24, function(result){
        console.log("save result: ", result);
        if(result == "true"){
            updateUserFlight(icao24);
        }
        else{
            addUserFlight(icao24);
        }
    });
}

/*updates users saved flight*/
function updateUserFlight(icao24){
    AJAXget('/updateFlightToDB?icao24=' + icao24, function(result){
        console.log("update result: ", result);
        if(result == "true"){
            console.log("userFlight updated");
        }
        else{
            console.log("Could not update");
        }
    });
}

function selectAirport(city, code) {
    document.getElementById("search").name = code;
    document.getElementById("search").value = city;
    clear();
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function AJAXget(link, callback){
    let req = new XMLHttpRequest();
    req.open('GET', link);
    req.onload = function(){
        if(req.status == 200)
            callback(req.responseText);
    }
    req.send();
}