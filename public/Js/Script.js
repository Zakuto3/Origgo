var postmsg = 'this came from script';
// var planeList = [];
//native Post/AJAX to serverside: https://blog.garstasio.com/you-dont-need-jquery/ajax/
function loginrequest(){
let x = document.getElementById("btn-change");
xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/request');//notice we use /request, this will match in serverside
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

xhr.onload = function() {
    if (xhr.status === 200) {
        document.getElementById("element-test").innerHTML = "Welcome "+xhr.responseText; //resonsetext is result
    }
    else if (xhr.status !== 200) {
        alert('Request failed.  Returned status of ' + xhr.status);
    }
};
xhr.send(encodeURI('name=' + postmsg)); //sends this to serverside
}

function searchAirports(str){
    let input = document.getElementById("search");
    let jsonData ="";
    var drp = document.getElementById("drop");
    var a = drp.getElementsByTagName("a");
    filter = input.value.toUpperCase();
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/search?q='+str);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        // console.log("baum!!!!"+this.responseText);
        if (xhr.status === 200 && this.responseText!= "") {
            jsonData = this.responseText;

            console.log(this.responseText);
            for (let index = 0; index < 5; index++) {
                if (isEmpty(jsonData[index]) == false) {
                    a[index].innerHTML = jsonData[index].iataCode + " " + jsonData[index].city;
                    a[index].id = jsonData[index].iataCode;
                    a[index].style.display = "";
                } else {
                    a[index].innerHTML = "";
                    a[index].style.display = "none";
                    a[index].onClick = function () {};
                }
            }
        }
        else if (xhr.status !== 200) {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send(encodeURI('name=' + postmsg)); //sends this to serverside
}

function searchPlanes(str){
    var drp = document.getElementById("drop");
    var a = drp.getElementsByTagName("a");
    for(let i = 0; i < 5; i++){a[i].style.display = "none";}
    let count = 0;
    planeList.forEach(function (flight, index) {
        if(count < 5) {        // console.log(flight);
            if (str !== "") {
                if (flight.callsign.toLowerCase().includes(str.toLowerCase())) {
                    a[count].innerHTML = flight.callsign;
                    a[count].id = flight.icao24;
                    a[count].name = flight.callsign;
                    a[count].style.display = "";
                    count++;

                } else {
                    console.log("notting");

                }
            } else {
                console.log("no result");
                a[0].innerHTML = "no Result";
                a[0].style.display = "";
                for (let i = 1; i < 5; i++) {
                    a[i].style.display = "none";
                }
                count = 5;
            }
        }
    });
}

/*Get info on a flight*/
function getFlight(icao24) {
    //let data = document.getElementById("search").name;
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/getAirplane?q=' + icao24);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var jsonData = JSON.parse(this.responseText);
            //console.log(jsonData);
            return jsonData;
        }else {console.log("no response");}
    }
    xhr.send();
}

/*Add flight to a user in DB*/
function addUserFlight(icao24){
    let req = new XMLHttpRequest();
    req.open('GET', '/flightToDB?icao24=' + icao24);
    req.onload = function(){
        if(req.status = 200){
            if(this.responseText == "true") {
                //addFlightToSide();
            }
            else { console.log("Could not add");}
        }
    }
    req.send();
}

/*Save or update user flight in DB depending
 if it user has save one already*/
function saveUserFlight(){
    let icao24 = document.getElementById("search").name;
    let req = new XMLHttpRequest();
    req.open('GET', '/checkUserSaved?icao24=' + icao24);
    req.onload = function(){
        if(req.status = 200){
            if(this.responseText == "true") {
                updateUserFlight(icao24);
            }
            else { addUserFlight(icao24); }
        }
    }
    req.send();
}

/*updates users saved flight*/
function updateUserFlight(icao24){
    let req = new XMLHttpRequest();
    req.open('GET', '/updateFlightToDB?icao24=' + icao24);
    req.onload = function(){
        if(req.status = 200){
            if(this.responseText == "true") {
                //addFlightToSide();
            }
            else { console.log("Could not update");}
        }
    }
    req.send();
}

//fills picked value from dropdown into searchbar
function select(code, callSign) {
    console.log(code);
    document.getElementById("search").name = code;
    document.getElementById("search").value = callSign;
}

//test funktion for search
function findflight() {
    let data = document.getElementById("search").value;
    console.log(data);

}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//cleared dropdown
function clear() {
    var drp = document.getElementById("drop");
    var a = drp.getElementsByTagName("a");
    for(let i = 0; i < 5; i++){
        a[i].style.display = "none";
    }
}