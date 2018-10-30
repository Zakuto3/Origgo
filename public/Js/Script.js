scriptLoader('/js/Map.js');

var postmsg = 'this came from script';

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
    xhr.open('GET', 'http://localhost:3000/search?q='+str, false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        // console.log("baum!!!!"+this.responseText);
        if (xhr.status === 200 && this.responseText!= "") {
            jsonData = JSON.parse(this.responseText);
            for (let index = 0; index < 5; index++) {
                if (isEmpty(jsonData[index] == false)) {
                    aTemp = a[index];
                    aTemp.innerHTML = jsonData[index].iataCode + " " + jsonData[index].city;
                    aTemp.id = jsonData[index].iataCode;
                    document.getElementById("drop").style.display = "inline-block";

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
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/addAirplanes');//notice we use /request, this will match in serverside
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    getPla;
    xhr.onload = function() {
        let planes = this.responseText;
        let jsonPlanes = JSON.parse(planes);
        console.log(planes);
    };
    xhr.send(encodeURI('name=' + postmsg)); //sends this to serverside
}

//fills picked value from dropdown into searchbar
function select(iata) {
    console.log(iata);
    document.getElementById("search").value = iata;
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