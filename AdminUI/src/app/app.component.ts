import {Component} from '@angular/core';
import {LeftListComponent} from '../components/leftlist';
import {LanguageScreenComponent} from '../components/languageScreen';
import {WordScreenComponent} from '../components/wordScreen';
import {UserScreenComponent} from '../components/userScreen';
import {ScreenInterface} from '../components/ScreenInterface';
import {ListService, ListSetData, LanguageService, WordService, CategoryService, UserService} from '../services';
import {Router} from '@angular/router';
import {HTTPService} from '../services/HTTPService'

@Component({
  selector: 'application',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class ApplicationComponent {
	mainTitleText : string;
	titles : any;
	elements : any;
	titleNameField : string;
	titleElementField : string;
	elementNameField : string;
	elementType: string = "";
	titleType: string = "";
	uncategorizedIDs: string[] = [];
	router: Router;

	currentComponent: ScreenInterface;

	showUncategorized: boolean = false;
	elementRemove: boolean = true;

	constructor(private _router: Router,
				private httpService: HTTPService,
				private listListener: ListService) {

		let instance = this;
		this.router = _router;
   		this.router.navigateByUrl('/login');

		listListener.menuSetter.subscribe(function(data) {
			instance.setLeftListData(data);
		})
	}

	onActivate(componentRef: ScreenInterface){
		this.currentComponent = componentRef;
	}

	SignOut() {
		this.httpService.SignOut();
	}

	GoToUserPage(){
   		this.router.navigateByUrl('/users');
	}

	GoToWordPage(){
   		this.router.navigateByUrl('/words');
	}

	GoToLangPage(){
   		this.router.navigateByUrl('/langs');
	}

	setLeftListData(event: ListSetData) {
		this.mainTitleText = event.mainTitleText;
		this.titles = event.titles;
		this.elements = event.elements;
		this.titleNameField = event.titleNameField;
		this.titleElementField = event.titleElementField;
		this.elementNameField = event.elementNameField;
		this.elementType = event.elementType;
		this.titleType = event.titleType;
		this.uncategorizedIDs = event.uncategorizedIDs;
		this.showUncategorized = event.showUncategorized;
		this.elementRemove = event.isElementRemovalAllowed;
	}

	EditElementStart(event: CustomEvent) {
		this.currentComponent.Edit(event.detail.elementData, event.detail.elementType);
		event.stopPropagation();
	}

	EditTitleStart(event: CustomEvent) {
		this.currentComponent.Edit(event.detail.elementData, event.detail.titleType);
		event.stopPropagation();
	}

	DeleteElementStart(event: CustomEvent) {
		this.currentComponent.Delete(event.detail.elementData, event.detail.elementType);
		event.stopPropagation();
	}

	DeleteTitleStart(event: CustomEvent) {
		this.currentComponent.Delete(parseInt(event.detail.elementData), event.detail.titleType);
		event.stopPropagation();
	}
}
