import {Component, Injectable, ViewChild} from '@angular/core';
import {LanguageService, Language, LanguageData} from '../../services';
import {PictureSelectorComponent} from '../../components/pictureSelector';
import {ListService, ListEditData, ListOtherData, ListSetData} from '../../services';
import {PortletComponent, PortletField, PortletFieldType} from '../../components/portlet';
import {ScreenInterface} from '../ScreenInterface';

@Component({
	selector: 'languagescreen',
	templateUrl: './languageScreen.html',
	styleUrls: ['./languageScreen.css', '../../assets/common.css']
})
export class LanguageScreenComponent implements ScreenInterface {

	//DOM element for the PictureSelector component
	@ViewChild("icon") iconComponent;
	
	//List of all languages to be shown on the left menu
	languages : Language[];

	//Current language (new language or language to be edited, initially a new language)
	currentLanguage: Language = new Language({
		id : null,
		name : "New Language",
		pictureURL : "",
		alphabet : "",
		pronouns : [],
		verbs : [],
		nouns : [],
		adjectives : [],
	});

	templateLanguage = new Language({
		id : null,
		name : "New Language",
		pictureURL : "",
		alphabet : "",
		pronouns : [],
		verbs : [],
		nouns : [],
		adjectives : [],
	});

	//True if we are editing an existing language, False if it is a new language
	editing: boolean = false;

	pronounFields: PortletField[] = [
										new PortletField({
											field: "name", 
											title: "Pronoun", 
											type: PortletFieldType.STRING, 
											maxlength: 7,
											width: "60%", 
											disabled: false
										}),
										new PortletField({
											field: "group", 
											title: "Group", 
											type: PortletFieldType.NUMBER, 
											maxlength: 1,
											width: "40%", 
											disabled: false
										})
									];

	verbFields: PortletField[] = 	[
										new PortletField({
											field: "name", 
											title: "Verb Tense", 
											type: PortletFieldType.STRING, 
											maxlength: 10,
											width: "100%", 
											disabled: false
										})
								  	];

	nounFields: PortletField[] = 	[
										new PortletField({
											field: "name", 
											title: "Noun Type", 
											type: PortletFieldType.STRING, 
											maxlength: 20,
											width: "100%", 
											disabled: false
										})
								 	];

	adjectiveFields: PortletField[] = 	[
											new PortletField({
												field: "name", 
												title: "Type", 
												type: PortletFieldType.STRING, 
												maxlength: 20,
												width: "100%", 
												disabled: false
											})
										];

	//Keeps the file of the icon (picture) of the language
	icon: File = null;

	constructor(private languageService: LanguageService, 
				private listListener: ListService) {

		let instance = this;
		let list = listListener;

		languageService.loadLanguages(function(response) {

			instance.languages = response;

			let signal: ListSetData = {
				mainTitleText : "LANGUAGES",
				titles: instance.languages,
				elements: {},
				titleNameField: "name",
				titleElementField: "",
				elementNameField: "",
				titleType: "LANGUAGE",
				elementType: "",
				uncategorizedIDs: [],
				showUncategorized: false,
				isElementRemovalAllowed: true
			};

			list.menuSetter.next(signal);
		});
	}

	PictureChanged(file: File) {
		this.icon = file;
	}

	CreateNewLanguage() {
		this.currentLanguage = JSON.parse(JSON.stringify(this.templateLanguage));
		this.editing = false;
		this.iconComponent.reinit();
	}

	Edit(data: Language, elementType: String) {
		this.currentLanguage = data;
		this.editing = true;
		this.iconComponent.reinit();
	}

	Save() {
		let instance = this;

		//Remove empty spaces on the alphabet if there is any
		this.currentLanguage.alphabet = this.currentLanguage.alphabet.replace(/\s/g, '');

		let id = this.currentLanguage.id;

		let data = new FormData();

		if (this.editing) {
			data.append("editing", "true");
			data.append("id", id);
		}
		else 					
			data.append("editing", "false");

		if (this.icon) {
			data.append("picture", this.icon);
			data.append("pictureUploaded", "true");
		}

		data.append("data", JSON.stringify(this.currentLanguage));

		this.languageService.saveLanguage(data, function(response) {
			instance.currentLanguage["pictureURL"] = response.pictureURL;
			instance.currentLanguage["id"] = response.id;

			if (!instance.editing) {
				instance.languages.push(instance.currentLanguage);
				instance.editing = true;
				instance.listListener.menuAdjuster.next(new ListOtherData());
			}
			else {
				instance.listListener.menuEditer.next(new ListEditData(true, instance.currentLanguage));
			}

		});
	}

	Delete(data, elementType: String) {
		switch (elementType) {
			case "LANGUAGE"	: this.DeleteLanguage(data); break;
			default: break;
		}
	}

	DeleteLanguage(index: number) {
		let id = this.languages[index].id;
		let instance = this;
		let currentIndex = index;

		this.languageService.deleteLanguage(id, function() {
			instance.languages.splice(currentIndex, 1);
			instance.CreateNewLanguage();
			instance.listListener.menuAdjuster.next(new ListOtherData());
		});
		this.iconComponent.reinit();
	}
}