import {Injectable} from "@angular/core"; 
import {HTTPRequest, RequestMethod, HTTPService} from "./HTTPService";

export interface CategoryData {
	id : string,
	name : string,
	pictureURL : string,
	wordIDs : string[],
}

export class Category {

	id : string;
	name : string;
	pictureURL : string;
	wordIDs : string[];

	constructor(params: CategoryData) {
		this.id = params.id;
		this.name = params.name;
		this.pictureURL = params.pictureURL;
		this.wordIDs = params.wordIDs;
	}
				
	removeWordIDIfExists(wordID: string) {
		if (!this.wordIDs.includes(wordID))
			return;
		this.wordIDs.splice(this.wordIDs.indexOf(wordID), 1);
	}

	addWordIDIfNotExists(wordID: string) {
		if (this.wordIDs.includes(wordID))
			return;
		this.wordIDs.push(wordID);
	}
}

@Injectable() 
export class CategoryService {

	isReady : boolean = true;

	constructor (private httpService: HTTPService) {}

	load(callback) {
		this.httpService.fetch(new HTTPRequest({
			"url": "/api/category/load", 
			"type": RequestMethod.GET,
			"isFile": false, 
			"callback": function(response) {
			if (callback != null)
				callback(response);
			}
		}));
	}

	deleteCategory(id : string, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/category/delete",
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

	save(data, callback) {
		if (!this.isReady)
			return;

		this.isReady = false;
		let instance = this;

		this.httpService.fetch(new HTTPRequest({
			"url": "/api/category/save", 
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
}