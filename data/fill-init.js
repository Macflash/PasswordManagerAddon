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
	//console.log("made request");
	self.port.emit("userp-request");
}

self.port.on("save-data", function(saveObj){
	//console.log("got response");
	//store the save object info
	loginInfo = saveObj;
	
	//check for login forms
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
					if(loginInfo){
					form_inputs[j].style.backgroundColor = "yellow";
					form_inputs[j].value = dummy;}
					passwordInput = form_inputs[j];
				}
				
				//if this is a username input
				if(form_inputs[j].name.match("user") || form_inputs[j].id.match("uname") || form_inputs[j].name.match("email")){
					//enter the dummy value!
					if(loginInfo){
					form_inputs[j].style.backgroundColor = "yellow";
					form_inputs[j].value = "dummy";}
					usernameInput = form_inputs[j];
				}
			}
			break;
		}
	}
	
	//if we were waiting call the submission function
	if(waitingForInfo){
		formSubmitter();
	}
});

//Fill element el with value val if currently filled with dummy
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
			return;
		}
	}
	el.value = val;
}

function formSubmitter() {
	console.log("submitted form");
	if(loginInfo == null){
		console.log("no login info!");
		waitingForInfo = true;
		return false;
	}
	else{
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
			console.log("form: " + loginForm.action);
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
}