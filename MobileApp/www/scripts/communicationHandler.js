//LoginMethod enum, possible actions when there is no token
var LoginMethod = {
	"Redirect" : {},
	"Callback" : {}
};

var RequestMethod = {
	"GET" : {"name" : "GET"},
	"POST" : {"name" : "POST"}
};

var serverUrlComm;

//TODO: Fix this
function SetCommServerURL(url) {
	serverUrlComm = url;
}

function Communicator(data) {

	//Get construction parameters	

	/*
		Defines what should be done in case where there is no token in the storage 
		(i.e user has not logged in). User can be REDIRECTED to another page 
		(probably a login page) or a provided CALLBACK function can be called 
		(in order to prompt the user to enter credidentals or for any other reason)
		possible values : LoginMethod.Redirect, LoginMethod.Callback
	*/
	this.loginMethod 			= data["loginMethod"];

	/*
		This must be used if loginMethod attribute is set to LoginMethod.Callback,
		otherwise, it is not necessary.	It defines the callback function which will 
		be called if there is no token in the storage.
	*/
	this.noTokenCallback 		= data["noTokenCallback"];

	/*
		This defines the callback function to be called if authentication fails
		(i.e in case of a login attempt if the user enters wrong username, password 
		or if the token in the storage has been expired or invalid etc, or if 
		we cannot connect to server, etc). This function must take one parameter, 
		error information will be passed via this parameter
	*/
	this.authErrorCallback 		= data["authErrorCallback"];

	/*
		This defines the callback function to be called after we authenticate successfully
		the user (i.e after we determined that we have a valid token and we get user 
		information from the server). In this callback function, you probably should 
		make your AJAX requests which requires a token to load necessary data from 
		the server, and also get user data by calling getUserData function.
	*/
	this.authSuccessCallback 	= data["authSuccessCallback"];

	/*
		This defines the callback function to be called if it is detected that there
		is no internet connection.
	*/
	this.offlineCallback 		= data["offlineCallback"];

	/*
		StorageManager object to be used
	*/
	this.storage 				= data["storage"];

	//Public function declarations
	this.Login 					= Login;
	this.SignOut				= SignOut;
	this.getUserData 			= getUserData;
	this.makeRequest 			= makeRequest;

	/*Private attributes*/
	/*Those four attributes will be populated automatically by the server*/
	
	this.hostAddr 				= serverUrlComm;
	this.redirectURL 			= "login.html";
	let tokenGiver				= serverUrlComm + "login/token";
	let tokenValidator			= serverUrlComm + "token/validate";

	/*This will contain the information about the validated user*/
	this.userdata 				= null;
	this.token					= null;

	this.goToLogin = function() {
		window.location.href = instance.redirectURL;
	}
	
	let instance				= this;

	//Check construction parameters against errors
	if (!this.storage)
		throw "Communication Handler Constructor Error : No storage defined";

	if (!this.loginMethod)
		throw "Communication Handler Constructor Error : LoginMethod must be defined";

	if (this.loginMethod && this.loginMethod == LoginMethod.Callback && !this.noTokenCallback)
		throw "Communication Handler Constructor Error : When loginMethod is Callback, noTokenCallback function must be defined";

	if (this.loginMethod && this.loginMethod != LoginMethod.Redirect && this.loginMethod != LoginMethod.Callback)
		throw "Communication Handler Constructor Error : Unknown loginMethod is defined";

	if (!this.authErrorCallback)
		throw "Communication Handler Constructor Error : authErrorCallback function must be defined";

	if (!this.authSuccessCallback)
		throw "Communication Handler Constructor Error : authSuccessCallback function must be defined";

	//Now try to get the token from the local storage
	this.storage.get("auth", function(obj) {
		var data = JSON.parse(obj);
		instance.token = data.token;
		instance.userdata = data.userdata;
		Validate();
	}, function(error) {
		/*
			Now, if we still don't have a token, it means that we need to login 
			again in order to get a valid token from the server. 
			Take the necessary action according to the loginMethod value
		*/
		if (instance.loginMethod == LoginMethod.Redirect)
			instance.goToLogin();
		if (instance.loginMethod == LoginMethod.Callback)
			instance.noTokenCallback();
	});

	function Error401MessageParser(response) {
		if (response.responseText[0] == '{')
			return JSON.parse(response.responseText).message;
    	else
    		return response.responseText;
	}

    function Login(username, password) {
    	var loginData = {
    		"username" : username,
    		"password" : password
    	};

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (xmlhttp.status == 200) {
					instance.token = JSON.parse(xmlhttp.responseText).token;
		        	Validate();
				}
				else {
	        		AJAXErrorHandler(xmlhttp, tokenGiver);
				}
			}
		};

		xmlhttp.open("POST", tokenGiver, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		xmlhttp.send(JSON.stringify(loginData));
    }

    function SignOut() {
    	this.storage.remove("auth", this.goToLogin, this.goToLogin);
    }

	/*
		Returns an object which contains data (i.e name, email, etc) of the 
		authenticated user. Note that this data can be provided only after a successful 
		authentication occurs. So, if you call this function before the completion of 
		authentication process, it will return null 
	*/
    function getUserData() {
    	return this.userdata;
    } 

	/*
		Makes an AJAX request to the server. Data is a map that provides necessary 
		parameters for the AJAX request. Usable values are : 
						
		url: the URL address of the target (you should use partial URL address, 
			for example if the target is http://x.y.z.a:p/api/target, then you should 
			give "api/target" as URL, because domain address will be put to the beginning
			automatically)

		type: Request type. Possible values: RequestMethod.GET, RequestMethod.POST

		success: (Optional) A callback function to be called when AJAX will be done 
				successfully
		error: (Optional) A callback function to be called if there will be an error. 
				If not provided, the error will be handled by the defualt ErrorHandler 
				function
	*/
    function makeRequest(data) {
    	if (!data.url)
    		throw "Invalid AJAX Request : url is not defined";

    	if (!data.type || (data.type != RequestMethod.GET && data.type != RequestMethod.POST))
    		throw "Invalid AJAX Request : type is not defined";

    	if (!data.data && data.type == RequestMethod.POST)
    		throw "Invalid AJAX Request : data must be defined when doing POST request";

    	if (data.data && data.type == RequestMethod.GET) {
    		data.url += "?";
    		for (var key in data.data)
            	if (data.data.hasOwnProperty(key))
                	data.url += key + "=" + data.data[key] + "&";
    		data.url = data.url.substr(0, data.url.length - 1);
    	}

    	var url = instance.hostAddr + data.url;

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (xmlhttp.status == 200) {
					if (data.success)
	        			data.success(JSON.parse(xmlhttp.responseText));
				}
				else {
					if (data.error)
		        		data.error(xmlhttp);
		        	else
		        		AJAXErrorHandler(xmlhttp, url);
				}
			}
		};

		xmlhttp.open(data.type.name, url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		xmlhttp.setRequestHeader("Auth", instance.token);
		if (data.type == RequestMethod.POST)
			xmlhttp.send(data.data);
		else
			xmlhttp.send();
    }

    function Validate() {

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (xmlhttp.status == 200) {
					var response = JSON.parse(xmlhttp.responseText);
		        	var auth = {
		        		"token": instance.token,
		        		"userdata": response
		        	};

		        	instance.storage.set("online", "true", function() {
			        	instance.storage.set("auth", JSON.stringify(auth), function() {
				            instance.authSuccessCallback();
			        	});
		        	});
				}
				else {
					if (xmlhttp.status == 401) {
		        		var message = Error401MessageParser(xmlhttp);
		        		instance.storage.remove("auth", function() {instance.authErrorCallback(message);}, function() {instance.authErrorCallback(message);});
		        	}
		        	else
		        		AJAXErrorHandler(xmlhttp, tokenValidator);
				}
			}
		};

		xmlhttp.open("POST", tokenValidator, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		xmlhttp.setRequestHeader("Auth", instance.token);
		xmlhttp.send();
	}

    function AJAXErrorHandler(response, url) {
    	if (response.status == 0) {
	        instance.storage.set("online", "false", function() {
		        instance.offlineCallback();
		    });
    	}
	    else if (response.status == 400)
	    	alert("URL : " + url + " " + response.responseText);
	    else if (response.status == 401) 
	    	alert("URL : " + url + " " + Error401MessageParser(response));
    	else if (response.status == 404)
    		alert("URL : " + url + " Cannot find the requested page");
    }
}