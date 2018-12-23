import {Component, Input} from '@angular/core';

export enum PortletFieldType {STRING, NUMBER}

export interface PortletFieldBuilder {
	field: string,
	title: string,
	type: PortletFieldType,
	maxlength: number,
	width: string,
	disabled: boolean
}

export class PortletField {

	field: string;
	title: string;
	type: PortletFieldType;
	maxlength: number;
	width: string;
	disabled: boolean;

	constructor(params: PortletFieldBuilder) {
		this.field = params.field;
		this.title = params.title;
		this.type = params.type;
		this.maxlength = params.maxlength;
		this.width = params.width;
		this.disabled = params.disabled;
	}
}

@Component({
	selector: 'portlet',
	templateUrl: './portlet.html',
	styleUrls: ['./portlet.css']
})
export class PortletComponent {

	@Input() fields : PortletField[];
	@Input() buttons : boolean;
	@Input() title : string;

	private newData: any = {};

	private _data: any[];	//bir interface tanimla
	@Input() set data(value: any[]) {

		this.newData = {};
		for (let i = 0; i < this.fields.length; i++)
			this.newData[this.fields[i].field] = (this.fields[i].type == PortletFieldType.NUMBER) ? "0" : "";

		this._data = value;
	}

	get data(): any[] {    
		return this._data; 
	}

	add() {
		let clone = JSON.parse(JSON.stringify(this.newData));
		this.data.push(clone);
	}

	remove(index: number) {
		this._data.splice(index, 1);
	}
	
}