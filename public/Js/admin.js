// function checkAdmin(){
// 	AJAXget("/checkUserType", (res) => {
// 		console.log("check1",res);
// 		res = JSON.parse(res);
// 		if(!res.type){
// 			window.location.href=`/Index.html`;
// 		}
// 		else if(res.type != "admin"){
// 			window.location.href=`/Index_${res.type}.html`;
// 		}
// 		else{
// 			document.getElementById("admin-welcome").innerHTML = "Welcome "+res.name;
// 		}
// 		console.log(res);
// 	})
// }
// checkAdmin();

function fillDropDown(items, dropdown){
	for (let i = 0; i < dropdown.options.length; i++) {
		if(dropdown.options[i].disabled != true) 
			dropdown.remove(i);
	}
	items.forEach((option)=>{
		let opt = document.createElement("option");
		opt.textContent = option;
		dropdown.appendChild(opt);
	})
}

document.getElementById("add-employer").addEventListener("click", (e) =>{
	let companyDrop = document.getElementById("company-selector");
	let employer = {
		name : document.getElementById("new-empName").value,
		mail : document.getElementById("new-empMail").value
	};
	let company = {
		name : companyDrop.options[companyDrop.selectedIndex].text,
		code : document.getElementById("company-code").innerHTML
	};
	addEmployer(employer, company);
})

function checkMail(mail){
	//http://regexlib.com/REDetails.aspx?regexp_id=16
	var validator = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
	return validator.test(mail);
}

function showSuccess(msg, elementToAppend, successId){
	let successMsg = document.createElement("span");
	successMsg.classList.add("success-msg");
	successMsg.id = successId;
	successMsg.innerHTML = msg;
	elementToAppend.appendChild(successMsg);
	setTimeout(()=>{
		successMsg.remove();
	}, 3000);

}

function showError(msg, elementToAppend, errId){
	let errormsg = document.createElement("span");
	errormsg.classList.add("errormsg");
	errormsg.id = errId;
	errormsg.innerHTML = msg;
	elementToAppend.appendChild(errormsg);
	setTimeout(()=>{
		errormsg.remove();
	}, 3000);
}

function addEmployer(employer, company){
	let mailChecked = checkMail(employer.mail);
	if(!mailChecked) {
		if(!document.getElementById("employer-mail-fail")){
			showError("Not a valid E-mail", document.getElementById("add-employer").parentNode, "employer-mail-fail");
	 		console.log("Not a valid E-mail"); 
		}
	}
	else if (employer.name.length < 1) {
		if(!document.getElementById("employer-short")){
			showError("Needs to have a name", document.getElementById("add-employer").parentNode, "employer-short");
		 	console.log("Need to have a name"); 
		}
	}
	else {
		AJAXget(`/addEmployer?empName=${employer.name}&empMail=${employer.mail}&compCode=${company.code}&compName=${company.name}`, (response)=>{
			if(response == "success"){
				console.log("employer added");
				addOpt(document.getElementById("employer-selector"), employer.name);
				addOpt(document.getElementById("employer-transfer-selector"), employer.name);
				showSuccess(`${employer.name} was added`, document.getElementById("add-employer").parentNode, "added-employer");
			}
			else if(response == "ER_DUP_ENTRY") {
				if(!document.getElementById("ER_DUP_ENTRY-employer")){
					showError("Employer already exists", document.getElementById("add-employer").parentNode, "ER_DUP_ENTRY-employer");
					console.log("Employer already exists");
				}
			}
			else {
				console.log("Employer not added");
			}
		});
	}
		
}

document.getElementById("add-employee").addEventListener("click", (e)=> {
	let employerDrop = document.getElementById("employer-selector");
	let employee = {
		name : document.getElementById("new-empeeName").value,
		mail : document.getElementById("new-empeeMail").value
	};
	let employer = employerDrop.options[employerDrop.selectedIndex].text;
	addEmployee(employee, employer);
})

