
let nameofusr;
(()=>{ //get the info of logged in user at page start
	req = new XMLHttpRequest();
	req.open('post','/checkuser');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){		
			console.log(req.responseText);
			SetEmpInfo(JSON.parse(req.responseText));
		}else if (this.status !== 200 && this.readyState != 4) {
			alert('Request failed.  Returned status of ' + req.status);
		}
	}
	req.send(); 
})();

document.getElementById("person-adder").addEventListener("click", (e) => {
	clearform();
	showAddForm();
});

document.getElementById("closeAdd").addEventListener("click", (e) => {
	document.getElementById("addUserForm").style.display = "none";
	clearform();
});

document.getElementById("addMemberBtn").addEventListener("click", (e) => {
	AddPerson();
});

function showAddForm(){
	document.getElementById("addUserForm").style.display = "block";
}

function AddPerson(){
	let member = document.getElementById("uname").value;
	let mailChecked = checkMail(document.getElementById("uemail").value);
	let mail = document.getElementById("uemail").value;
	if(!mailChecked) {
		document.getElementById("errormsg").innerHTML = "Not a valid E-mail";
	}
	else if(member.length < 1){
		document.getElementById("errormsg").innerHTML = "Need to have a name";
	}else{
		AJAXget(`/addEmployee?empName=${member}&empMail=${mail}&employer=${nameofusr}`, (response)=>{
			if(response == "success"){
				console.log("employee added");
				document.getElementById("addUserForm").style.display = "none";
				clearform();
				showNewPerson(member,mail);
			}
			else if(response == "ER_DUP_ENTRY") {
				document.getElementById("errormsg").innerHTML = "Member already exists";
				}
			else 
				console.log("Employee not added");
		});
	}
}

function updateTracking(flight){

	//document.getElementById("emp-tracking").innerHTML = "<b>Tracking: </b>"+flight;
	//loadERplane(flight);
	AJAXget(`/flightToDB?usertype=employer&flightIcao=${flight}&name=${nameofusr}`, (res)=>{
			if(res == "true"){
				let form = document.getElementsByClassName("emp-set-flight")[0];
				form.style.opacity = 0;
				form.style.zIndex = -1;
				document.getElementById("emp-tracking").innerHTML = `<b>Tracking: </b>${flight}`;
	            console.log("Flight added to user");
	            document.getElementById("emp-fetch-failed").style.display = "none";
	            document.getElementById("emp-fetch").style.display = "block";
	            document.getElementById("emp-new-flight").style.display = "none";
	            document.getElementById("ER-depart").style.display = "none";
				document.getElementById("ER-arrive").style.display = "none";
				document.getElementById("emp-flyToPlane").style.display = "none";
	            loadERplane(flight);
	            addIfPlaneAvail(null, flight);
	        }
	        else{
	            console.log("Could not add flight to user");
	        }
		})
	//addslitsener(flight);
}

function addslitsener(flight) {
	//document.getElementById("emp-tracking").style.color = "blue";
	//document.getElementById("emp-tracking").style.border = "groove";
	//console.log("did this");
	document.getElementById("emp-flyToPlane").addEventListener("click", (e) => {
	document.body.scrollTop = document.body.scrollHeight;
    document.documentElement.scrollTop = document.body.scrollHeight;
	flyToPlane(flight);
});
}

function showNewPerson(name, email){
	loadEmpToMap({name : name, email: email});
	loadEmployee({name : name, email: email});

};

function clearform(){
	document.getElementById("errormsg").innerHTML = "";
	document.getElementById("uname").value = "";
	document.getElementById("uemail").value = "";
}


