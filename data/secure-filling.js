
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

// Write object to file
function saveToFile(object) {
	let encoder = new TextEncoder();              
	let text = JSON.stringify(object);
	let array = encoder.encode(text);
	let promise = OS.File.writeAtomic("file.txt", array, {tmpPath: "file.txt.tmp"});    
	return promise;
}

// Read object from file
function readFromFile() {
	let decoder = new TextDecoder();
	let promise = OS.File.read("file.txt");
	promise = promise.then(
	function onSuccess(array) {
	return decoder.decode(array);
	});
	return promise;
}

// Fill element el with value val if currently filled with dummy
function fillTrue(el, val) {
	style = window.getComputedStyle(el, null);
	disp = style.getPropertyValue("display");
	vis = style.getPropertyValue("visibility");
	if ((disp == "none") || (vis == "hidden")) {
		var conf = window.confirm("Fill hidden field?");
		if (conf == false) {
			console.log("Not filling hidden field");
			return;
		}
	}
	var rect = el.getBoundingClientRect();
	if ((rect.left < 0) || (rect.top < 0)) {
		console.log("Not filling off-screen field");
		return;
	}
	if (el.type.toLowerCase() == "password") {
		if (el.value != dummy) {
			console.log("Not filling modified password field");
		}
	}
	el.value = val;
}

// Get input elements with name or id matching regex rx
function getMatches(rx) {
	var elArray = [];
	var tmp = document.getElementsByName("*");
	for (var i = 0; i < tmp.length; i++) {
		if (rx.test(tmp[i].name)) {
			if (el.tagName.toLowerCase() == "input") {
				elArray.push(tmp[i]);
			}
		}
	}
	tmp = document.getElementById
	return elArray;
}

/*
console.log("button clicked");
let obj = new passwordObject("Steve", "1234", "test.test");
saveToFile(obj);
console.log("object saved");
let text = readFromFile();
console.log("object read");
*/
var obj = new passwordObject("Steve", "1234", "test.test");
var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
	var form = inputs[i].form;
	if(form){
	  if (form.action == obj.action) {
		// use regex to get name/id of field to determine what to fill with
		// Ex: if current input is for username, use:
		// fillTrue(inputs[i], obj.username);
	  }
	}
	if (inputs[i].type.toLowerCase() == 'password') {
		inputs[i].value = obj.password;
	}
}