function addEmployee(employee, employer){
	let mailChecked = checkMail(employee.mail);
	if(!mailChecked) {
		if(!document.getElementById("employee-mail-fail")){
			showError("Not a valid E-mail", document.getElementById("add-employee").parentNode, "employee-mail-fail");
	 		console.log("Not a valid E-mail"); 
		}
	}
	else if (employee.name.length < 1) {
		if(!document.getElementById("employee-short")){
			showError("Needs to have a name", document.getElementById("add-employee").parentNode, "employee-short");
		 	console.log("Need to have a name"); 
		}
	}
	else {
		AJAXget(`/addEmployee?empName=${employee.name}&empMail=${employee.mail}&employer=${employer}`, (response)=>{
			if(response == "success"){
				console.log("employee added");
				let opt = document.createElement("option");
				opt.textContent = employee.name;
				document.getElementById("employee-selector").appendChild(opt);
				showSuccess(`${employee.name} was added`, document.getElementById("add-employee").parentNode, "added-employee");

			}
			else if(response == "ER_DUP_ENTRY") 
				if(!document.getElementById("employee-exists")){
					showError("Employee already exists", document.getElementById("add-employee").parentNode, "employee-exists");
					console.log("Employee already exists");
				}
			else 
				console.log("Employee not added");
		});
	}
}

loadDropdowns();
function loadDropdowns(){
	getEmployers();
	getCompanies();	
	getEmployees();
}

document.getElementById("reset-employee").addEventListener("click", (e)=>{
	let dropdown = document.getElementById("employee-selector");
	let username = dropdown.options[dropdown.selectedIndex].text;
	resetPass(username, "employee");
});

document.getElementById("reset-employer").addEventListener("click", (e)=>{
	let dropdown = document.getElementById("employer-selector");
	let username = dropdown.options[dropdown.selectedIndex].text;
	resetPass(username, "employer");
});

function resetPass(user, userType){
	AJAXget(`/resetPass?user=${user}&usertype=${userType}`, (response) =>{
		if(response == "success"){
			console.log("pass resetted");
			if(!document.getElementById("reset-success"))
				showSuccess("Password resetted for "+user, document.getElementById(userType+"-selector").parentNode, "reset-success");
		}
		else{
			if(!document.getElementById("reset-fail"))
				showError("Could not reset password", document.getElementById(userType+"-selector").parentNode, "reset-fail");
			console.log("Could not reset password");
		} 
	})
}

document.getElementById("employer-transfer-selector").addEventListener("change", (e) => {
	document.getElementById("transfer-employee").disabled = false;
});

document.getElementById("company-transfer-selector").addEventListener("change", (e) =>{
	document.getElementById("transfer-employer").disabled = false;
})

document.getElementById("transfer-employee").addEventListener("click", (e)=>{
	let employerDropdown = document.getElementById("employer-transfer-selector");
	let employer = employerDropdown.options[employerDropdown.selectedIndex].text;
	let employeeDropdown = document.getElementById("employee-selector");
	let employee = employeeDropdown.options[employeeDropdown.selectedIndex].text;
	changeEmployer(employee, employer);
})

function changeEmployer(employee, employer){
	AJAXget(`/transferEmployee?employee=${employee}&employer=${employer}`, (response)=>{
		if(response == "success") {
			console.log(employee + " transfered to " + employer);
			getEmployeeInfo(employee);
			if(!document.getElementById("employee-transfered"))
				showSuccess(employee + " transfered to " + employer, document.getElementById("transfer-employee").parentNode, "employee-transfered");
		}
		else {
			if(!document.getElementById("employee-transErr"))
				showError("Could not transfer", document.getElementById("transfer-employee").parentNode, "employee-transErr");
			console.log("could not transfer");
		}
	})
}

document.getElementById("transfer-employer").addEventListener("click", (e) =>{
	let companyDropdown = document.getElementById("company-transfer-selector");
	let company = companyDropdown.options[companyDropdown.selectedIndex].text;
	let employerDropdown = document.getElementById("employer-selector");
	let employer = employerDropdown.options[employerDropdown.selectedIndex].text;
	changeCompany(employer, company);
})

function changeCompany(employer, company) {
	AJAXget(`/transferEmployer?employer=${employer}&company=${company}`, (response)=>{
		if(response == "success") {
			console.log(employer + " transfered to " + company);
			getEmployerInfo(employer);
			if(!document.getElementById("employer-transfered"))
				showSuccess(employer + " transfered to " + company, document.getElementById("transfer-employer").parentNode, "employer-transfered");
		}
		else{
		 	console.log("could not transfer");
		 	if(!document.getElementById("employer-transErr"))
		 		showError("Could not transfer", document.getElementById("transfer-employer").parentNode, "employer-transErr");
		}
	})
}

