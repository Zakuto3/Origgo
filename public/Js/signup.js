let elobj;
let check;

(()=>{
	AJAXget(`/getCompanies`, (response)=>{
		if(response != ""){				
			let companies = JSON.parse(response);
			let selecter = document.createElement("select");
			selecter.id = "CompSelector";
			companies.forEach((company) => {
				let opt = document.createElement("option");
				opt.value = company.company;
				opt.textContent = company.company;
				selecter.appendChild(opt);
				//names.push(company.company);
			});
			document.getElementById("comp").appendChild(selecter);
			//fillDropDown(names, document.getElementById("company-transfer-selector"));
			//fillDropDown(names, document.getElementById("company-selector"));
		}
	})
   //  let selector = ''+
   //  '<select id="CompSelector">'+
   //  '<option value="google">Google</option>'+
   //  '<option value="intel">Intel</option>'+
   //  '<option value="microsoft">Microsoft</option>'+
   //  '<option value="imb">IMB</option>'+
   //  '</select>';
   // document.getElementById("comp").innerHTML += selector;
})();

function signupRequest(){
	const el = ['Username', 'Password', 'Mail', 'keycode'];
	elobj = {};
	check = true;
	el.forEach((elems) => {
		elobj[elems] = document.getElementById(elems).value;
		if (!elobj[elems]) 
			{
				document.getElementById("errormsg").innerHTML = "Please fill " + elems;
				check = false;
			}		
	});
	if (elobj['Password'].length < 5) {
		document.getElementById("errormsg").innerHTML = "Password is to short";
		check = false;
	}
	if (check) {runPost();}
	console.log(param(elobj));
};	

let runPost = function postSignup(){	
	req = new XMLHttpRequest();
	req.open('post','/signupForm');
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send(param(elobj));
	
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			if (req.responseText == '1') {
				window.location.href="/index.html";
			}else{
				document.getElementById("errormsg").innerHTML = "Something went wrong, try again later.."		
			}
		}
		else if (this.status !== 200 && this.readyState != 4) {
			alert('Request failed.  Returned status of ' + req.status);
		}
	};
};

function param(object) {
    var encodedString = '';
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (encodedString.length > 0) {
                encodedString += '&';
            }
            encodedString += encodeURI(prop + '=' + object[prop]);
        }
    }
    return encodedString + '&' + encodeURI("CompSelector" + '=' + grabcomp());
}


function grabcomp() {
    var e = document.getElementById("CompSelector");
	var compstring = e.options[e.selectedIndex].text;
	return compstring;
}