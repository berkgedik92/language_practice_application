import {Component, Input, ElementRef, ChangeDetectionStrategy} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
declare var $: any;

@Component({
	selector: 'draggableelement',
	templateUrl: './draggableelement.html',
	styleUrls: ['./draggableelement.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableElementComponent {

	@Input() text		: string;
	@Input() picture	: string;
	hostAddr: String;
	
	constructor(private element 	: ElementRef,
				private _sanitizer  : DomSanitizer) {
		$(element.nativeElement).draggable({
			delay: 10,
			revert: "invalid"
		});
		this.hostAddr = document.querySelector("meta[property='hostAddress']").getAttribute("url");
	}

	getBackground(pictureURL) {
		let pictureURLProcessed = this.hostAddr + '/langapp/language/languages/circle.png';
		if (pictureURL != null && pictureURL.length > 0)
			pictureURLProcessed = this.hostAddr + '/langapp/' + pictureURL;
    	return this._sanitizer.bypassSecurityTrustStyle("url(" + pictureURLProcessed + ")");
	}
}