function SetEmpInfo(info){
 nameofusr = info.name;
 loadEmployees(info.name);
 loadERplane(info.tracking);
 document.getElementById("welcome-msg").innerHTML = "Welcome "+nameofusr;
 document.getElementById("emp-name").innerHTML = info.name;
 document.getElementById("emp-mail").innerHTML = "<b>E-mail:</b> "+info.email;
 document.getElementById("emp-company").innerHTML = "<b>Company:</b> "+info.companyName;
 document.getElementById("emp-tracking").innerHTML = "<b>Tracking:</b> none";
 if (info.tracking != null) {
 	document.getElementById("emp-tracking").innerHTML = "<b>Tracking:</b> "+info.tracking;
 	//addslitsener(info.tracking);
 }
};

function checkMail(mail){
	//http://regexlib.com/REDetails.aspx?regexp_id=16
	var validator = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
	return validator.test(mail);
}

function loadEmployee(empObject){
	let empCell = document.getElementById("employer-cell");
	let personAdder = document.getElementById("person-adder");
	let tracking = (empObject.trackingIcao24 == null || empObject.trackingIcao24 == "") ? "Nothing" : empObject.trackingIcao24;

	let assignForm = document.createElement("div");
	assignForm.classList.add("assignFlight");
	assignForm.innerHTML = 
	`<label>Assign flight</label>
	<input type="text" id="${empObject.name}-input" placeholder="Enter flight..."><br>`;

	let newPerson = document.createElement("div");
	newPerson.classList.add("person");
	newPerson.id = empObject.name;

	let personInfo = document.createElement("p");
	personInfo.classList.add("person-info");
	personInfo.innerHTML = 
		`<b>Name: </b>${empObject.name}<br>
	 	<b>E-mail: </b>${empObject.email}<br>
		<label id="${empObject.name}-tracking"><b>Tracking: </b>${tracking}</label><br>`;

	let deleteBtn = document.createElement("button");
	deleteBtn.classList.add("EE-btn");
	deleteBtn.innerHTML = "Delete";
	deleteBtn.addEventListener("click", (e) => {
		deleteEmployee(empObject.name, newPerson);
	})  

	let assignBtn = document.createElement("button");
	assignBtn.classList.add("EE-btn");
	assignBtn.innerHTML = "Assign flight";
	assignBtn.addEventListener("click", (e) => {
		showSetFlightForm(empObject.name);
		console.log("assign");
	})

	newPerson.appendChild(assignForm);
	newPerson.innerHTML += 
		`<div class="overlay">
            <img src="pictures/Dummy-Profile.png">
            <h2>${empObject.name}</h2>
        </div>`;

	empCell.insertBefore(newPerson,personAdder);
	personInfo.appendChild(assignBtn);
	personInfo.appendChild(deleteBtn);
	newPerson.appendChild(personInfo);
}

function loadEmployees(name){
	AJAXget(`/getEmployees?employer=${name}`, (res) =>{
		if(res != ""){
			let employees = JSON.parse(res);
			employees.forEach((emp) => {
				loadEmployee(emp);
				loadEmpToMap(emp);
			});
		}
	});
}

function showSetFlightForm(name){
	let cancelBtn = document.createElement("button");
	cancelBtn.innerHTML = "Cancel";
	cancelBtn.classList.add("EE-btn");
	cancelBtn.addEventListener("click", (e)=>{
		console.log("cancel");
		hideSetFlightForm(name);
		cancelBtn.remove();
		confirmBtn.remove();
	});

	let confirmBtn = document.createElement("button");
	confirmBtn.classList.add("EE-btn");
	confirmBtn.innerHTML = "Assign";
	confirmBtn.addEventListener("click", (e) => {
		let flight = document.getElementById(name+"-input").value;
		console.log(flight);
		if(flight != ""){
			setEmployeeFlight(name, flight);
		}
		else{
			document.getElementById(name+"-tracking").innerHTML = `<b>Tracking: </b>Nothing`;
			document.getElementById(`sidebar-track-${name}`).innerHTML = "Nothing";
		}
		hideSetFlightForm(name);
		cancelBtn.remove();
		confirmBtn.remove();
	});

	let form = document.getElementById(name).children[0];
	form.classList.add("showAssign");
	form.appendChild(cancelBtn);
	form.appendChild(confirmBtn);
}

