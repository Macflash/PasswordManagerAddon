var inputs = document.getElementsByTagName('input');
var form = document.getElementsByTagName('form');
var dummy = self.options.dummyval;

var usernameInput;
var passwordInput;

var loginInfo;
var loginForm;
var waitingForInfo = false;

if(form){
	//if there is at least one form call for login info
	console.log("made request");
	self.port.emit("userp-request");
}

self.port.on("save-data", function(saveObj){
	console.log("got response");
	//store the save object info
	loginInfo = saveObj;
	//if we were waiting call the submission function
	if(waitingForInfo){
		formSubmitter();
	}
});


function formSubmitter() {
	console.log("submitted form");
	if(loginInfo == null){
		console.log("no login info!");
		waitingForInfo = true;
		return false;
	}
	else{
		//we have the info so log us in
		console.log("submitted correctly!");
		usernameInput.value = loginInfo['username'];
		passwordInput.value = loginInfo['password'];
		loginForm.submit();
	}	
}

for (var i = 0; i < form.length; i++) {
	if(form[i].id.match("login")){
		//use this one if it is about inputs!
		var form_inputs = form[i].getElementsByTagName('input');
		loginForm = form[i];
		//add a listener to the form onSubmit function!
		form[i].onsubmit = formSubmitter;
		
		//loop through the inputs within the form
		for (var j = 0; j < form_inputs.length; j++){
			//if this is a password input
			if(form_inputs[j].name.match("pword") || form_inputs[j].id.match("pass") || form_inputs[j].type == "password"){
				//enter the dummy value!
				form_inputs[j].style.backgroundColor = "yellow";
				form_inputs[j].value = "dummy";
				passwordInput = form_inputs[j];
			}
			
			//if this is a username input
			if(form_inputs[j].name.match("user") || form_inputs[j].id.match("uname") || form_inputs[j].name.match("email")){
				//enter the dummy value!
				form_inputs[j].style.backgroundColor = "yellow";
				form_inputs[j].value = "dummy";
				usernameInput = form_inputs[j];
			}
		}
		break;
	}
}

/*
for (var i = 0; i < inputs.length; i++) {
	if (inputs[i].type.toLowerCase() == 'password') {
		var new_element = inputs[i].cloneNode(true);
		inputs[i].parentNode.replaceChild(new_element, inputs[i]);
		inputs[i].removeAttribute("onchange");
		inputs[i].removeAttribute("onunload");
		inputs[i].removeAttribute("onclick");
		inputs[i].removeAttribute("onmouseover");
		inputs[i].value = dummy;
		inputs[i].style.backgroundColor = "yellow";
	}
}
*/