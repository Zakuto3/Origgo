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
            jsonData = JSON.parse(this.responseText);

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

function getInfo() {
    let data = document.getElementById("search").name;
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/getAirplane?q=' + data);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        // console.log("baum!!!!"+this.responseText);
        if (xhr.status === 200 && this.responseText != "") {
            jsonData = JSON.parse(this.responseText);
            document.getElementById("info").innerHTML =
                "Callsign:<br>"+jsonData["callsign"]+"<br><br>"+
                "Origin country:<br>"+jsonData["origin"]+"<br><br>"+
                "Velocity:<br>"+jsonData["velocity"]+"m/s<br><br>"+
                "Altitude:<br>"+jsonData["altitude"]+"m<br><br>"+
                "Departure:<br>"+jsonData["depatureAirport"]["city"]+"<br><br>"+
                "Arival:<br>"+jsonData["arrivalAirport"];
            console.log(this.responseText);
        }else {console.log("no response");}
    }
    xhr.send(encodeURI('name=' + postmsg));
}

//fills picked value from dropdown into searchbar
function selectPlane(code, callSign) {
    console.log(code);
    document.getElementById("search").name = code;
    document.getElementById("search").value = callSign;
    clear();
}

function selectAirport(city, code) {
    document.getElementById("search").name = code;
    document.getElementById("search").value = city;
    clear();
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

    console.log("should go");
    var drp = document.getElementById("drop");
    var a = drp.getElementsByTagName("a");
    for(let i = 0; i < 5; i++){
        a[i].style.display = "none";
    }
}