function hideSetFlightForm(name){
	let form = document.getElementById(name).children[0];
	form.classList.remove("showAssign");
}

function setEmployeeFlight(employee, flightIcao){
	AJAXget(`/flightToDB?usertype=employee&flightIcao=${flightIcao}&name=${employee}`, (res)=>{
		if(res == "true"){
			removePlane(document.getElementById(`sidebar-track-${employee}`).innerHTML)
			document.getElementById(employee+"-tracking").innerHTML = `<b>Tracking: </b>${flightIcao}`;
			document.getElementById(`sidebar-track-${employee}`).innerHTML = flightIcao;
            console.log("Flight added to user");
            addIfPlaneAvail(employee, flightIcao);
        }
        else{
            console.log("Could not add flight to user");
        }
	})
}

function deleteEmployee(employee, empPersonEl){
	AJAXget(`/deleteEmployee?employee=${employee}`, (response)=>{
		if(response == "success"){
			empPersonEl.remove();
			document.getElementById(`sidebar-${employee}`).remove();
			console.log("Deletion of employee success");
		} 
		else {
			console.log("Could not delete employee");
		} 
	})
}

function loadEmpToMap(emp){
	let newDiv = document.createElement("div");
	newDiv.classList.add("sidebar-person");
	newDiv.id = `sidebar-${emp.name}`;
	let img = document.createElement("img");
	img.src = "pictures/Dummy-Profile.png";
	img.classList.add("sidebar-img");
	
	let flight = (emp.trackingIcao24 == null || emp.trackingIcao24 == "") ? "Nothing" : emp.trackingIcao24;
	if(flight != "Nothing"){
		addIfPlaneAvail(emp.name, flight);
	}

	newDiv.addEventListener("click", (e) =>{
		flyToPlane(document.getElementById(`sidebar-track-${emp.name}`).innerHTML);
	})
	let labels = `${emp.name}<br>Tracking:<label id="sidebar-track-${emp.name}">${flight}</label>`;
	newDiv.appendChild(img);
	newDiv.innerHTML += labels;

	document.getElementById("map-sidebar").appendChild(newDiv);
}

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

function loadERplane(flightIcao){
	AJAXget("/getAirplane?flightIcao="+flightIcao, (planeInfo) => {
		if(planeInfo != ""){
			planeInfo = JSON.parse(planeInfo);
			let arrivalAirport = planeInfo.arrivalAirport ? `&emsp; <b>Country:</b> ${planeInfo.arrivalAirport.country}<br>
			&emsp; <b>City:</b> ${planeInfo.arrivalAirport.city}<br>
			&emsp; <b>Airport:</b> ${planeInfo.arrivalAirport.name}` : "&emsp;Unavailable";

			let depatureAirport = planeInfo.depatureAirport ? `&emsp; <b>Country:</b> ${planeInfo.depatureAirport.country}<br>
			&emsp; <b>City:</b> ${planeInfo.depatureAirport.city}<br>
			&emsp; <b>Airport:</b> ${planeInfo.depatureAirport.name}` : "&emsp;Unavailable";

			let depart = document.getElementById("ER-depart");
			let arrive = document.getElementById("ER-arrive");
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
				document.getElementById("emp-tracking").innerHTML = `<b>Tracking: </b>${newFlight}`;
	            console.log("Flight added to user");
	            document.getElementById("emp-fetch-failed").style.display = "none";
	            document.getElementById("emp-fetch").style.display = "block";
	            document.getElementById("emp-new-flight").style.display = "none";
	            document.getElementById("ER-depart").style.display = "none";
				document.getElementById("ER-arrive").style.display = "none";
				document.getElementById("emp-flyToPlane").style.display = "none";
	            loadERplane(newFlight);
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



