const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var { ToggleButton } = require('sdk/ui/button/toggle');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var dummy = (Math.random() + 1).toString(36).substring(1,8);
var pw = 300;
var ph = 190;
var upw = pw;
var uph = 310;
var ppw = pw;
var pph = 490;

// Initialize our ui panel object
var panel = require("sdk/panel").Panel({
  width: pw,
  height: ph,
  contentURL: data.url("update-panel.html"),
  contentScriptFile: data.url("update-panel.js"),
  onHide: function() { button.state('window', {checked: false}); }
});

const pinfoLocation = "pinfo.txt";
const userpLocation = "userp.txt";

// Create password object
function passwordObject(user, pword, action, pn, pi){
	this.username = user;
	this.password = pword;
	this.action = action;
	this.pname = pn;
	this.pid = pi;
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

// Create the browser add on button
var button = ToggleButton({
  id: "password-manager",
  label: "SHH! Safer Password Manager",
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
panel.port.on("cancel-request", function(){panel.resize(pw,ph); panel.port.emit("cancel-response");});

panel.port.on("fill-request",
function() {
  // Run the secure filling script on current tab
  // And close the pop-up
  panel.hide();
  pageworker.port.emit("submit-the-form!");
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
    panel.resize(ppw,pph);
    panel.port.emit("pinfo-response", oldSave);
  }, 
  function onFailure(){
	  // File doesn't exist
	  // Send empty response back
	  panel.resize(ppw,pph);
	  panel.port.emit("pinfo-response");
  }
  );
});

// retrieve username password info for active tab
panel.port.on("userp-request",
function(){
	let decoder = new TextDecoder();
	let promise = OS.File.read(userpLocation);
	promise = promise.then(
	function onSuccess(array) {
		// Decode and Parse the object
		var oldSave = JSON.parse(decoder.decode(array));
		var keys = Object.keys(oldSave);
		var tabUserp = {};
		if(oldSave){
			// use our current domain to look up the userp info we need
			var lookup_url = encodeURIComponent(tabs.activeTab.url);
			tabUserp = oldSave[lookup_url];
		}
		// Then send it back to the panel
		panel.resize(upw,uph);
		panel.port.emit("userp-response", tabUserp);
	}, 
	function onFailure() {
		// File doesn't exist
		// Send empty response back
		panel.resize(upw,uph);
		panel.port.emit("userp-response");
	});
});

panel.port.on("save-pinfo-request",
function(saveObj){
	saveToFile(pinfoLocation, saveObj);
	panel.resize(pw,ph);
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
		oldSave[url] = saveObj;
		saveToFile(userpLocation, oldSave);
		panel.resize(pw,ph);
		panel.port.emit("save-userp-response");
	},
	function onFailure(){
		// No save exists, so create a new one
		var saveContainer = new Object();
		saveContainer[encodeURIComponent(tabs.activeTab.url)] = saveObj;
		saveToFile(userpLocation, saveContainer);
		panel.resize(pw,ph);
		panel.port.emit("save-userp-response");
	});
});

// Create pagemod object and attach to all tabs after all js runs
var pageworker;
pageMod.PageMod({
	include: ["*"],
	contentScriptWhen: "end",
	contentScriptFile: data.url("fill-init.js"),
	contentScriptOptions: {
		dummyval: dummy
	},
	onAttach: function(worker) {
		pageworker = worker;
		let decoder = new TextDecoder();
		let promise = OS.File.read(userpLocation);
		promise = promise.then(
		function onSuccess(array) {
			// Decode and Parse the object
			var oldSave = JSON.parse(decoder.decode(array));
			var keys = Object.keys(oldSave);
			var tabUserp = {};
			if(oldSave){
				// use our current domain to look up the userp info we need
				var lookup_url = encodeURIComponent(tabs.activeTab.url);
				tabUserp = oldSave[lookup_url];
			}
			//console.log("entry: " + tabUserp);
			worker.port.emit("saved-userp", tabUserp);
		}, 
		function onFailure() {
			// File doesn't exist
			// Send empty response back
			worker.port.emit("save-data");
		});
		//send the active tab to our worker
		worker.port.emit("tab-url",tabs.activeTab.url);
	    worker.port.on("log-console-main", function(elementContent) {
	      console.log("extra: " + elementContent);
	    });
	    worker.port.on("save-action-request", function(savedInfo) {
	    	  addToFile(userpLocation, savedInfo);
		});
	    worker.port.on("pinfo-request",
    		function(){
    		  // Read in our saved-info object
    		  let decoder = new TextDecoder();
    		  let promise = OS.File.read(pinfoLocation);
    		  promise = promise.then(
	    		  function onSuccess(array) {
	    		    // Decode and Parse the object
	    		    var oldSave = decoder.decode(array);
	    		    // Then send it back to the panel
	    		    worker.port.emit("pinfo-response", oldSave);
	    		  }, 
	    		  function onFailure(){
	    			  // File doesn't exist
	    			  // Send empty response back
	    			  worker.port.emit("pinfo-response");
	    		  }
    		  );
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
// NOTE: this format is basically useless due to the promise event system.... 
// but it is a good reference in case you forget
function readFromFile(file) {
	let decoder = new TextDecoder();
	let promise = OS.File.read(file);
	promise = promise.then(
	function onSuccess(array) {
		//this is where you need to do things
	return decoder.decode(array);
	});
	return promise;
}

function addToFile(file, object) {
	//read the file
	let decoder = new TextDecoder();
	let promise = OS.File.read(file);
	promise = promise.then(
	function onSuccess(array) {
		var saveobj = JSON.parse(decoder.decode(array));
		//add the object
		var url = encodeURIComponent(tabs.activeTab.url);
		//console.log("url: " + url);
		saveobj[url] = object;
		//save the file
		let encoder = new TextEncoder();
		let text = JSON.stringify(saveobj);
		let newarray = encoder.encode(text);
		let promise = OS.File.writeAtomic(file, newarray, {tmpPath: "file.txt.tmp"});
		return promise;
	});
	return promise;
}
