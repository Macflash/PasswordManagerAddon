const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var { ToggleButton } = require('sdk/ui/button/toggle');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var dummy = (Math.random() + 1).toString(36).substring(1,8);
var panel = require("sdk/panel").Panel({
  contentURL: data.url("update-panel.html"),
  contentScriptFile: data.url("update-panel.js"),
  onHide: function() { button.state('window', {checked: false}); }
});

const pinfoLocation = "pinfo.txt";
const userpLocation = "userp.txt";

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

var button = ToggleButton({
  id: "password-manager",
  label: "Safer Password Manager",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png" },
	onChange: function(state) {
		if (state.checked) {
    		  panel.show({
      		    position: button
   		  });
  		}
	}
});

// Panel Request Listeners
panel.port.on("fill-request",
function() {
  // Run the secure filling script on current tab
  // And close the pop-up
  panel.hide();
  tabs.activeTab.attach({
    contentScriptFile: data.url("secure-filling.js")
  });
});

panel.port.on("pinfo-request",
function(){
  // Read in our saved-info object
  let decoder = new TextDecoder();
  let promise = OS.File.read(pinfoLocation);
  promise = promise.then(
  function onSuccess(array) {
    // Decode and Parse the object
    var oldSave = decoder.decode(array);
    // Then send it back to the panel
    panel.port.emit("pinfo-response", oldSave);
  }, 
  function onFailure(){
	  // File doesn't exist
	  // Send empty response back
	  panel.port.emit("pinfo-response");
  }
  );
});

panel.port.on("userp-request",
function(){
	let decoder = new TextDecoder();
	let promise = OS.File.read(userpLocation);
	promise = promise.then(
	function onSuccess(array) {
		// Decode and Parse the object
		var oldSave = JSON.parse(decoder.decode(array));
		console.log("save: " + oldSave);
		var keys = Object.keys(oldSave);
		console.log("keys: " + keys);
		var tabUserp = {};
		if(oldSave){
			// use our current domain to look up the userp info we need
			var lookup_url = encodeURIComponent(tabs.activeTab.url);
			console.log("url: " + lookup_url);
			tabUserp = oldSave[lookup_url];
		}
		console.log("entry: " + tabUserp);
		// Then send it back to the panel
		panel.port.emit("userp-response", tabUserp);
	}, 
	function onFailure() {
		// File doesn't exist
		// Send empty response back
		panel.port.emit("userp-response");
	});
});

panel.port.on("save-pinfo-request",
function(saveObj){
	saveToFile(pinfoLocation, saveObj);
	panel.port.emit("save-pinfo-response");
});

panel.port.on("save-userp-request",
function(saveObj){
	// Read in the current save
	let decoder = new TextDecoder();
	let promise = OS.File.read(userpLocation);
	promise = promise.then(
	function onSuccess(array) {
		var oldSave = JSON.parse(decoder.decode(array));
		var url = encodeURIComponent(tabs.activeTab.url);
		// Add/modify the current entry
		// NOTE: this should probably track where the url was
		// ORIGINALLY instead of re-looking this up, in case
		// they switched pages before saving!
		oldSave[url] = saveObj;
		saveToFile(userpLocation, oldSave);
		panel.port.emit("save-userp-response");
	},
	function onFailure(){
		// No save exists, so create a new one
		var saveContainer = new Object();
		saveContainer[encodeURIComponent(tabs.activeTab.url)] = saveObj;
		saveToFile(userpLocation, saveContainer);
		panel.port.emit("save-userp-response");
	});
});

pageMod.PageMod({
	include: ["*"],
	contentScriptWhen: "end",
	contentScriptFile: data.url("fill-init.js"),
	contentScriptOptions: {
		dummyval: dummy
	},
	onAttach: function(worker) {
		let decoder = new TextDecoder();
		let promise = OS.File.read(userpLocation);
		promise = promise.then(
		function onSuccess(array) {
			// Decode and Parse the object
			var oldSave = JSON.parse(decoder.decode(array));
			console.log("save: " + oldSave);
			var keys = Object.keys(oldSave);
			console.log("keys: " + keys);
			var tabUserp = {};
			if(oldSave){
				// use our current domain to look up the userp info we need
				var lookup_url = encodeURIComponent(tabs.activeTab.url);
				console.log("url: " + lookup_url);
				tabUserp = oldSave[lookup_url];
			}
			console.log("entry: " + tabUserp);
			worker.port.emit("save-data", tabUserp);
		}, 
		function onFailure() {
			// File doesn't exist
			// Send empty response back
			worker.port.emit("save-data");
		});
	    worker.port.on("log-console-main", function(elementContent) {
	      console.log(elementContent);
	    });
	}
});

// Write object to file
function saveToFile(file, object) {
	let encoder = new TextEncoder();              
	let text = JSON.stringify(object);
	let array = encoder.encode(text);
	let promise = OS.File.writeAtomic(file, array, {tmpPath: "file.txt.tmp"});    
	return promise;
}

// Read object from file
//NOTE: this format is basically useless....
function readFromFile(file) {
	let decoder = new TextDecoder();
	let promise = OS.File.read(file);
	promise = promise.then(
	function onSuccess(array) {
	return decoder.decode(array);
	});
	return promise;
}
