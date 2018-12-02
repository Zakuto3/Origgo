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

function addEmployer(employer, company){
	let mailChecked = checkMail(employer.mail);
	if(!mailChecked) { console.log("Not a valid E-mail"); }
	else if (employer.name.length < 1) { console.log("Need to have a name"); }
	else {
		AJAXget(`/addEmployer?empName=${employer.name}&empMail=${employer.mail}&compCode=${company.code}&compName=${company.name}`, (response)=>{
			if(response == "success"){
				console.log("employer added");
				let opt = document.createElement("option");
				opt.textContent = employer.name;
				document.getElementById("employer-selector").appendChild(opt);
			}
			else if(response == "ER_DUP_ENTRY") 
				console.log("Employer already exists");
			else 
				console.log("Employer not added");
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
	if(!mailChecked) { console.log("Not a valid E-mail"); }
	else if (employee.name.length < 1) { console.log("Need to have a name"); }
	else {
		AJAXget(`/addEmployee?empName=${employee.name}&empMail=${employee.mail}&employer=${employer}`, (response)=>{
			if(response == "success"){
				console.log("employee added");
				let opt = document.createElement("option");
				opt.textContent = employee.name;
				document.getElementById("employee-selector").appendChild(opt);

			}
			else if(response == "ER_DUP_ENTRY") 
				console.log("Employee already exists");
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
		}
		else console.log("Could not reset password");
	})
}

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
		}
		else console.log("could not transfer");
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
		}
		else console.log("could not transfer");
	})
}

function addCompany(company){

}

function deleteEmployer(employer){

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
		} 
		else console.log("Could not delete employee");
	})
}

function deleteCompany(company){

}

document.getElementById("employee-selector").addEventListener("change", (e) => {
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



