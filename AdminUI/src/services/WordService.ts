import {Injectable} from "@angular/core"; 
import {HTTPRequest, RequestMethod, HTTPService} from "./HTTPService";
import {LanguageDataManager} from "../components/wordScreen/dataManager";

export interface WordData {
	id : string,
	name : string,
	pictureURL : string,

	/*
		When Word object comes from server, "meanings" is a map 
		(languageID -> meaning of the word in this language). In UI, we transform it to
		an array of JSON Object ([{"languageName": ..., "meaning": ...}, ... ])
	*/
	meanings,
	//NOUN, VERB or ADJECTIVE
	type : string,
	level : number,
	
	//IDs of word categories that this word belongs to
	categories : string[],
	/*
		Keeps different forms of this word for all languages (check LanguageDataManager
		class for more information)
	*/
	data : LanguageDataManager
}

export class Word {

	id : string;
	name : string;
	pictureURL : string;
	meanings;
	type : string;
	level : number;
	categories : string[];
	data :  LanguageDataManager;

	constructor(params: WordData) {
		this.id = params.id;
		this.name = params.name;
		this.pictureURL = params.pictureURL;
		this.meanings = params.meanings;
		this.type = params.type;
		this.level = params.level;
		this.categories = params.categories;
		this.data = params.data;
	}

	removeCategory(categoryID) {
		this.categories.splice(this.categories.indexOf(categoryID), 1);
	}

	getCategoryListLength() {
		return this.categories.length;
	}
}

@Injectable() 
export class WordService {

	isReady : boolean = true;

	constructor (private httpService: HTTPService) {}

	loadWords(callback) {
		this.httpService.fetch(new HTTPRequest({
			"url": "/api/words/load", 
			"type": RequestMethod.GET,
			"isFile": false, 
			"callback": function(response) {
				if (callback != null) {
					callback(response);
				}
			}
		}));
	}

	deleteWord(id: string, callback = null) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/words/delete",
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

	saveWord(data, callback = null) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/words/save", 
			"type": RequestMethod.POST, 
			"data": data, 
			"isFile": true,
			"callback" : function(response) {
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