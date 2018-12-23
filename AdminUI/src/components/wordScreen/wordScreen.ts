import {Component, ViewChild, Injectable} from '@angular/core';
import {PictureSelectorComponent} from '../../components/pictureSelector';
import {SelectorComponent} from '../../components/selector';
import {PortletComponent, PortletField, PortletFieldType, PortletFieldBuilder} from '../../components/portlet';
import {ListService, ListEditData, ListOtherData, ListSetData, WordService, Word, WordData, CategoryService, Category, CategoryData, LanguageService, Language} from '../../services';
import {NounScreenComponent} from '../../components/nounScreen';
import {VerbScreenComponent} from '../../components/verbScreen';
import {ScreenInterface} from '../ScreenInterface';
import {PronounsManager, NounsManager, VerbsManager, AdjectivesManager} from ".";
import {LanguageDataManager} from './dataManager';
declare var $: any;

function mapLanguageToMeaning(language, index) {
    return {"languageName": language.name, "meaning": ""};
}

@Component({
	selector: 'wordscreen',
	templateUrl: './wordScreen.html',
	styleUrls: ['./wordScreen.css', './modal.css', '../../assets/common.css']
})
export class WordScreenComponent implements ScreenInterface{
	
	@ViewChild("modal") modalView;
	@ViewChild("icon") iconComponent;

	/*
		The initial state for a new word (when we create a new word, we will clone
		this into "currentWord")
	*/
	templateWord: Word = new Word({
		id : null,
		name : "New Word",
		pictureURL : "",
		meanings: [],
		type : "NOUN",
		level : 1,
		categories : [],
		data: new NounsManager()
	});

	//Current word
	currentWord: Word = new Word({
		id : null,
		name : "New Word",
		pictureURL : "",
		meanings: [],
		type : "NOUN",
		level : 1,
		categories : [],
		data: new NounsManager()
	});

	//True if we are editing an existing word, False if it is a new word
	editing: boolean = false;

	//Map from wordID to Word object
	words : Map<String, Word> = new Map<String, Word>();

	categories: Category[] = [];

	languageNameToID: Map<String, String> = new Map<String, String>();
	languageIDToName: Map<String, String> = new Map<String, String>();
	languageIDToLanguage: Map<String, Language> = new Map<String, Language>();

	//List of all Language objects
	languageList: Language[] = [];

	icon: File = null;
	categoryIcon: File = null;

	//Defines what to show on "Meanings" frame of the word screen
	meaningFields: PortletField[] = [
										new PortletField({
											field: "languageName", 
											title: "Language", 
											type: PortletFieldType.STRING, 
											maxlength: 10,
											width: "40%", 
											disabled: true
										}),
										new PortletField({
											field: "meaning", 
											title: "Meaning", 
											type: PortletFieldType.STRING, 
											maxlength: 16,
											width: "60%", 
											disabled: false
										})
									];
	
	uncategorizedWordIDs: string[] = [];
	selectedLanguageID: string[];

	pronounsManager: PronounsManager;

	currentNoun: NounsManager;
	currentAdjective: AdjectivesManager;
	currentVerb: VerbsManager;

	categoryName: string = "New Category";

	diff(source, a) {
	    return source.filter(function(i) {return a.indexOf(i) < 0;});
	};

	getLanguageByID(language_id) {
		if (!this.languageIDToLanguage.has(language_id))
			return null;
		return this.languageIDToLanguage.get(language_id);
	}

