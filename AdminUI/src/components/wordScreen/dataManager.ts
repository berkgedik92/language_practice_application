import {Language} from '../../services';
declare var $: any;

export abstract class LanguageDataManager {

    public languageIDToData: Map<String, Map<String, Object>> = new Map<String, Map<String, Object>>();
	
	public static languages: Language[] = [];
	public static languageIDs: string[] = [];

    public static addLanguage(language: Language) {
		if (this.languageIDs.indexOf(language.id) >= 0)
			return;
		this.languages.push(language);
		this.languageIDs.push(language.id);
	}
	
	constructor(json_data = {}) {
		for (let language of LanguageDataManager.languages)
			this.languageIDToData.set(language.id, this.extractData(language));

		let languageIDs = Object.keys(json_data);
		for (let language_id of languageIDs) {
			let languageData = json_data[language_id];
			let groupIDs = Object.keys(languageData);
        
			for (let group_id of groupIDs)
				this.languageIDToData.get(language_id).set(group_id, languageData[group_id]);
		}
	}

	public abstract extractData(language: Language);
	
    public getGroupLength(language_id: String): number {
        if (!this.languageIDToData.has(language_id))
			throw new Error("Language with id " + language_id + " does not exist!");
		
		return this.languageIDToData.get(language_id).size;
    }

    public getData(language_id: String) : Map<String, Object> {
		if (!this.languageIDToData.has(language_id))
			throw new Error("Language with id " + language_id + " does not exist!");
		
		return this.languageIDToData.get(language_id);	
    }
    
    public getAllData() {
		let obj = Object.create(null);
		let keys = Array.from(this.languageIDToData.keys())
		for (let k of keys) {
			let obj2 = Object.create(null);
			let keys2 = Array.from(this.languageIDToData.get(k).keys());
			for (let k2 of keys2) {
				obj2[k2.toString()] = this.languageIDToData.get(k).get(k2);
			}
			obj[k.toString()] = obj2;
		}
		
		return obj;
	}
}

/*
	For each language, keeps groups of pronouns. To be used to pick a pronoun
	for a <language,pronoun_group> pair. An example for the data it keeps:
	{
		"<English_id>": {"0": ["I"]. "1": ["You"], "2": ["He", "She", "It"], "3": ["We"]},
		"<Swedish_id>": {"0": ["Jag", "Du", "Han", ...]}
	}

	Here, "0" and "1" are ID of pronoun groups.
	The reason that [I, You] and [He, She, It] appear in different pronoun groups is,
	because the verb conjugation changes depending on the group of the pronoun used in
	a sentence.
*/
export class PronounsManager extends LanguageDataManager {

	/* 
		Map from languageID to pronoun list which consists of first pronouns of each
		pronoun group for the language. An example for data it keeps:
		{
			"<English_id>": ["0": "I", "1": "You", "2": "He", "3": "We", ...]
		}
    */
    
	constructor(json_data = {}) {super(json_data);}
	
	extractData(language: Language) {

		let currentMap = new Map<String, String>();

		for (let pronoun of language.pronouns) {
			let group = pronoun.group;
			let name = pronoun.name;
			if (currentMap.has(group))
				continue;
			currentMap.set(group, name);
		}

		return currentMap;
	}
}

export class NounsManager extends LanguageDataManager {

	/* 
		Map from languageID to nouns list. An example for data it keeps:
		{
            "<Swedish_id>": ["0": "bestämd-singular", "1": "bestämd-plural", 
                            "2": "obestämd-singular", "3": "obestämd-plural"]
		}
    */
    
	constructor(json_data = {}) {super(json_data);}
	
	extractData(language: Language) {

        let currentMap = new Map<String, String>();
        
        for (let i = 0; i < language.nouns.length; i++)
            currentMap.set(i + "", "");

		return currentMap;
	}
}

export class AdjectivesManager extends LanguageDataManager {

	/* 
		Map from languageID to adjectives list. An example for data it keeps:
		{
            "<Swedish_id>": ["0": "<current value for first adjective type (-en words)", 
                            "1": "-ett", "2": "bestämd"]
		}
    */
    
   constructor(json_data = {}) {super(json_data);}

	extractData(language: Language) {

        let currentMap = new Map<String, String>();
        
        for (let i = 0; i < language.adjectives.length; i++)
            currentMap.set(i + "", "");

		return currentMap;
	}
}

export class VerbsManager extends LanguageDataManager {

	/* 
		Map from languageID to adjectives list. An example for data it keeps:
		{
            "<English_id>": ["0": "present simple", "1": "present continuous", ...]
		}
    */
    
    constructor(json_data = {}) {
		super(json_data);
	}

	extractData(language: Language) {

		let pronounsManager = new PronounsManager();
        let currentMap = new Map<String, String[]>();
        let pronounGroupLength = pronounsManager.getGroupLength(language.id)

        for (let j = 0; j < language.verbs.length; j++)
			currentMap.set(j + "", Array.from({length: pronounGroupLength}, () => ""));

		return currentMap;
	}
}