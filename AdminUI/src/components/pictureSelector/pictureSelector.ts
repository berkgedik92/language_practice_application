import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'pictureSelector',
	templateUrl: './pictureSelector.html',
	styleUrls: ['./pictureSelector.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PictureSelectorComponent {

	@Output('changepic') data: EventEmitter<File> = new EventEmitter<File>(); 
	@ViewChild("rootdiv") rootdiv; 
	@ViewChild("fileinput") fileinput; 

	@Input() defaultcolor: string;
	@Input() message: string;
	hostAddr: String;

	constructor(private _sanitizer: DomSanitizer) {
		this.hostAddr = document.querySelector("meta[property='hostAddress']").getAttribute("url");
	}

	reinit() {
		this.rootdiv.nativeElement.setAttribute("chosed", "false");
	}

	getBackground(pictureURL) {
		let pictureURLProcessed = this.hostAddr + '/langapp/language/languages/circle.png';
		if (pictureURL != null && pictureURL.length > 0)
			pictureURLProcessed = this.hostAddr + '/langapp/' + pictureURL;
    	return "url(" + pictureURLProcessed + ")";
	}

	private _original: string = "";
	@Input() set original(value: string) {
		this._original = value;
	    this.rootdiv.nativeElement.style["background-image"] = this.getBackground(value);
	}

	get original(): string {    
		return this._original; 
	}

	PictureChange(event) {
		let pictureData = event.currentTarget.files[0];
		let reader = new FileReader();
		let instance = this;
		let aa = event;

		reader.onloadend = function(e: any) {
			instance.rootdiv.nativeElement.style["background-image"] = "url(" + (e.target.result) + ")";
			instance.rootdiv.nativeElement.setAttribute("chosed", "true");
			aa.target.value = '';
		};

		reader.readAsDataURL(pictureData);
		this.data.emit(pictureData);
	}

	Remove() {
	    this.rootdiv.nativeElement.style["background-image"] = this.getBackground(this._original);
	    this.rootdiv.nativeElement.setAttribute("chosed", "false");
		this.data.emit(null);
	}
}