import {Component, Input, OnChanges, OnDestroy, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ListService, ListEditData} from '../../services';
import {Subscription} from 'rxjs/Subscription';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

export class AcordeonEventSignal {
	constructor (public titleType: string,
				 public elementType: string,
				 public elementData: any) {}
}

@Component({
	selector: 'acordeon',
	templateUrl: './acordeon.html',
	styleUrls: ['./acordeon.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcordeonComponent implements OnChanges, OnDestroy {
	
	@Input() titleRemove 		: boolean;
	@Input() titleEdit 			: boolean;
	@Input() elementRemove		: boolean;

	@Input() titleNameField 	: string;
	@Input() titleElementField	: string;
	@Input() elementNameField 	: string;

	@Input() titleType			: string;
	@Input() elementType		: string;

	@Input() titleID			: string;

	@Input() currentTitle		: any;
	@Input() allElements 		: Map<String, Object>;

	private titleHeight			: number = 41;
	private elementHeight 		: number = 31;
	private oldLength 			: number = 0;
	private targetHeight 		: string = this.titleHeight + "px";
	private isOpened 			: boolean = false;
	private ownedElementIDs 	: string[];
	private mySubscription		: Subscription;

	hostAddress: String;

	constructor(private element			: ElementRef,
				private listListener	: ListService,
				private cd				: ChangeDetectorRef,
				private _sanitizer		: DomSanitizer) {
		this.hostAddress = document.querySelector("meta[property='hostAddress']").getAttribute("url");
	}

	getBackground(pictureURL) {
		let pictureURLProcessed = this.hostAddress + '/langapp/language/languages/circle.png';
		if (pictureURL != null && pictureURL.length > 0)
			pictureURLProcessed = this.hostAddress + '/langapp/' + pictureURL;
    	return this._sanitizer.bypassSecurityTrustStyle("url(" + pictureURLProcessed + ")");
	}

	ngOnChanges() {

		let instance = this;

		if (this.currentTitle && this.titleElementField && this.currentTitle.hasOwnProperty(this.titleElementField))
			this.ownedElementIDs = this.currentTitle[this.titleElementField];
		else
			this.ownedElementIDs = [];

		this.mySubscription = this.listListener.menuEditer.subscribe(function(editData: ListEditData) {
			instance.setHeight();
			instance.cd.markForCheck();

			/*if (instance.oldLength != instance.ownedElementIDs.length) {
      			instance.setHeight();
      			instance.oldLength = instance.ownedElementIDs.length;
      			instance.cd.markForCheck();
      		}
      		if (editData.isTitle && editData.data === instance.currentTitle)
      			instance.cd.markForCheck();
      		if (!editData.isTitle && instance.currentTitle[instance.titleElementField].indexOf(editData.data) != -1) {
      			instance.cd.markForCheck();
      		}*/
		});
	}

	ngOnDestroy() {
		this.mySubscription.unsubscribe();
	}

	setHeight() {

		if (this.ownedElementIDs.length > 0) {
			if (!this.isOpened)
				this.targetHeight = this.titleHeight + "px";
			else 
				this.targetHeight = (this.titleHeight + this.elementHeight * this.ownedElementIDs.length) + "px";
		}
		else {
			this.targetHeight = this.titleHeight + "px";
		}
	}

	TitleClicked() {

		if (this.ownedElementIDs.length > 0) {
			this.isOpened = !this.isOpened;
			this.setHeight();
		}

		if (this.titleEdit)
			this.EditTitleStart();
	}

	DispatchEvent(eventName: string, 
			      data: any) {

		this.element.nativeElement.dispatchEvent(new CustomEvent(eventName, {
			detail: data,
			bubbles: true
		}));
	}

	EditElementStart(elementID: string) {

		this.DispatchEvent("editelement", new AcordeonEventSignal(
											this.titleType,
											this.elementType,
											this.allElements.get(elementID)
										));
	}

	EditTitleStart() {

		this.DispatchEvent("edittitle", new AcordeonEventSignal(
											this.titleType,
											this.elementType,
											this.currentTitle
										));
	}

	DeleteElement(elementID: string, event: Event) {

		this.DispatchEvent("deleteelement", new AcordeonEventSignal(
												this.titleType,
												this.elementType,
												elementID
											));

		//Prevent the event to be bubbled up (so EditElement function will not be called)
		event.stopPropagation();

	}

	DeleteTitle(event: Event) {

		this.DispatchEvent("deletetitle", new AcordeonEventSignal(
												this.titleType,
												this.elementType,
												this.titleID
											));
		
		//Prevent the event to be bubbled up (so EditTitle function will not be called)
		event.stopPropagation();
	}
}