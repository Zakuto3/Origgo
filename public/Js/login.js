//native Post/AJAX to serverside: https://blog.garstasio.com/you-dont-need-jquery/ajax/

function loginrequest(){
let emptype;
req = new XMLHttpRequest();
req.open('post','http://localhost:3000/loginbtn');
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			if (req.responseText == 'true') {
				if (emptype == "employer") {
					window.location.href="/Index_employer.html";
				}else{
					window.location.href="/Index_employee.html";				
				}
			}
			else if(req.responseText == 'goPass'){
				alert("go to pass site");
			}else{
				document.getElementById("errormsg").innerHTML = "Wrong username and/or password"
			}
	}
	else if (this.status !== 200 && this.readyState != 4) {
	alert('Request failed.  Returned status of ' + req.status);
	}
};
let name = document.getElementById("uname").value, pass = document.getElementById("pswd").value;
emptype = (document.getElementById("box1").checked) ? "employer" : "employee";
req.send(encodeURI('Name=' + name) + "&" +encodeURI('Pass=' + pass)+ "&" +encodeURI('emptype=' + emptype)); //sends this to serverside
};

