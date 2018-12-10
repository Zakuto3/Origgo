let nameofusr;
(()=>{ //get the info of logged in user at page start
	req = new XMLHttpRequest();
	req.open('post','/checkuser');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){		
			SetEmpInfo(JSON.parse(req.responseText));
		}else if (this.status !== 200 && this.readyState != 4) {
			alert('Request failed.  Returned status of ' + req.status);
		}
	}
	req.send(); 
})();

function SetEmpInfo(info){
 nameofusr = info.name;
 document.getElementById("emp-name").innerHTML = info.name;
 document.getElementById("emp-tracking").innerHTML = "Tracking: none";
 if (info.tracking != null) {
 	document.getElementById("emp-tracking").innerHTML = "Tracking: "+info.tracking;
 	addslitsener(info.tracking);
 }
};

function updateTracking(flight){
	document.getElementById("emp-tracking").innerHTML = "Tracking: "+flight;
	addslitsener(flight);
}

function addslitsener(flight) {
	document.getElementById("emp-tracking").style.color = "blue";
	document.getElementById("emp-tracking").style.border = "groove";
	console.log("did this");
	document.getElementById("emp-tracking").addEventListener("click", (e) => {
	document.body.scrollTop = document.body.scrollHeight;
    document.documentElement.scrollTop = document.body.scrollHeight;
	flyToPlane(flight);
});
}