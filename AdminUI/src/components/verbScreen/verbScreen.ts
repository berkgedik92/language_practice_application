import {Component, Input, Pipe, PipeTransform} from '@angular/core';
import {VerbsManager, PronounsManager} from "../wordScreen";

@Component({
	selector: 'verbscreen',
	templateUrl: './verbScreen.html',
	styleUrls: ['./verbScreen.css']
})
export class VerbScreenComponent {

	@Input() titles: any[];
	@Input() data: VerbsManager;
	@Input() data2: PronounsManager;
	@Input() language : string;

	amountPerTable: number = 2;

	constructor() {}

	getKeys(map){
		return Array.from(map.keys());
	}

	range1() : number[] {
        let n = Math.ceil(this.titles.length / this.amountPerTable);
		return new Array(n);
	}

	range2(outerindex: number) : number[] {
        let length = this.titles.length;
        let current = outerindex * this.amountPerTable;
        let remaining = length - current;
    	if (remaining > this.amountPerTable) remaining = this.amountPerTable;
    	return new Array(remaining);
	}

	somethingChanged(event, parentIndex, data2Index, i) {
		this.data.getData(this.language).get((parentIndex * this.amountPerTable + i)+'')[data2Index] = event.srcElement.value;
	}

	getData(parentIndex, data2Index, i) {
		return this.data.getData(this.language).get((parentIndex * this.amountPerTable + i)+'')[data2Index];
	}
}