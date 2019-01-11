let token = localStorage.getItem("token");
let englishID = localStorage.getItem("englishID");
let swedishID = localStorage.getItem("swedishID");

if (!token) {
	document.getElementById("signin").style["display"] = "block";
	document.getElementById("signout").style["display"] = "none";
}
else {
	RunScriptOnContent();
}

document.getElementById("login").addEventListener("click", function() {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:7000/login/token", true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	xhr.onreadystatechange = function () {
	    if (this.readyState != 4)
	    	return;

	    if (this.status == 200) {
	        token = JSON.parse(this.responseText)["token"];
	        GetLanguageIDs();
	    }
	    else {
	    	alert("Could not log in");
	    }
	};

	xhr.send(JSON.stringify({
		"username": $("#username").val(),
		"password": $("#password").val()		
	}));
});

function GetLanguageIDs() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:7000/api/language/load", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Auth', token);

	xhr.onreadystatechange = function () {
	    if (this.readyState != 4)
	    	return;

	    if (this.status == 200) {
	        languages = JSON.parse(this.responseText);
	        for (let language of languages) {
	        	if (language["name"].indexOf("English") >= 0) {
	        		englishID = language["id"];
	        	}
	        	if (language["name"].indexOf("Swedish") >= 0) {
	        		swedishID = language["id"];
	        	}
	        }
	        RunScriptOnContent();
	    }
	    else {
	    	alert("Could not log in");
	    }
	};

	xhr.send();
	
}

function RunScriptOnContent() {
	$("#signout").css("display", "block");
	$("#signin").css("display", "none");
	localStorage.setItem("token", token);
	localStorage.setItem("englishID", englishID);
	localStorage.setItem("swedishID", swedishID);

	var config = {
		"token": token,
		"englishID": englishID,
		"swedishID": swedishID
	};
	
	chrome.windows.getCurrent(function(currentWindow) {
		chrome.tabs.query({active: true, windowId: currentWindow.id},
			function(activeTabs) {
				chrome.tabs.executeScript(activeTabs[0].id, {
				    code: 'var config = ' + JSON.stringify(config)
				}, function() {
				    chrome.tabs.executeScript(activeTabs[0].id, {file: 'script.js'});
				});
			});
	});
}

document.getElementById("logout").addEventListener("click", function() {
	localStorage.removeItem("token");
	$("#signin").css("display", "block");
	$("#signout").css("display", "none");
});