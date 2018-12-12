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
 console.log(info);
 //loadEmployees(info.name);
 loadEEPlane(info.tracking);
 document.getElementById("welcome-msg").innerHTML = "Welcome "+nameofusr;
 document.getElementById("emp-name").innerHTML = info.name;
 document.getElementById("emp-mail").innerHTML = "<b>E-mail:</b> "+info.email;
 document.getElementById("emp-employer").innerHTML = "<b>Employer:</b> "+info.employer;
 document.getElementById("emp-tracking").innerHTML = "<b>Tracking:</b> none";
 if (info.tracking != null) {
 	document.getElementById("emp-tracking").innerHTML = "<b>Tracking:</b> "+info.tracking;
 	//addslitsener(info.tracking);
 }
};

function updateTracking(flight){
	AJAXget(`/flightToDB?usertype=employee&flightIcao=${flight}&name=${nameofusr}`, (res)=>{
			if(res == "true"){
				let form = document.getElementsByClassName("emp-set-flight")[0];
				form.style.opacity = 0;
				form.style.zIndex = -1;
				document.getElementById("emp-tracking").innerHTML = `<b>Tracking:</b> ${flight}`;
	            console.log("Flight added to user");
	            document.getElementById("emp-fetch-failed").style.display = "none";
	            document.getElementById("emp-fetch").style.display = "block";
	            document.getElementById("emp-new-flight").style.display = "none";
	            document.getElementById("EE-depart").style.display = "none";
				document.getElementById("EE-arrive").style.display = "none";
				document.getElementById("emp-flyToPlane").style.display = "none";
	            loadEEPlane(flight);
	            addIfPlaneAvail(null, flight);
	        }
	        else{
	            console.log("Could not add flight to user");
	        }
		})
}

function addslitsener(flight) {
	//document.getElementById("emp-tracking").style.color = "blue";
	//document.getElementById("emp-tracking").style.border = "groove";
	//console.log("did this");
	
}
document.getElementById("emp-flyToPlane").addEventListener("click", (e) => {
	document.body.scrollTop = document.body.scrollHeight;
    document.documentElement.scrollTop = document.body.scrollHeight;
    let track = document.getElementById("emp-tracking").innerHTML;
    console.log(track.substring(track.lastIndexOf(' '), track.length));
    //document.getElementById("").
	flyToPlane(track.substring(track.lastIndexOf(' ')+1, track.length));
});

function addIfPlaneAvail(emp, flightIcao){
	AJAXget("/addAirplanes?flightIcao="+flightIcao, function(data){
    var plane = JSON.parse(data);
    console.log("addIfPlaneAvail flightIcao: ",flightIcao);
    if(plane.length > 0){
      loadPlane(plane[0]);
    }
    else { 
    	if(emp){
    		document.getElementById(`sidebar-track-${emp}`).innerHTML += "<br><b style='color: red;'>Could not find</b>";
    	}
    	console.log("Plane not found from API");
    }

  })
}

function loadEEPlane(flightIcao){
	AJAXget("/getAirplane?flightIcao="+flightIcao, (planeInfo) => {
		if(planeInfo != ""){
			planeInfo = JSON.parse(planeInfo);
			let arrivalAirport = planeInfo.arrivalAirport ? `&emsp; <b>Country:</b> ${planeInfo.arrivalAirport.country}<br>
			&emsp; <b>City:</b> ${planeInfo.arrivalAirport.city}<br>
			&emsp; <b>Airport:</b> ${planeInfo.arrivalAirport.name}` : "&emsp;Unavailable";

			let depatureAirport = planeInfo.depatureAirport ? `&emsp; <b>Country:</b> ${planeInfo.depatureAirport.country}<br>
			&emsp; <b>City:</b> ${planeInfo.depatureAirport.city}<br>
			&emsp; <b>Airport:</b> ${planeInfo.depatureAirport.name}` : "&emsp;Unavailable";

			let depart = document.getElementById("EE-depart");
			let arrive = document.getElementById("EE-arrive");
			depart.innerHTML = `<b>Departed from:</b><br> ${depatureAirport}`;
			arrive.innerHTML = `<b>Arriving at:</b><br> ${arrivalAirport}`;

			addslitsener(flightIcao);

			document.getElementById("emp-flyToPlane").style.display = "inline-block";
			depart.style.display = "table-cell";
			arrive.style.display = "table-cell";
		}
		else {  
			document.getElementById("emp-fetch-failed").style.display = "block";		
		}

			document.getElementById("emp-fetch").style.display = "none";
			document.getElementById("emp-new-flight").style.display = "inline-block";				
	})
}

document.getElementById("emp-new-flight").addEventListener("click", (e) => {
	let form = document.getElementsByClassName("emp-set-flight")[0];
	form.style.opacity = 1;
	form.style.zIndex = 5;
})

document.getElementById("confirm-new-flight").addEventListener("click", (e) =>{
	let newFlight = document.getElementById("emp-flight-input").value.toUpperCase();
	if(newFlight.length > 0){
		AJAXget(`/flightToDB?usertype=employer&flightIcao=${newFlight}&name=${nameofusr}`, (res)=>{
			if(res == "true"){
				let form = document.getElementsByClassName("emp-set-flight")[0];
				form.style.opacity = 0;
				form.style.zIndex = -1;
				document.getElementById("emp-tracking").innerHTML = `<b>Tracking:</b> ${newFlight}`;
	            console.log("Flight added to user");
	            document.getElementById("emp-fetch-failed").style.display = "none";
	            document.getElementById("emp-fetch").style.display = "block";
	            document.getElementById("emp-new-flight").style.display = "none";
	            document.getElementById("EE-depart").style.display = "none";
				document.getElementById("EE-arrive").style.display = "none";
				document.getElementById("emp-flyToPlane").style.display = "none";
	            loadEEPlane(newFlight);
	            addIfPlaneAvail(null, newFlight);
	        }
	        else{
	            console.log("Could not add flight to user");
	        }
		})
	}
})	

document.getElementById("cancel-new-flight").addEventListener("click", (e) =>{
	let form = document.getElementsByClassName("emp-set-flight")[0];
	form.style.opacity = 0;
	form.style.zIndex = -1;
})