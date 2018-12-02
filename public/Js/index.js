function reDir() {
	req = new XMLHttpRequest();
	req.open('post','/check');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			if (req.responseText != '') {
				window.location.href="/logout";
			}else{
				window.location.href="/login.html";
			}
		}
	};
	req.send(); 
}
//check if user is loged in to show proper UI
req = new XMLHttpRequest();
req.open('post','/check');
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
		try{
			var userData = JSON.parse(req.responseText);
		}catch(e){
			var userData = req.responseText;
		}
		if (typeof userData != "string") { //logged in user with tracking plane
			isLoggedIn(userData.username);
			addInfoByFlightIcao(userData.plane);

		}
		else if(userData != ""){ 	//logged in without tracking plane
			isLoggedIn(req.responseText);
		}	
	}
};
req.send();

function isLoggedIn(username){
	document.getElementById("moreInfo").innerHTML = "Logged in as " + username;
	document.getElementById("loginIndex").innerHTML = "Logout";
	document.getElementById("signupIndex").style.visibility="hidden";
	//messed up mouse coordinates on map for some reason, wtf
	//document.getElementsByClassName("column right")[0].style.display="block";
}  
