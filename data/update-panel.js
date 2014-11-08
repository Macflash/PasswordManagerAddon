function passwordObject(user, pword, action){
	this.username = user;
	this.password = pword;
	this.action = action;
}

// Create personal info object
function personalInfoObject(first, last, address, state, country, phone, email) {
	this.first = first;
	this.last = last;
	this.address = address;
	this.state = state;
	this.country = country;
	this.phone = phone;
	this.email = email;
}

// Fetch button dialog options
var fillButton = document.getElementById("fill");
var pinfoButton = document.getElementById("pinfo");
var userpButton = document.getElementById("userp");

var savepinfoButton = document.getElementById("save-pinfo");
var saveuserpButton = document.getElementById("save-userp");

var buttonDiv = document.getElementById("buttonDiv");
var pinfoDiv = document.getElementById("pinfoDiv");
var userpDiv = document.getElementById("userpDiv");

var firstInput = document.getElementById("first");
var lastInput = document.getElementById("last");  
var addressInput = document.getElementById("address");  
var stateInput = document.getElementById("state"); 
var countryInput = document.getElementById("country");  
var phoneInput = document.getElementById("phone");  
var emailInput = document.getElementById("email");  

//Add click listeners
fillButton.addEventListener("click", 
function(){
  // Send a fill message back to the main thread
  self.port.emit("fill-request");
  self.hide();
});

pinfoButton.addEventListener("click",
function(){
  // Requests personal info object from main thread
  self.port.emit("pinfo-request");
});

userpButton.addEventListener("click", function(){});
var newSaveObj;
//Add Save button click listeners
savepinfoButton.addEventListener("click",
function(){
	console.log(firstInput.value);
	console.log(lastInput.value);
	console.log(addressInput.value);
	console.log(stateInput.value);
	console.log(countryInput.value);
	console.log(phoneInput.value);
	console.log(emailInput.value);
	newSaveObj = new personalInfoObject(
						firstInput.value,
						lastInput.value,
						addressInput.value,
						stateInput.value,
						countryInput.value,
						phoneInput.value,
						emailInput.value);
	console.log(JSON.stringify(newSaveObj));
	self.port.emit("save-pinfo-request", newSaveObj);
});

//Add response listeners
self.port.on("save-pinfo-response",
function(){
	// Reset the visibility for the popup
	pinfoDiv.style.display = "none";
	buttonDiv.style.display = "block";
});

//Listen for saved info response
self.port.on("pinfo-response", function(savedInfo){
	// Display pinfo div and hide buttons
	pinfoDiv.style.display = "block";
	buttonDiv.style.display = "none";
	
	// Fill in the values if we have some saved
	if(savedInfo){
		var savedObj = JSON.parse(savedInfo);
		if(savedObj){
			firstInput.value = savedObj.first;
			lastInput.value = savedObj.last;
			addressInput.value = savedObj.address;
			stateInput.value = savedObj.state;
			countryInput.value = savedObj.country;
			phoneInput.value = savedObj.phone;
			emailInput.value = savedObj.email;
		}
	}
});

self.port.on("show", function onShow() {
//textArea.focus();
});
