PasswordManagerAddon
====================
Demonstration Firefox add-on for password manager security improvements.

To run: download firefox add on sdk at https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip
Clone this repo into addon-sdk/bin folder
In the bin folder run ./activate then go to the password manager folder and use ./cfx run

Details:
Our password manager add on is organized into 3 main js files. main.js handles all initialization, file i/o and
message passing between the different js files. fill-init.js runs on the webpage and handles detecting and filling
the login forms securely. panel.js handles all the add on button interaction including personal information saving
and the fill and submit command signalling.
