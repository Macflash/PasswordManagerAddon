var inputs = document.getElementsByTagName('input');
var form = document.getElementsByTagName('form');
var dummy = self.options.dummyval;
var truedoc = "";
var usernameInput;
var passwordInput;
var firstInput;
var lastInput;  
var addressInput;
var cityInput;
var stateInput; 
var countryInput;  
var phoneInput;  
var emailInput;

var loginInfo;
var personalInfo;
var loginForm;
var waitingForInfo = false;

//Receive all our saved information

self.port.on("saved-userp", function(saveObj){
	//console.log("got response");
	//store the save object info
	if(saveObj){
		console.log("recieved save data");
		loginInfo = saveObj;
	}
	else{console.log("no save data");}
	if(personalInfo){ checkForms(); }
	//if we were waiting call the submission function
	if(waitingForInfo){
		formSubmitter();
	}
});

self.port.on("tab-url", function(url){ truedoc = url; });
self.port.emit("userp-request");
self.port.emit("pinfo-request");

if(form){
	//checkForms();
}

self.port.on("pinfo-response", function(saveObj){
	if(saveObj){
		console.log("parsing pinfo response");
		personalInfo = JSON.parse(saveObj);
		//console.log(saveObj);
		if(loginInfo){ checkForms(); }
	}
	else{
		console.log("no personal info");
	}
});

function pInfoMatch(input){
	//console.log("checking match " + input.name);
	if(input.name.match("first") || input.id.match("first")){ firstInput = input; }
	else if(input.name.match("last") || input.id.match("last")){ lastInput = input; }
	else if(input.name.match("address") || input.id.match("address")){ addressInput = input; }
	else if(input.name.match("city") || input.id.match("city")){ cityInput = input; }
	else if(input.name.match("state") || input.id.match("state")){ stateInput = input; }
	else if(input.name.match("country") || input.id.match("country")){ countryInput = input; }
	else if(input.name.match("phone") || input.id.match("phone")){ phoneInput = input; }
	else if(input.name.match("email") || input.id.match("email")){ emailInput = input; }
	else { return false; }
	//console.log("matched " + input.name + " pinfo field");
	return true;
}

function checkForms(){
	//check for login forms
	for (var i = 0; i < form.length; i++) {
		if(form[i].id.match("login") || form[i].id.match("register") || form[i].name.match("login") || form[i].name.match("register")){
			//console.log("found form named " + form[i].name);
			//check that its not an iframe
			//console.log("form: " + form[i].ownerDocument.documentURI);
			//console.log("doc: " + truedoc);
			if(form[i].ownerDocument.documentURI !== truedoc){console.log("skipping iFrame"); continue;}
			//check that action matches if we have a saved action
			if(form[i].action !== decodeURIComponent(loginInfo['action'])){console.log("skipping non-matching action form " + form[i].name); continue;}
			
			//use this one if it is about inputs!
			var form_inputs = form[i].getElementsByTagName('input');
			loginForm = form[i];
			//add a listener to the form onSubmit function!
			form[i].onsubmit = formSubmitter;
			
			//loop through the inputs within the form
			for (var j = 0; j < form_inputs.length; j++){
				//if this is a password input
				if(form_inputs[j].name.match("pword") || form_inputs[j].id.match("pass") || form_inputs[j].type.toLowerCase() == "password"){
					//enter the dummy value!
					if(loginInfo){
					form_inputs[j].style.backgroundColor = "yellow";
					form_inputs[j].value = dummy;}
					passwordInput = form_inputs[j];
				}
				
				//if this is a username input
				if(form_inputs[j].name.match("usr") || form_inputs[j].name.match("user") || form_inputs[j].id.match("uname") || form_inputs[j].name.match("email")){
					//enter the dummy value!
					if(loginInfo){
					form_inputs[j].style.backgroundColor = "yellow";
					form_inputs[j].value = "dummy";}
					usernameInput = form_inputs[j];
				}
				if(pInfoMatch(form_inputs[j])){
					if(personalInfo){
						form_inputs[j].style.backgroundColor = "yellow";
						form_inputs[j].value = "dummy";
					}
				}
			}
			break;
		}
	}
}

//Fill element el with value val if currently filled with dummy
function fillTrue(el, val) {
	if(el){
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
			var r = confirm("Password field was modified! If you did this hit ok! If you didn't you might be under attack and should probably switch to a more secure wifi network!");
			if(!r){
			console.log("Not filling modified password field");
			return -1;
			}
			else{console.log("user has chosen to continue filling after password was modified");}
		}
	}
	el.value = val;
	}
}

function formSubmitter() {
	console.log("submitted " + loginForm.name +  " form");
	if(loginInfo == null && personalInfo == null){
		console.log("no info!");
		waitingForInfo = true;
		return false;
	}
	else if(loginInfo){
		if(loginInfo['action']){
			//check the form action against the forms new one
			if(loginInfo['action'] != encodeURIComponent(loginForm.action)){
				console.log("Actions don't match!");
				return -1;
			}
		}
		else{
			//save the form action
			loginInfo['action'] = encodeURIComponent(loginForm.action);
			//console.log("form: " + loginForm.action);
			self.port.emit("save-action-request", loginInfo);
		}
		
		//we have the info so log us in
		//console.log("submitted correctly!");
		fillTrue(usernameInput, loginInfo['username']);
		fillTrue(passwordInput, loginInfo['password']);
		
		//usernameInput.value = loginInfo['username'];
		//passwordInput.value = loginInfo['password'];
		loginForm.submit();
	}
	else if(personalInfo){
		fillTrue(firstInput, personalInfo['first']);
		fillTrue(lastInput, personalInfo['last']);
		fillTrue(addressInput, personalInfo['address']);
		fillTrue(cityInput, personalInfo['city']);
		fillTrue(stateInput, personalInfo['state']);
		fillTrue(countryInput, personalInfo['country']);
		fillTrue(phoneInput, personalInfo['phone']);
		fillTrue(emailInput, personalInfo['email']);
		loginForm.submit();
	}
}

self.port.on("submit-the-form!", formSubmitter);
