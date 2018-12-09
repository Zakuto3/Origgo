
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

document.getElementById("bestgoy").addEventListener("click", (e) => {
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
	//create form
	//inputX2
	//button
	//button.click(addperson(name, email))
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
				showNewPerson(member,mailChecked);
			}
			else if(response == "ER_DUP_ENTRY") {
				document.getElementById("errormsg").innerHTML = "Member already exists";
				}
			else 
				console.log("Employee not added");
		});
	}
}


function showNewPerson(name, email){
 let bambi = document.getElementById("bambi");
 let persons = document.getElementById("bestgoy");
 let brn = document.createElement("div");

 let newperson = `<div class="person">
	                <div class="overlay">
	                    <img src="pictures/Dummy-Profile.png">
	                    <h2>${name}</h2>
	                    <h3>tracking: none</h3>
	                </div>
                </div>`;
 brn.innerHTML = newperson;
bambi.insertBefore(brn,persons);

};

function clearform(){
	document.getElementById("errormsg").innerHTML = "";
	document.getElementById("uname").value = "";
	document.getElementById("uemail").value = "";
}


function SetEmpInfo(info){
 nameofusr = info.name;
 document.getElementById("emp-name").innerHTML = info.name;
 document.getElementById("emp-mail").innerHTML = "E-mail: "+info.email;
 document.getElementById("emp-company").innerHTML = "Company: "+info.companyName;
 document.getElementById("emp-tracking").innerHTML = "Tracking: none";
 if (info.tracking != null) {document.getElementById("emp-tracking").innerHTML = "Tracking: "+info.tracking;}
};

function checkMail(mail){
	//http://regexlib.com/REDetails.aspx?regexp_id=16
	var validator = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
	return validator.test(mail);
}