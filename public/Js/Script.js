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

function searchPlanes(str){
    let input = document.getElementById("search");
    filter = input.value.toUpperCase();
    xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/search?q='+str);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        if (xhr.status === 200) {
            document.getElementById("livesearch").innerHTML = this.responseText;
        }
        else if (xhr.status !== 200) {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send(encodeURI('name=' + postmsg)); //sends this to serverside
}