document.getElementById("add-company").addEventListener("click", (e) =>{
	let newcompany = document.getElementById("new-comp").value;
	addCompany(newcompany);
});

document.getElementById("new-comp").addEventListener("keyup",(e) =>{
	if(e.srcElement.value.length > 0)
		document.getElementById("add-company").disabled = false;
	else 
		document.getElementById("add-company").disabled = true;
})

function addCompany(company){
	AJAXget(`/addCompany?newcompany=${company}`, (response) =>{
		if(response != "fail"){
			console.log(response);
			showSuccess(company+" was added", document.getElementById("add-company").parentNode);
			document.getElementById("newCode").innerHTML = response;
			addOpt(document.getElementById("company-transfer-selector"), company);
			addOpt(document.getElementById("company-selector"), company);
		}
		else{
			if(!document.getElementById("addCompErr"))
				showError(company+" could not be added", document.getElementById("add-company").parentNode, "addCompErr");
			console.log("Company could not be added");
		}
	});
}

document.getElementById("delete-employer").addEventListener("click", (e) =>{
	let dropdown = document.getElementById("employer-selector");
	let selected = dropdown.options[dropdown.selectedIndex].text;
	deleteEmployer(selected);
})

function deleteEmployer(employer){
	AJAXget(`/deleteEmployer?employer=${employer}`, (response)=>{
		if(response == "success"){
			console.log("Deletion of employer success");
			let employers = document.getElementById("employer-selector");
			deleteOpt(document.getElementById("employer-transfer-selector"), employer);
			deleteOpt(employers, employer);
			getEmployerInfo(employers.options[employers.selectedIndex].text);
			let employees = document.getElementById("employee-selector");
			getEmployeeInfo(employees.options[employees.selectedIndex].text);
			showSuccess(employer+" deleted", document.getElementById("delete-employer").parentNode.parentNode, "employer-deleted");
		} 
		else {
			console.log("Could not delete employer");
			if(!document.getElementById("employer-deleteErr"))
				showError("Could not delete "+employer, document.getElementById("delete-employer").parentNode.parentNode, "employer-deleteErr");
		}
	})
}

function deleteOpt(dropdown, opt){
	for(let i = 0; i < dropdown.options.length; i++){
		if(dropdown.options[i].textContent == opt){
			dropdown.remove(i);
		}
	}
}

function addOpt(dropdown, opt){
	let newOpt = document.createElement("option");
	newOpt.textContent = opt;
	dropdown.appendChild(newOpt);
}

document.getElementById("delete-employee").addEventListener("click", (e)=>{
	let dropdown = document.getElementById("employee-selector");
	let selected = dropdown.options[dropdown.selectedIndex].text;
	deleteEmployee(selected);
})

function deleteEmployee(employee){
	AJAXget(`/deleteEmployee?employee=${employee}`, (response)=>{
		if(response == "success"){
			console.log("Deletion of employee success");
			let employees = document.getElementById("employee-selector");
			employees.remove(employees.selectedIndex);
			getEmployeeInfo(employees.options[employees.selectedIndex].text)
			showSuccess(employee+" deleted", document.getElementById("delete-employee").parentNode.parentNode, "employee-deleted");
		} 
		else {
			console.log("Could not delete employee");
			if(!document.getElementById("employee-deleteErr"))
				showError("Could not delete "+employee, document.getElementById("delete-employee").parentNode.parentNode, "employee-deleteErr");
		} 
	})
}

document.getElementById("delete-company").addEventListener("click", (e) =>{
	let dropdown = document.getElementById("company-selector");
	let selected = dropdown.options[dropdown.selectedIndex].text;
	deleteCompany(selected);
})

function deleteCompany(company){
	AJAXget(`/deleteCompany?company=${company}`, (response)=> {
			if(response == "success"){
				deleteOpt(document.getElementById("company-selector"),company);
				deleteOpt(document.getElementById("company-transfer-selector"),company);
				let currentemp = document.getElementById("employer-selector").options[document.getElementById("employer-selector").selectedIndex].text;
				getEmployerInfo(currentemp);
				showSuccess(company+" was deleted.",document.getElementById("delete-company").parentNode);
			}
			else{
				showError(company+" could not be deleted.",document.getElementById("delete-company").parentNode);
			}
	})
}

