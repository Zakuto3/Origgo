//native Post/AJAX to serverside: https://blog.garstasio.com/you-dont-need-jquery/ajax/

function loginrequest(){
req = new XMLHttpRequest();
req.open('post','http://83.255.27.47:3000/loginbtn');
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			if (req.responseText == 'true') {
				window.location.href="/index.html";
			}
			else{
				document.getElementById("errormsg").innerHTML = "Wrong username and/or password"
			}
	}
	else if (this.status !== 200 && this.readyState != 4) {
	alert('Request failed.  Returned status of ' + req.status);
	}
};
let name = document.getElementById("uname").value, pass = document.getElementById("psw").value;
req.send(encodeURI('Name=' + name) + "&" +encodeURI('Pass=' + pass)); //sends this to serverside
};
