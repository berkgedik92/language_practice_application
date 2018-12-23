import {Component, Output, EventEmitter, Input, ViewChild, DoCheck, IterableDiffers, IterableDiffer} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
declare var $: any;

@Component({
	selector: 'selector',
	templateUrl: './selector.html',
	styleUrls: ['./selector.css']
})
export class SelectorComponent implements DoCheck {

	@Input() isMultiple: boolean;
	@Input() elementID: string;
	@Input() pictureField: string;
	@Input() nameField: string;
	@Input() idField: string;

	@Input() val: any[];
	@Output() valChange = new EventEmitter();

	@ViewChild("input") input;
	@ViewChild("element") element;
	@ViewChild("list") list;

	private _datamap = {};
	private isListOpened: boolean = false;
	private minHeight: string = "40px";
	private maxListHeight: string ="120px";
	private _data: any[];
	hostAddr: String;

	constructor(private differs		: IterableDiffers,
				private _sanitizer	: DomSanitizer) {
		
		let instance = this;
		$("html").click(function(e) {
			if (e.target.id != instance.elementID && $(e.target).parents("#" + instance.elementID).length == 0) {
				instance.CloseList();
			}
		});
		this.hostAddr = document.querySelector("meta[property='hostAddress']").getAttribute("url");
	}

	getBackground(pictureURL) {
		let pictureURLProcessed = this.hostAddr + '/langapp/language/languages/circle.png';
		if (pictureURL != null && pictureURL.length > 0)
			pictureURLProcessed = this.hostAddr + '/langapp/' + pictureURL;
    	return this._sanitizer.bypassSecurityTrustStyle("url(" + pictureURLProcessed + ")");
	}

	getBackgroundSrc(pictureURL) {
		let pictureURLProcessed = this.hostAddr + '/langapp/language/languages/circle.png';
		if (pictureURL != null && pictureURL.length > 0)
			pictureURLProcessed = this.hostAddr + '/langapp/' + pictureURL;
    	return pictureURLProcessed;
	}

	CreateDataMap() {
		this._datamap = {};

		for (let i = 0; i < this._data.length; i++)
			this._datamap[this._data[i][this.idField]] = this._data[i];
	}
	
	@Input() set data(value: any[]) {
		this._data = value;
		if (value)
			this.CreateDataMap();
	}

	ngDoCheck() {
		let differ = this.differs.find([]).create(null);
		let changes = differ.diff(this._data);
    	if (changes && this._data)
    		this.CreateDataMap();
	}

	CloseList() {
		this.element.nativeElement.style["border"] = "1px solid black";
		this.list.nativeElement.style["display"] = "none";
		this.isListOpened = false;
	}

	OpenList() {
		this.element.nativeElement.style["border"] = "1px solid blue";
		this.list.nativeElement.style["display"] = "inline-block";
		this.isListOpened = true;
	}

	InputKeyUp() {
		let val = this.input.nativeElement.value;
		$(this.list.nativeElement).children(".selectlistelement").each(function() {
			let t = $(this);
			let text = t.attr("searchtext");
			if (text.indexOf(val) != -1)
				t.removeClass("hide");
			else
				t.addClass("hide");
		});
	}

	ElementClicked(event) {

		if (this._data.length == 0)
			return false;

		this.input.nativeElement.focus();
		let instance = this;

		if (!this.isListOpened)
			instance.OpenList();
		else
			instance.CloseList();
	}

	ListElementClicked(event) {
		let element = event.currentTarget;
		let id = element.getAttribute("id");
		let selectedBefore = element.getAttribute("selected").indexOf("true") == 0;

		this.val = JSON.parse(JSON.stringify(this.val));

		if (selectedBefore) {
			this.val.splice(this.val.indexOf(id), 1);
		}
		else {
			if (this.isMultiple)
				this.val.push(id);
			else {
				while (this.val.length > 0)
					this.val.splice(0, 1);
				this.val.push(id);
			}
		}

		this.valChange.emit(this.val);

		this.CloseList();
		event.stopPropagation();
	}

	RemoverClicked(event, id) {
		this.val = JSON.parse(JSON.stringify(this.val));
		this.val.splice(this.val.indexOf(id), 1);
		this.valChange.emit(this.val);
		event.stopPropagation();
	}
}