var inputs = document.getElementsByTagName('input');
var dummy = self.options.dummyval;
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