	constructor(private languageService : LanguageService,
				private listListener: ListService,
				private categoryService : CategoryService,
				private wordService : WordService) {

		let instance = this;
		let list = listListener;

		//Fetch languages from the server
		languageService.loadLanguages(function(response: Language[]) {

			//In "response", we have all Language objects in the repository
			instance.languageList = response;

			/*
				Create the mappings for Language objects (Name to ID and vice versa)
			*/
			for (let currentLanguage of response) {
				instance.languageNameToID.set(currentLanguage.name, currentLanguage.id);
				instance.languageIDToName.set(currentLanguage.id, currentLanguage.name);
				instance.languageIDToLanguage.set(currentLanguage.id, currentLanguage);
				LanguageDataManager.addLanguage(currentLanguage);
			}

			instance.currentNoun = new NounsManager();
			instance.currentVerb = new VerbsManager();
			instance.currentAdjective = new AdjectivesManager();
			instance.currentWord.data = instance.currentNoun;

			/*
				Create data container for "Meanings" frame
			*/
			instance.templateWord.meanings = response.map(mapLanguageToMeaning);
			instance.currentWord.meanings = response.map(mapLanguageToMeaning);

			//Get pronoun informations for all languages
			instance.pronounsManager = new PronounsManager();

			//Set first language as the selected language (default language)
			if (response.length > 0)
				instance.selectedLanguageID = [response[0].id]; 

			//Fetch word categories from the server
			categoryService.load(function(categories) {

				for (let category of categories)
					instance.categories.push(new Category(category));

				//Fetch words from the server
				wordService.loadWords(function(words) {

					let response: Word[] = words;
					instance.uncategorizedWordIDs = [];

					for (let currentWord of response) {

						let wordID = currentWord.id;
						
						/*
							"meanings" property is a Map in the server, however
							in UI, we need it to be a list
						*/
                        let serverMeaning = currentWord.meanings;
						currentWord.meanings = [];

                        let keys = Object.keys(serverMeaning);
						for (let j = 0; j < keys.length; j++) {
                            let languageName = instance.languageIDToName.get(keys[j]);
                            let meaning = serverMeaning[keys[j]];
							currentWord.meanings.push({"languageName": languageName, "meaning": meaning});
						}

						instance.words.set(wordID, new Word(currentWord));

						if (currentWord.categories.length == 0)
							instance.uncategorizedWordIDs.push(wordID);
					}

					let signal: ListSetData = {
						mainTitleText : "CATEGORIES",
						titles: instance.categories,
						elements: instance.words,
						titleNameField: "name",
						titleElementField: "wordIDs",
						elementNameField: "name",
						titleType: "CATEGORY",
						elementType: "WORD",
						uncategorizedIDs: instance.uncategorizedWordIDs,
						showUncategorized: true,
						isElementRemovalAllowed: true
					};
					
					list.menuSetter.next(signal);
				});
			});
		});
	}

	PictureChanged(file : File) {
		this.icon = file;
	}

	CategoryPictureChanged(file: File) {
		this.categoryIcon = file;
	}

	CreateNew() {
		this.currentWord = JSON.parse(JSON.stringify(this.templateWord));
		this.editing = false;
		this.iconComponent.reinit();
	}

	Edit(word: Word, str: String) {
		if (str !== "WORD")
			return;

		console.log("Edit started! " + str);
		this.currentWord = word;
		this.editing = true;

		this.currentNoun = new NounsManager();
		this.currentAdjective = new AdjectivesManager();
		this.currentVerb = new VerbsManager();

		switch(word.type) {
			case "NOUN":
				this.currentNoun = new NounsManager(word.data);
				break;
			case "VERB":
				this.currentVerb = new VerbsManager(word.data);
				break;
			case "ADJECTIVE":
				this.currentAdjective = new AdjectivesManager(word.data);
				break;
		}

		this.iconComponent.reinit();
	}