document.getElementById("employee-selector").addEventListener("change", (e) => {
	document.getElementById("employer-transfer-selector").disabled = false;
	document.getElementById("delete-employee").disabled = false;
	document.getElementById("reset-employee").disabled = false;
	let dropdown = e.srcElement;
	let current = dropdown.options[dropdown.selectedIndex].text;
	getEmployeeInfo(current);
})

function getEmployeeInfo(employee) {
	AJAXget(`/getEmployees?employee=${employee}`, (response)=> {
		console.log("getEmployeeInfo: ", response);
		if(response != ""){
			let userInfo = JSON.parse(response)[0];
			console.log("EmployeeInfo: ", userInfo);
			let tracking = (userInfo.trackingIcao24 != null && userInfo.trackingIcao24 != "") ? userInfo.trackingIcao24 : "Nothing";
			let userString = `<b>UID</b> : ${userInfo.UID}<br>Name : ${userInfo.name}<br>E-mail: ${userInfo.email}<br>Employer : ${userInfo.employer}<br>Tracking : ${tracking}`;
			document.getElementById("employee-info").innerHTML = userString;
		}
	})
}

document.getElementById("employer-selector").addEventListener("change", (e) => {
	document.getElementById("company-transfer-selector").disabled = false;
	document.getElementById("add-employee").disabled = false;
	document.getElementById("delete-employer").disabled = false;
	document.getElementById("reset-employer").disabled = false;
	let dropdown = e.srcElement;
	let current = dropdown.options[dropdown.selectedIndex].text;
	getEmployerInfo(current);
})

function getEmployerInfo(employer) {
	AJAXget(`/getEmployers?employer=${employer}`, (response)=> {
		console.log("getEmployerInfo: ", response);
		if(response != ""){
			let userInfo = JSON.parse(response)[0];
			console.log("userInfo: ", userInfo);
			let tracking = (userInfo.trackingIcao24 != null && userInfo.trackingIcao24 != "") ? userInfo.trackingIcao24 : "Nothing";
			let userString = `<b>UID</b> : ${userInfo.UID}<br>Name : ${userInfo.name}<br>E-mail: ${userInfo.email}<br>Company : ${userInfo.companyName}<br>Tracking : ${tracking}`;
			document.getElementById("employer-info").innerHTML = userString;
		}
	})
}

function getEmployers() {
	AJAXget(`/getEmployers`, (response) =>{
		console.log("getEmployers: ",response);
		let employerNames = [];
		let employers = JSON.parse(response);
		employers.forEach((employer) => {
			employerNames.push(employer.name);
		})
		fillDropDown(employerNames, document.getElementById("employer-transfer-selector"));
		fillDropDown(employerNames, document.getElementById("employer-selector"));
	})
}

function getCompanies() {
	AJAXget(`/getCompanies`, (response)=>{
		console.log("getCompanies: ",response);
		if(response != ""){				
			let companies = JSON.parse(response);
			let names = []
			companies.forEach((company) => {
				names.push(company.company);
			});
			fillDropDown(names, document.getElementById("company-transfer-selector"));
			fillDropDown(names, document.getElementById("company-selector"));
		}
	})
}

function getEmployees() {
	AJAXget(`/getEmployees`, (response) =>{
		let employeeNames = [];
		let employees = JSON.parse(response);
		employees.forEach((employee) => {
			employeeNames.push(employee.name);
		})
		fillDropDown(employeeNames, document.getElementById("employee-selector"));
	})
}

document.getElementById("company-selector").addEventListener("change", (e)=>{
	document.getElementById("delete-company").disabled = false;
	document.getElementById("add-employer").disabled = false;
	let dropdown = e.srcElement;
	let current = dropdown.options[dropdown.selectedIndex].text;
	getCompanyCode(current);
})

function getCompanyCode(company){
	AJAXget(`/getCompanies?company=${company}`, (response)=>{
		if(response != ""){
			let company = JSON.parse(response);
			document.getElementById("company-code").innerHTML = company[0].code;
		}
		else document.getElementById("company-code").innerHTML = "No code found";
	})
}



