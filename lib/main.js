const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var dummy = (Math.random() + 1).toString(36).substring(1,8);

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Save/Read Files",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png" },
	onClick: function() {
		tabs.activeTab.attach({
			contentScriptFile: data.url("secure-filling.js")
		});
	}
});

pageMod.PageMod({
	include: ["*"],
	contentScriptWhen: "end",
	contentScriptFile: data.url("fill-init.js"),
	contentScriptOptions: {
		dummyval: dummy
	}
});