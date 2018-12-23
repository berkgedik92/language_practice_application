import {Component, ViewChild, AfterViewInit, Injectable} from '@angular/core';
import {PictureSelectorComponent} from '../../components/pictureSelector';
import {SelectorComponent} from '../../components/selector';
import {DraggableElementComponent} from '../../components/draggableelement';
import {LanguageService, ListOtherData, Language, UserService, LanguageStatus, User, UserData, ListService, ListEditData, ListSetData, CategoryService, Category, CategoryData, Word, WordService} from '../../services';
declare var $: any;

@Component({
	selector: 'userscreen',
	templateUrl: './userScreen.html',
	styleUrls: ['./userScreen.css', '../../assets/common.css']
})
export class UserScreenComponent implements AfterViewInit {

	@ViewChild("icon") iconcomponent;
	@ViewChild("selectedcontainer") selectedcontainer;
	@ViewChild("unselectedcontainer") unselectedcontainer;

	languages: Language[] = [];
	users: User[] = [];

	/*
		Map from LanguageID to List of WordIDs of 
		Words that this language contains. (If a Word has a saved meaning
		in this language, then this language contains this word)
	*/
	languageToWords: Map<String, String[]> = new Map<String, String[]>();

	//WordID to Word for all words
	words: Map<String, Word> = new Map<String, Word>();

	//Map<String, Map<String, LanguageStatus>>
	//userID -> {languageID -> LanguageStatus}
	userLanguageData: Map<String, Map<String, LanguageStatus>> = new Map<String, Map<String, LanguageStatus>>();
	categories: Category[] = [];

	icon: File = null;

	templateUser: User = new User({
		id : null,
		username : "",
		password : "",
		realName : "Enter a name",
		pictureURL : "",
		languageIDs : [],
		currentLanguageIDs : [],
		mainLanguageIDs : []
	});
		
	currentUser: User = new User({
		id : null,
		username : "",
		password : "",
		realName : "Enter a name",
		pictureURL : "",
		languageIDs : [],
		currentLanguageIDs : [],
		mainLanguageIDs : []
	});

	editing: boolean = false;
	isuserareaopened: boolean = true;

	selectedCategories: string[] = [];
	relation: string = "<";
	selectedLevel: string = "0";

	currentLanguageData: LanguageStatus = new LanguageStatus();
	
	assignedWords: String[] = [];
	unassignedWords: String[] = [];

	constructor(private languageService : LanguageService,
				private wordService: WordService,
				private listListener: ListService,
				private userService : UserService,
				private categoryService : CategoryService) {

		let instance = this;
		let list = listListener;

		categoryService.load(function(response) {
			instance.categories = response;

			instance.categories.push(new Category({
				id : "ALL",
				name : "ALL",
				pictureURL : "",
				wordIDs : []
			}));

			languageService.loadLanguages(function(response) {
				instance.languages = response;

				wordService.loadWords(function(words) {
					for (let word of words)
						instance.words.set(word.id, word);

					let languageIDs = [];
					for (let language of instance.languages) {
						instance.languageToWords.set(language.id, []);
						languageIDs.push(language.id);
					}
					
					let wordIDs = Array.from(instance.words.keys());
					for (let wordID of wordIDs) {
						let currentWord = instance.words.get(wordID);

						//Map from languageID to meaning
						let wordMeanings = currentWord.meanings
						for (let languageID of languageIDs)
							if (wordMeanings[languageID].length > 0)
								instance.languageToWords.get(languageID).push(wordID);
					}
					
					//response = List of users
					userService.loadUsers(function(response) {

						for (let user of response) {
							if (user["currentLanguageIDs"] == null)
								user["currentLanguageIDs"] = [];
		
							if (user["mainLanguageIDs"] == null)
								user["mainLanguageIDs"] = [];
						}

						for (let user of response)
							instance.users.push(new User(user));
		
						instance.userLanguageData = new Map<String, Map<String, LanguageStatus>>();
						for (let user of response) {
							let languageIDs = Object.keys(user["languages"]);
							let userData = new Map<String, LanguageStatus>()
							for (let languageID of languageIDs)
								userData.set(languageID, new LanguageStatus(user["languages"][languageID]));
							instance.userLanguageData.set(user.id, userData);
						}
		
						let languageMap = new Map<String, Language>();
						for (let currentLanguage of instance.languages)
							languageMap.set(currentLanguage.id, currentLanguage);
		
						let signal: ListSetData = {
							mainTitleText : "USERS",
							titles: instance.users,
							elements: languageMap,
							titleNameField: "realName",
							titleElementField: "languageIDs",
							elementNameField: "name",
							titleType: "USER",
							elementType: "LANGUAGE",
							uncategorizedIDs: [],
							showUncategorized: false,
							isElementRemovalAllowed: false
						};
						
						list.menuSetter.next(signal);
					});
				});
			})
		});
	}

	//ViewChild'ler burada hazir oluyor
	//noinspection JSUnusedGlobalSymbols
	ngAfterViewInit() {
		let instance = this;
		$(this.selectedcontainer.nativeElement).droppable({
			accept: ".word.unselected",
			drop: function(event, ui) {
				let wordID = ui.draggable.attr("wordID");
				instance.unassignedWords.splice(instance.unassignedWords.indexOf(wordID), 1);
				instance.assignedWords.push(wordID);
			}
		});

		$(this.unselectedcontainer.nativeElement).droppable({
			accept: ".word.selected",
			drop: function(event, ui) {
				let wordID = ui.draggable.attr("wordID");
				instance.unassignedWords.push(wordID);
				instance.assignedWords.splice(instance.assignedWords.indexOf(wordID), 1);
			}
		});
	}

