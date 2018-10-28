function reDir() {
	req = new XMLHttpRequest();
	req.open('post','http://83.255.27.47:3000/check');
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
req.open('post','http://83.255.27.47:3000/check');
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
		if (req.responseText != '') {
			document.getElementById("moreInfo").innerHTML = "Logged in as " + req.responseText;
			document.getElementById("loginIndex").innerHTML = "Logout";
			document.getElementById("signupIndex").style.visibility="hidden";
			document.getElementsByClassName("column right")[0].style.display="block";
		}		
	}
};
req.send(); 