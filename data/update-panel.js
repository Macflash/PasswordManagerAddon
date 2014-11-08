// Fetch button dialog options
var fillButton = document.getElementById("fill");
var pinfoButton = document.getElementById("pinfo");
var userpButton = document.getElementById("userp");

var save-pinfoButton = document.getElementById("save-pinfo");
var save-userpButton = document.getElementById("save-userp");

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

// Add click listeners
fillButton.addEventListener("click", 
  function(){
    // Send a fill message back to the main thread
    self.port.emit("fill-request");
    self.hidePopup();
  });
pinfoButton.addEventListener("click",
  function(){
    // Requests personal info object from main thread
    self.port.emit("pinfo-request");
  });
userpButton.addEventListener("click", function(){});

function changeDialoag(file){

}

// Add Save button click listeners
save-pinfoButton.addEventListener("click",
  function(){
    var saveObj = personalInfoObject(	firstInput.value,
					lastInput.value,
  					addressInput.value,
  					stateInput.value,
  					countryInput.value,
  					phoneInput.value,
  					emailInput.value);
  self.port.emit("save-pinfo-request", saveObj);
  });

// Add response listeners

// Listen for saved info response
self.port.on("pinfo-response", function(savedInfo){
  // Display pinfo div and hide buttons
  pinfoDiv.style.display = "block";
  buttonDiv.style.display = "none";

  // Fill in the values if we have some saved
  var savedObj = JSON.parse(savedInfo);
  firstInput.value = savedObj.first;
  lastInput.value = savedObj.last;
  addressInput.value = savedObj.address;
  stateInput.value = savedObj.state;
  countryInput.value = savedObj.country;
  phoneInput.value = savedObj.phone;
  emailInput.value = savedObj.email;
});

self.port.on("show", function onShow() {
  //textArea.focus();
});

// Create password object
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