	PictureChanged(file : File) {
		this.icon = file;
	}

	CreateNew() {
		this.currentUser = JSON.parse(JSON.stringify(this.templateUser));
		this.editing = false;
		this.iconcomponent.reinit();
	}

	Edit(data, str: String) {
		switch (str) {
			case "LANGUAGE" : this.EditLanguage(data); break;
			case "USER"		: this.EditUser(data); break;
			default: break;
		}
	}

	Delete(data, str: String) {
		switch (str) {
			case "USER"	: this.DeleteUser(data); break;
			default: break;
		}
	}

	EditUser(data: User) {
		this.currentUser = data;
		this.editing = true;
		this.isuserareaopened = true;
		this.iconcomponent.reinit();
	}

	DeleteUser(index: number) {
		let instance = this;
		this.userService.deleteUser(this.users[index].id, function() {
			instance.users.splice(index, 1);
			instance.CreateNew();
		});
	}

	diff(source, a) {
	    return source.filter(function(i) {return a.indexOf(i) < 0;});
	};

	EditLanguage(data) {

		let languageID = data.id;
		this.currentLanguageData = this.userLanguageData.get(this.currentUser.id).get(languageID);
		this.editing = true;
		this.isuserareaopened = false;

		let userwordids = Array.from(this.currentLanguageData.assignedWords.keys());
		let nonassigned = this.diff(this.languageToWords.get(this.currentLanguageData.languageID), userwordids);
		
		this.assignedWords = userwordids;
		this.unassignedWords = nonassigned;

		this.selectedCategories = ["ALL"];
		this.selectedLevel = "0";
		this.relation = ">";
		this.iconcomponent.reinit();
	}

	intersect(s, a) {
		return [s, a].reduce((p,c) => p.filter(e => c.includes(e)));
	}

	IsFiltered(id: String) {
		let data: Word = this.words.get(id);

		//Check categories
		let isCategoryOk = this.selectedCategories.indexOf("ALL") != -1 || this.intersect(data.categories, this.selectedCategories);

		if (!isCategoryOk)
			return true;

		//Check level
		let level = parseInt(this.selectedLevel);
		let isLevelOk = false;

		if (this.relation == ">")
			isLevelOk = data.level > level;
		else if (this.relation == "=")
			isLevelOk = data.level == level;
		else
			isLevelOk = data.level < level;

		return !isLevelOk;
	}

	RemoveAll() {
		for (let i = 0; i < this.assignedWords.length; i++) {
			let id = this.assignedWords[i];
			let isDisplayed = !this.IsFiltered(id);
			if (isDisplayed) {
				this.unassignedWords.push(id);
				this.assignedWords.splice(i, 1);
				i--;
			}
		}
	}

	AddAll() {
		for (let i = 0; i < this.unassignedWords.length; i++) {
			let id = this.unassignedWords[i];
			let isDisplayed = !this.IsFiltered(id);
			if (isDisplayed) {
				this.unassignedWords.splice(i, 1);
				this.assignedWords.push(id);
				i--;
			}
		}
	}

	SaveUser() {
		if (this.currentUser.currentLanguageIDs.length == 0 || this.currentUser.languageIDs.indexOf(this.currentUser.currentLanguageIDs[0]) == -1) {
			alert("You must select current language among user languages");
			return;
		}

		let instance = this;
		let data = new FormData();

		if (this.editing) {
			data.append("editing", "true");
			data.append("id", this.currentUser.id);
		}
		else 					
			data.append("editing", "false");

		if (this.icon) {
			data.append("picture", this.icon);
			data.append("pictureUploaded", "true");
		}

		data.append("data", JSON.stringify(this.currentUser));
		this.userService.saveUser(data, function(response) {

			instance.currentUser["pictureURL"] = response.pictureURL;
			instance.currentUser["id"] = response.id;
			
			if (!instance.editing)
				instance.users.push(instance.currentUser);

			if (!instance.userLanguageData.has(response.id))
				instance.userLanguageData.set(response.id, new Map<String, LanguageStatus>());

			for (let i = 0; i < instance.currentUser.languageIDs.length; i++) {
				let languageID = instance.currentUser.languageIDs[i];
				if (!instance.userLanguageData.get(response.id).has(languageID))
					instance.userLanguageData.get(response.id).set(languageID, new LanguageStatus({"languageID": languageID}));
			}

			instance.listListener.menuAdjuster.next(new ListOtherData());
			instance.editing = true;
		});
	}

	SaveUserLanguage() {

		let instance = this;
		let oldWordIDs = Object.keys(this.currentLanguageData.assignedWords);
		let wordIDs = this.assignedWords;

		let userID = this.currentUser.id;
		let languageID = this.currentLanguageData.languageID;
		let addedWordIDs = this.diff(wordIDs, oldWordIDs);
		let removedWordIDs = this.diff(oldWordIDs, wordIDs);

		let data = {
			"userID": userID,
			"languageID": languageID,
			"addedWordIDs": addedWordIDs,
			"removedWordIDs": removedWordIDs
		};

		this.userService.saveUserLanguage(data, function() {
			for (let i = 0; i < addedWordIDs.length; i++)
				instance.currentLanguageData.assignedWords.set(addedWordIDs[i], {});
			for (let i = 0; i < removedWordIDs.length; i++)
				instance.currentLanguageData.assignedWords.delete(removedWordIDs[i]);
		});
	}
}