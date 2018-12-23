import {Injectable} from "@angular/core"; 
import {Subject} from 'rxjs/Subject';

export class ListEditData {
	constructor (public isTitle: boolean,
				 public data: any) {}
}

export class ListOtherData {
	constructor() {}
}

export class ListSetData {
	constructor(public mainTitleText: string,
				public titles,
				public elements,
				public titleNameField : string,
				public titleElementField : string,
				public elementNameField: string,
				public titleType: string,
				public elementType: string,
				public uncategorizedIDs: string[],
				public showUncategorized: boolean,
				public isElementRemovalAllowed: boolean) {}
}

@Injectable() 
export class ListService {
	//For signaling a request to set up initially the left list
	menuSetter   : Subject<ListSetData> = new Subject<ListSetData>();

	//For signaling an edit event to the left list (to update it after the edit)
	menuEditer	 : Subject<ListEditData> = new Subject<ListEditData>();
	
	//For signaling an event where a user creates or deletes an element (to update left menu in a corresponding way)
	menuAdjuster : Subject<ListOtherData> = new Subject<ListOtherData>();
}