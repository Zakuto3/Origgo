//native Post/AJAX to serverside: https://blog.garstasio.com/you-dont-need-jquery/ajax/

function loginrequest(){
	req = new XMLHttpRequest();
	req.open('post','/loginbtn');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){		
			if(req.responseText == 'goPass'){
			setPassword(name);
			}else if (req.responseText != "") {
				window.location.href=`/Index_${req.responseText}.html`;	
			}else{
				document.getElementById("errormsg").innerHTML = "Wrong username and/or password"
			}
		}
		else if (this.status !== 200 && this.readyState != 4) {
			alert('Request failed.  Returned status of ' + req.status);
		}
	}
let name = document.getElementById("uname").value, pass = document.getElementById("pswd").value;
emptype = (document.getElementById("box1").checked) ? "employer" : "employee";
req.send(encodeURI('Name=' + name) + "&" +encodeURI('Pass=' + pass)+ "&" +encodeURI('emptype=' + emptype)); //sends this to serverside
};

function setPassword(name){
	document.getElementById("errormsg").innerHTML = "";
	document.getElementById("submit").style.display = "none";
	document.getElementById("uncheck").style.display = "none";
	document.getElementById("uname").style.display = "none";
	document.getElementById('labeluser').style.display = "none";			
	document.getElementById('labelpass').style.display = "none";			
	document.getElementById("logintitle").innerHTML = `Enter password for ${name}`;

	let PassConfirm = document.createElement("INPUT");
	PassConfirm.setAttribute("type", "password");
	PassConfirm.setAttribute("placeholder", "Confirm password");
	PassConfirm.classList.add("textinput");
	PassConfirm.id = "pswdconf";
	document.getElementById('container').appendChild(PassConfirm);


	let submitbtn = document.createElement("button");
	submitbtn.innerHTML = "Submit";
	submitbtn.id = "submitpass"
	submitbtn.classList.add("AddMemberBtn");
	document.getElementById('container').appendChild(submitbtn);

	document.getElementById("submitpass").addEventListener("click", (e)=> {
		let passconf = document.getElementById("pswdconf").value;
		let pass = document.getElementById("pswd").value;
		console.log("passes: ",emptype,pass);
		console.log(passconf.length + pass.length);
		if (passconf.length + pass.length < 14) {
			document.getElementById("errormsg").innerHTML = "passwords to short"
		}
		else if (passconf != pass) {
			document.getElementById("errormsg").innerHTML = "passwords dont match";
		}else{
			document.getElementById("errormsg").innerHTML = "";
			SetPassRequest(name,pass,emptype);
		}
	})
};

function SetPassRequest(name, pass, emptype){
	req = new XMLHttpRequest();
	req.open('post','/setPasswd');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){		
			if(req.responseText == 'success'){
				alert("Password set.");
				window.location.href=`/login.html`;	
			}else if (req.responseText != "") {
				alert("Could not set password.");
				window.location.href=`/login.html`;
			}
		}
		else if (this.status !== 200 && this.readyState != 4) {
			alert('Request failed.  Returned status of ' + req.status);
			}
		}
req.send(encodeURI('Name=' + name) + "&" +encodeURI('Pass=' + pass)+ "&" +encodeURI('emptype=' + emptype)); //sends this to serverside
};