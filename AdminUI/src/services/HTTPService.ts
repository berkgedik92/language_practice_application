import {Http, Headers} from '@angular/http'; 
import {Injectable} from "@angular/core"; 
import 'rxjs/add/operator/map';
import {Router} from '@angular/router';

export enum RequestMethod {GET, POST}

export interface HTTPRequestParams {
	url: string,
	type: RequestMethod,
	data?: any,
	isFile: boolean,
	callback: any,
	errorCallback?: any
}

export class HTTPRequest {

	validationRequest : boolean = false;

	url: string;
	type: RequestMethod;
	data: any;
	isFile: boolean;
	callback: any;
	errorCallback: any;

	constructor(params: HTTPRequestParams) {
		this.url = params.url;
		this.type = params.type;
		this.data = params.data;
		this.isFile = params.isFile;
		this.callback = params.callback;
		this.errorCallback = params.errorCallback;
	}
}

@Injectable() 
export class HTTPService {

	hostAddress : string;
	indexURL : string;
	tokenGiver : string;
	tokenValidator : string;

	token : string;
	userData : any = null;
	normalHeader : Headers;
	fileHeader : Headers;

	isValidated : boolean = false;

	constructor (private http: Http, private _router: Router) {

        this.hostAddress = "http://localhost:7000";
		this.tokenGiver =  "/login/token";
		this.tokenValidator = "/token/validate";

		this.normalHeader = new Headers();
		this.normalHeader.append("Content-Type", "application/json; charset=UTF-8"); 

		this.fileHeader = new Headers();
		let instance = this;
		
		/*
			Now try to get the token, if token attribute is defined, we don't need 
			to do anything, otherwise, we need to get the token from local storage
		*/
		if (!this.token) {
			console.log("Getting auth token...");
			this.token = localStorage.getItem('authToken');
		}

		if (this.token) {
			instance.normalHeader.append("Auth", this.token); 
			instance.fileHeader.append("Auth", this.token);
			this.Validate();
		}
	}

    SignOut() {
		localStorage.removeItem("authToken");
		this.isValidated = false;
		this._router.navigateByUrl('/login');
	}
	
	Login(username: string, password: string) {
		var loginData = {
    		"username" : username,
    		"password" : password
		};

		let instance = this;
		
		this.makeRequest(new HTTPRequest({
			"url": this.tokenGiver,
			"type": RequestMethod.POST,
			"data": loginData,
			"isFile": false,
			"callback": function(response) {
				localStorage.setItem('authToken', response.token);
				instance.normalHeader.append("Auth", response.token); 
				instance.fileHeader.append("Auth", response.token);
				instance.token = response.token; 
				instance.Validate();
			},
			"errorCallback": function(e) {
				console.log(e);
			}
		}));
	} 

    redirectToLogin() {
		this._router.navigateByUrl('/login');
    }

    fetch(data : HTTPRequest) {
    	console.log(data.url + " request is processing");
    	if (data.isFile)
    		this.makeRequestWithFile(data);
    	else
    		this.makeRequest(data);
    }

    makeRequest(data : HTTPRequest) {
    	if (!data.url)
    		throw "Invalid AJAX Request : url is not defined";

    	if (data.type == null || (data.type != RequestMethod.GET && data.type != RequestMethod.POST))
    		throw "Invalid AJAX Request : type is not defined";

    	if (!data.data && data.type == RequestMethod.POST)
    		throw "Invalid AJAX Request : data must be defined when making a POST request";

    	if (data.data && data.type == RequestMethod.GET) {
    		data.url += "?";
    		for (let key in data.data)
            	if (data.data.hasOwnProperty(key))
                	data.url += key + "=" + data.data[key] + "&";
    		data.url = data.url.substr(0, data.url.length - 1);
    	}

    	data.url = this.hostAddress + data.url;
		let instance = this;

    	if (data.type == RequestMethod.GET) {
    		this.http.get(data.url, {headers: this.normalHeader})
            .map(function(data) {
                try {
                    return data.json();
                }
                catch (err) {
                    return null;
                }
            })
    		.subscribe(
        		response => {
                    if (data.callback != null) data.callback(response)
                },
        		err => {
                    instance.AJAXErrorHandler(err); 
                    data.errorCallback(err);
                }
            );
    	}
    	else {
			this.http.post(data.url, data.data, {headers: this.normalHeader})
            .map(function(data) {
                try {
                    return data.json();
                }
                catch (err) {
                    return null;
                }
            })   		
            .subscribe(
        		response => {
                    if (data.callback != null) data.callback(response)
                },
        		err => {
                    instance.AJAXErrorHandler(err); 
                    data.errorCallback(err);
                }
            );
    	}
    }

    makeRequestWithFile(data : HTTPRequest) {
    	if (!data.url)
    		throw "Invalid AJAX Request : url is not defined";

    	if (!data.data)
    		throw "Invalid AJAX Request : data must be defined";

    	data.url = this.hostAddress + data.url;
		let instance = this;

    	this.http.post(data.url, data.data, {headers: this.fileHeader})
            .map(function(data) {
                try {
                    return data.json();
                }
                catch (err) {
                    return null;
                }
            })  		
            .subscribe(
        		response => {
                    if (data.callback != null) data.callback(response)
                },
        		err => {
                    instance.AJAXErrorHandler(err); 
                    data.errorCallback(err);
                }
            );
    }

    Validate() {
        let instance = this;
    	this.http.post(this.hostAddress + this.tokenValidator, {}, {headers: this.normalHeader})
    		.map(data => data.json())
    		.subscribe(
        		data => {
							instance.userData = data;
							instance.isValidated = true;
							instance._router.navigateByUrl('/langs');
        				},
        		err =>  {
							alert("Could not validate the token");
                    		console.log("Validation error : " + err);
                    		localStorage.removeItem("authToken");
							instance.redirectToLogin();
        				}
            );
	}

    //noinspection JSMethodCanBeStatic
    AJAXErrorHandler(error) {
    	if (error.status && error.statusText)
    		alert("Error: status code " + error.status + " " + error._body);
    	else
    		alert(error);
    }
}