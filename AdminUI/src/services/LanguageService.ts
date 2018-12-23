import {Injectable} from "@angular/core"; 
import {HTTPRequest, RequestMethod, HTTPService} from "./HTTPService";

export class PronounType {
    name : string;
    group : string;
}

export class VerbType {
    name : string;
}

export class NounType {
    name : string;
}

export class AdjectiveType {
    name : string;
}

export interface LanguageData {
	id : string,
	name : string,
	pictureURL : string,
	alphabet : string,
	pronouns : PronounType[],
	verbs : VerbType[],
	nouns : NounType[],
	adjectives : AdjectiveType[],
}

export class Language {

	id : string;
	name : string;
	pictureURL : string;
	alphabet : string;
	pronouns : PronounType[];
	verbs : VerbType[];
	nouns : NounType[];
	adjectives : AdjectiveType[];

	constructor(params: LanguageData) {
		this.id = params.id;
		this.name = params.name;
		this.pictureURL = params.pictureURL;
		this.alphabet = params.alphabet;
		this.pronouns = params.pronouns;
		this.verbs = params.verbs;
		this.nouns = params.nouns;
		this.adjectives = params.adjectives;
	}
}

@Injectable() 
export class LanguageService {

	isReady : boolean = true;

	constructor (private httpService: HTTPService) {}

	loadLanguages(callback) {
		this.httpService.fetch(new HTTPRequest({
			"url": "/api/language/load", 
			"type": RequestMethod.GET, 
			"isFile": false, 
			"callback": function(response) {
			if (callback != null)
				callback(response);
			}
		}));
	}

	deleteLanguage(id : string, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;
		
		this.httpService.fetch(new HTTPRequest({
			"url": "/api/language/delete", 
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

	saveLanguage(data, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/language/save", 
			"type": RequestMethod.POST, 
			"data": data, 
			"isFile": true, 
			"callback": function(response) {
				instance.isReady = true;
				if (callback != null)
					callback(response);
			}, 
			"errorCallback": function(err) {
				instance.isReady = true;
			}
		}));
	}
}