	Save() {
		
		let data = new FormData();
		
		switch(this.currentWord.type) {
			case "NOUN":
				this.currentWord.data = this.currentNoun;
				break;
			case "VERB":
				this.currentWord.data = this.currentVerb;
				break;
			case "ADJECTIVE":
				this.currentWord.data = this.currentAdjective;
				break;
		}


		let json = JSON.parse(JSON.stringify(this.currentWord));
		json.data = this.currentWord.data.getAllData();

		delete json.pictureURL;
		delete json.meanings;

		json.meanings = {};

		//currentElement = {"languageName": "...", "meaning": ".."}
		for (let currentElement of this.currentWord.meanings) {
            let id = this.languageNameToID.get(currentElement.languageName);
			json.meanings[id.toString()] = currentElement.meaning;
		}

		if (this.icon) {
			data.append("picture", this.icon);
			data.append("pictureUploaded", "true");
		}

		if (this.editing) {
			data.append("editing", "true");
			data.append("id", json.id);
			delete json.id;
		}
		else
			data.append("editing", "false");

		data.append("data", JSON.stringify(json));

		let instance = this;

		this.wordService.saveWord(data, function(response) {

			instance.currentWord["pictureURL"] = response.pictureURL;
			instance.currentWord["id"] = response.id;
			instance.words.set(response.id, instance.currentWord);

			let wordCategoryIDs = instance.currentWord.categories
			let wordID = response.id;

			//Update categories
			for (let currentCategory of instance.categories) {				
				/*
					If this word is in the current category, but
					this word does not have the current category,
					then remove this word from the current category
				*/
				if (!wordCategoryIDs.includes(currentCategory.id))
					currentCategory.removeWordIDIfExists(wordID);

				/*
					If the word is not in the category, but the category
					is in the word, then add this word into that category
				*/
				else if (wordCategoryIDs.includes(currentCategory.id))
					currentCategory.addWordIDIfNotExists(wordID);
			}

			/*
				If the word is in "uncategorized" words list, but it has a category,
				then remove the word from uncategorized list
			*/
			if (instance.uncategorizedWordIDs.indexOf(wordID) != -1 && instance.currentWord.categories.length > 0) 
				instance.uncategorizedWordIDs.splice(instance.uncategorizedWordIDs.indexOf(wordID), 1);

			/* 
				If the word is not in "uncategorized" list, but it does not have a category,
				then add this word into "uncategorized" list
			*/
			if (instance.uncategorizedWordIDs.indexOf(wordID) == -1 && instance.currentWord.categories.length == 0)
				instance.uncategorizedWordIDs.push(wordID);

			instance.listListener.menuEditer.next(new ListEditData(false, wordID));
			instance.editing = true;
		});
	}

	SaveCategory() {

		let instance = this;
        let data = new FormData();
        let json = {"name" : this.categoryName};

		if (this.categoryIcon) {
			data.append("picture", this.categoryIcon);
			data.append("pictureUploaded", "true");
		}

		data.append("data", JSON.stringify(json));

		this.categoryService.save(data, function(response) {
			
            let category = new Category({
				id : response.id,
				name : instance.categoryName,
				pictureURL : response.pictureURL,
				wordIDs : []
			});
			instance.categories.push(category);
			instance.CloseCategoryPopup();
			instance.listListener.menuAdjuster.next(new ListOtherData());
		});
	}

	OpenCategoryPopup() {
		this.categoryIcon = null;
		this.categoryName = "New Category";
		this.modalView.nativeElement.style["display"] = "block";
	}

	CloseCategoryPopup() {
		this.modalView.nativeElement.style["display"] = "none";
	}

	Delete(data, str: String) {
		switch (str) {
			case "WORD": this.DeleteWord(data); break;
			case "CATEGORY": this.DeleteCategory(data); break;
			default: break;
		}
	}

	DeleteCategory(index: number) {

		let categoryID = this.categories[index].id;
		let instance = this;

		this.categoryService.deleteCategory(categoryID, function() {
			/*
				Find all words which has this category and remove this category from
				their category lists
			*/
			for (let wordID of instance.categories[index].wordIDs) {
                let currentWord = instance.words.get(wordID);
				currentWord.removeCategory(categoryID);
				if (currentWord.getCategoryListLength() == 0) 
					instance.uncategorizedWordIDs.push(wordID);
			}

			//Remove this category from categories list and signal it to left menu
			instance.categories.splice(index, 1);
			instance.listListener.menuAdjuster.next(new ListOtherData());
		});
	}

	DeleteWord(wordID: string) {

		let instance = this;
		this.wordService.deleteWord(wordID, function() {

			//Remove this word from all categories
			for (let category of instance.categories)
				category.removeWordIDIfExists(wordID);
			
			if (instance.words.get(wordID).getCategoryListLength() == 0)
				instance.uncategorizedWordIDs.splice(instance.uncategorizedWordIDs.indexOf(wordID), 1);

			//Remove it from Words map and signal it to the left menu
			instance.words.delete(wordID);
			instance.listListener.menuEditer.next(new ListEditData(false, wordID));
			instance.CreateNew();
		});
	}
}