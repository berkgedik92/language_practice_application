import {Component, Input} from '@angular/core';
import {NounsManager, PronounsManager} from "../wordScreen";

@Component({
	selector: 'nounscreen',
	templateUrl: './nounScreen.html',
	styleUrls: ['./nounScreen.css']
})
export class NounScreenComponent {
	@Input() titles : any[];
	@Input() data : NounsManager;
	@Input() language : string;

	somethingChanged(event, index) {
		this.data.getData(this.language).set(index + '', event.srcElement.value);
	}
}