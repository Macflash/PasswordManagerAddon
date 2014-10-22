const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png" },
  onClick: handleClick });

function basicObject(user, pword){
this.username = user;
this.password = pword;
}

function handleClick(state) {
  console.log("button clicked");
  let obj = new basicObject("Steve", "1234");
  saveToFile(obj);
  console.log("object saved");
  let text = readFromFile();
  console.log("object read");
}

function saveToFile(object) {
  let encoder = new TextEncoder();              
  let text = JSON.stringify(object);
  let array = encoder.encode(text);
  let promise = OS.File.writeAtomic("file.txt", array, {tmpPath: "file.txt.tmp"});    
  return promise;
}

function readFromFile() {
  let decoder = new TextDecoder();
  let promise = OS.File.read("file.txt");
  promise = promise.then(
  function onSuccess(array) {
    return decoder.decode(array);
  });
  return promise;
}