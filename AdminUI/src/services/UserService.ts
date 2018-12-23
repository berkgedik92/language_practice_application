import {Injectable} from "@angular/core"; 
import {HTTPRequest, RequestMethod, HTTPService} from "./HTTPService";

/*
	Keeps assigned words for a user for a particular language
*/
export class LanguageStatus {	

	languageID: string = "";

	/*
		wordID -> Dummy object (this object will keep statistics about the 
								user performance on this word but this is not
								implemented yet)
	*/
	assignedWords: Map<String, Object> = new Map<String, Object>();

	constructor(json_data = {}) {
		if (json_data["languageID"])
			this.languageID = json_data["languageID"];
		
		if (json_data["assignedWords"]) {
			let wordIDs = Object.keys(json_data["assignedWords"]);
			for (let wordID of wordIDs)
				this.assignedWords.set(wordID, json_data["assignedWords"][wordID]);
		}
	}
}

export interface UserData {
	id : string,
	username : string,
	password : string,
	realName : string,
	pictureURL : string,

	//IDs of all languages that the user has a relation with
	languageIDs : string[],

	/*
		ID of the language that the user currently practices
		(although this is a list, it can have only one element,
		this is kept as a list due to limitations of selector UI 
		component)
	*/
	currentLanguageIDs : string[],

	/*
		ID of the language which the user has as his native language
		(although this is a list, it can have only one element,
		this is kept as a list due to limitations of selector UI 
		component)
	*/
	mainLanguageIDs : string[]
}

export class User {

	id : string;
	username : string;
	password : string;
	realName : string;
	pictureURL : string;
	languageIDs : string[];
	currentLanguageIDs : string[];
	mainLanguageIDs : string[];
	languages: Map<String, LanguageStatus> = new Map<String, LanguageStatus>();

	constructor(params: UserData) {
		this.id = params.id;
		this.username = params.username;
		this.password = params.password;
		this.realName = params.realName;
		this.pictureURL = params.pictureURL;
		this.languageIDs = params.languageIDs;
		this.currentLanguageIDs = params.currentLanguageIDs;
		this.mainLanguageIDs = params.mainLanguageIDs;
	}
}

@Injectable() 
export class UserService {

	isReady : boolean = true;

	constructor (private httpService: HTTPService) {}

	loadUsers(callback) {
		this.httpService.fetch(new HTTPRequest({
			"url": "/api/user/load", 
			"type": RequestMethod.GET, 
			"isFile": false, 
			"callback": function(response) {
				if (callback != null)
					callback(response);
			}
		}));
	}

	deleteUser(id : string, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/user/delete", 
			"type": RequestMethod.POST,
			"data": id, 
			"isFile": false, 
			"callback": function(response) {
				instance.isReady = true;
				if (callback != null)
					callback(response);
			},
			"errorCallback": function() {
				instance.isReady = true;
			}
		}));
	}

	saveUser(data, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/user/save", 
			"type": RequestMethod.POST, 
			"data": data, 
			"isFile": true, 
			"callback": function(response) {
				instance.isReady = true;
				if (callback != null)
					callback(response);
			}, 
			"errorCallback": function() {
				instance.isReady = true;
			}
		}));
	}

	saveUserLanguage(data, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/user/saveuserlanguage", 
			"type": RequestMethod.POST, 
			"data": data, 
			"isFile": false, 
			"callback": function(response) {
				instance.isReady = true;
				if (callback != null)
					callback(response);
			}, 
			"errorCallback": function() {
				instance.isReady = true;
			}
		}));
	}
}