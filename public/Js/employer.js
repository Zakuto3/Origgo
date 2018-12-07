
document.getElementById("bestgoy").addEventListener("click", (e) => {
	showAddForm();
});

function showAddForm(){
	document.getElementById("addUserForm").style.display = "block";
	//create form
	//inputX2
	//button
	//button.click(addperson(name, email))
}

function addpersons(name, email){

 let bambi = document.getElementById("bambi");
 let persons = document.getElementById("bestgoy");
 let brn = document.createElement("div");

 let newperson = `<div class="person">
	                <div class="overlay">
	                    <img src="pictures/Dummy-Profile.png">
	                    <h2>${name}</h2>
	                    <h2>tracking</h2>
	                </div>
                </div>`;
 brn.innerHTML = newperson;
bambi.insertBefore(brn,persons);

};
