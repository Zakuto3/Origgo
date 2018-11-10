

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
    // let input = document.getElementById("search");
    // let jsonData ="";
    // var drp = document.getElementById("drop");
    // var a = drp.getElementsByTagName("a");
    // filter = input.value.toUpperCase();
    // xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://localhost:3000/search?q='+str);
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // xhr.onload = function() {
    //     // console.log("baum!!!!"+this.responseText);
    //     if (xhr.status === 200 && this.responseText!= "") {
    //         jsonData = JSON.parse(this.responseText);

    //         console.log(this.responseText);
    //         for (let index = 0; index < 5; index++) {
    //             if (isEmpty(jsonData[index]) == false) {
    //                 a[index].innerHTML = jsonData[index].iataCode + " " + jsonData[index].city;
    //                 a[index].id = jsonData[index].iataCode;
    //                 a[index].style.display = "";
    //             } else {
    //                 a[index].innerHTML = "";
    //                 a[index].style.display = "none";
    //                 a[index].onClick = function () {};
    //             }
    //         }
    //     }
    //     else if (xhr.status !== 200) {
    //         console.log('Request failed.  Returned status of ' + xhr.status);
    //     }
    // };
    // xhr.send();
}

// function searchPlanes(str){
//     var drp = document.getElementById("drop");
//     var a = drp.getElementsByTagName("a");
//     for(let i = 0; i < 5; i++){a[i].style.display = "none";}
//     let count = 0;
//     planeList.forEach(function (flight, index) {
//         if(count < 5) {        // console.log(flight);
//             if (str !== "") {
//                 if (flight.callsign.toLowerCase().includes(str.toLowerCase())) {
//                     a[count].innerHTML = flight.callsign;
//                     a[count].id = flight.icao24;
//                     a[count].name = flight.callsign;
//                     a[count].style.display = "";
//                     count++;

//                 } else {
//                     console.log("notting");

//                 }
//             } else {
//                 console.log("no result");
//                 a[0].innerHTML = "no Result";
//                 a[0].style.display = "";
//                 for (let i = 1; i < 5; i++) {
//                     a[i].style.display = "none";
//                 }
//                 count = 5;
//             }
//         }
//     });
// }


// /*Get info on a flight*/
// function getFlight(icao24) {
//     //let data = document.getElementById("search").name;
//     xhr = new XMLHttpRequest();
//     xhr.open('GET', 'http://localhost:3000/getAirplane?q=' + icao24);
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xhr.onload = function () {

//         if (xhr.status === 200) {
//             var jsonData = JSON.parse(this.responseText);
//             //console.log(jsonData);git
//             return jsonData;
//         }else {console.log("no response");}
//     }
//     xhr.send();
// }

function getInfo(icao24) {
    AJAXget('/getAirplane?q=' + icao24, function(result){
        if(result != ""){
            var json = JSON.parse(result);
            var depatureAirport = json["depatureAirport"] ? json["depatureAirport"]["city"] : "Unavailable";
            document.getElementById("info").innerHTML = 
                "Callsign:<br>"+json["callsign"]+"<br><br>"+
                "Origin country:<br>"+json["origin"]+"<br><br>"+
                "Velocity:<br>"+json["velocity"]+"m/s<br><br>"+
                "Altitude:<br>"+json["altitude"]+"m<br><br>"+
                "Departure:<br>"+depatureAirport+"<br><br>"+
                "Arival:<br>"+json["arrivalAirport"];
            document.getElementById("info").style.display = "block";
        }
        else{
            console.log("getInfo: no response");
        }
    });
    // xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://localhost:3000/getAirplane?q=' + icao24);
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onload = function () {
    //     // console.log("baum!!!!"+this.responseText);
    //     if (xhr.status === 200 && this.responseText != "") {
    //         jsonData = JSON.parse(this.responseText);
    //         let depatureAirport = jsonData["depatureAirport"] ? jsonData["depatureAirport"]["city"] : jsonData["depatureAirport"];
    //         document.getElementById("info").innerHTML =
    //             "Callsign:<br>"+jsonData["callsign"]+"<br><br>"+
    //             "Origin country:<br>"+jsonData["origin"]+"<br><br>"+
    //             "Velocity:<br>"+jsonData["velocity"]+"m/s<br><br>"+
    //             "Altitude:<br>"+jsonData["altitude"]+"m<br><br>"+
    //             "Departure:<br>"+depatureAirport+"<br><br>"+
    //             "Arival:<br>"+jsonData["arrivalAirport"];
    //         document.getElementById("info").style.display = "block";
    //         console.log(this.responseText);
    //     }else {console.log("no response");}
    // }
    // xhr.send();
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
    // let req = new XMLHttpRequest();
    // req.open('GET', '/flightToDB?icao24=' + icao24);
    // req.onload = function(){
    //     if(req.status = 200){
    //         if(this.responseText == "true") {
    //             //addFlightToSide();
    //         }
    //         else { console.log("Could not add");}
    //     }
    // }
    // req.send();
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

    // let icao24 = document.getElementById("search").name;
    // let req = new XMLHttpRequest();
    // req.open('GET', '/checkUserSaved?icao24=' + icao24);
    // req.onload = function(){
    //     if(req.status = 200){
    //         if(this.responseText == "true") {
    //             updateUserFlight(icao24);
    //         }
    //         else { addUserFlight(icao24); }
    //     }
    // }
    // req.send();
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
    // let req = new XMLHttpRequest();
    // req.open('GET', '/updateFlightToDB?icao24=' + icao24);
    // req.onload = function(){
    //     if(req.status == 200){
    //         if(this.responseText == "true") {
    //             //addFlightToSide();
    //         }
    //         else { console.log("Could not update");}
    //     }
    // }
    // req.send();
}

function track(callSign){
    AJAXget('/getIcao24?callSign='+callSign, function(icao24){
        if(icao24 != "no results"){
            flyToPlane(icao24);
            getInfo(icao24);
            saveUserFlight(icao24);
        } 
        else{
            alert("Plane not found")
            console.log("Icao24 not found");
        }
    })
}

//fills picked value from dropdown into searchbar
// function selectPlane(code, callSign) {
//     console.log(code);
//     document.getElementById("search").name = code;
//     document.getElementById("search").value = callSign;
//     clear();
// }

function selectAirport(city, code) {
    document.getElementById("search").name = code;
    document.getElementById("search").value = city;
    clear();
}

//test funktion for search
// function findflight() {
//     let data = document.getElementById("search").value;
//     console.log(data);

// }

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// //cleared dropdown
// function clear() {

//     console.log("should go");
//     var drp = document.getElementById("drop");
//     var a = drp.getElementsByTagName("a");
//     for(let i = 0; i < 5; i++){
//         a[i].style.display = "none";
//     }
// }

function AJAXget(link, callback){
    let req = new XMLHttpRequest();
    req.open('GET', link);
    req.onload = function(){
        if(req.status == 200)
            callback(req.responseText);
    }
    req.send();
}