// FILE: menuBar.js
// AUTHORS: Justin Erickson, Richie Burch, Matt Hardin, Nathan Robertson, Matthew Deberry, Tanner Russell
// PURPOSE: Controls behavior of the toolbar. Most functions in this file are triggered upon an event happening.

const PREAMBLE = "from mine import *\n\n" +
    "mc = Minecraft()\n" +
    "\n";

const NOTIFY_OPTIONS = {autoHideDelay: 10000};


// Let pressing enter inside fileName textbox trigger save file event
// https://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
$("#fileNameTextBox").keyup(function (event) {
   if (event.keyCode === 13) {
       $("#generateButton").click();
   }
});


/**
 * createSnapshot: Allows user to save current workspace.
 */
// https://groups.google.com/forum/#!topic/blockly/NDlC-l6DLEM
function createSnapshot() {
    let xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    let xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    localStorage.setItem("blockly.xml", xmlText);
    displaySuccessNotification(".menu","Snapshot created");
}

/**
 * restoreSnapshot: Restores a saved workspace in browser.
 */
function restoreSnapshot() {
    let xmlText = localStorage.getItem("blockly.xml");
    if (xmlText) {
        Blockly.mainWorkspace.clear();
        let xmlDom = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    }
    displaySuccessNotification(".menu", "Snapshot restored");
}


/**
 * loadBlocks: Reads an XML file and loads it into workspace.
 */
function loadBlocks() {
    let selectedFile = document.getElementById('file-input').files[0];
    let fileReader = new FileReader();
    if (selectedFile.type === "text/xml") {
        fileReader.readAsText(selectedFile);
        fileReader.onload = function() {
            let data = fileReader.result;
            Blockly.mainWorkspace.clear();
            let xmlDom = Blockly.Xml.textToDom(data);
            Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
        };
    }
    displaySuccessNotification(".menu","Load was successful.");
}


/**
 * saveBlocks: Download current workspace to user's pc as an XML file.
 */
function saveBlocks() {
    let xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    let xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    let xmlBlob = new Blob([xmlText], {type: "text/plain"});
    let textToSaveAsURL = window.URL.createObjectURL(xmlBlob);
    createDownloadLink(textToSaveAsURL).click();
}

function createDownloadLink(textToSaveAsURL) {
    let downloadLink = document.createElement("a");
    downloadLink.download = 'export.xml';
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    return downloadLink;
}

// Helper for export blocks.
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

/**
 * createScript: Sends request to server to record code in Pycraft directory
 */
function createScript() {
    if (workspaceHasWarnings()) {
        $('.menu').notify("Must resolve warnings before creating script.", "error", NOTIFY_OPTIONS);
    }
    else {
        sendCode();
    }
}

/**
 * sendCode: Sends generated Blockly code via AJAX to the server.
 */
function sendCode() {
    let codeForm = new FormData();
    let xhttp = new XMLHttpRequest();
    Blockly.Python.INFINITE_LOOP_TRAP = null;
    let code = PREAMBLE + Blockly.Python.workspaceToCode(mainWorkspace);
    codeForm.append("codeArea", code);
    codeForm.append("fileName", document.getElementById("fileNameTextBox").value);
    xhttp.open("POST", "/copy_text", true);
    addLoadEvent(xhttp);
    xhttp.send(codeForm);
}

/**
 * A predicate helper function for createScript.
 * Returns true if any blocks in workspace have a warning assigned to them or false otherwise.
 * Note: !! is necessary as it casts a variable into a boolean expression and then returns
 * true if variable is not undefined or false otherwise.
 */
function workspaceHasWarnings() {
    let blocks = mainWorkspace.getAllBlocks();
    return !!blocks.find((block) => !!block.warning);
}

/**
 * Displays notification to user based on result of AJAX query.
 * @param xhttp: Object representing the AJAX transaction.
 */
function addLoadEvent(xhttp) {
    xhttp.addEventListener('load', function () {
        let response = JSON.parse(xhttp.responseText);
        if (response['errors'] === undefined) {
            displaySuccessNotification(".menu", "File: " + response.file_name + " saved");
        } else {
            $(".menu").notify(response.errors[0].msg, "error", NOTIFY_OPTIONS);
        }
    });
}

// Source: https://notifyjs.jpillora.com/
function displaySuccessNotification(element, notificationText) {
    $(element).notify(notificationText, "success", NOTIFY_OPTIONS);
}

function signUp(){
	let codeForm = new FormData();
	var username = signup.uname.value;
	var email = signup.email.value;
	var firstname = signup.fname.value;
	var lastname = signup.lname.value;
	var age = signup.age.value;
	var exp = signup.exp.value;
	codeForm.append("username", username);
	codeForm.append("email", email);
	codeForm.append("firstname", firstname);
	codeForm.append("lastname", lastname);
	codeForm.append("age", age);
	codeForm.append("exp", exp);
    let xhttp = new XMLHttpRequest();
	addLoadEvent(xhttp);
    xhttp.open("POST", "/submit-form", true);
	xhttp.send(codeForm);
}

// Get the modal
var signUpModal = document.getElementById('signUpModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == signUpModal) {
    signUpModal.style.display = "none";
  }
}