import {Component, Input, ElementRef, OnChanges, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AcordeonComponent}  from '../acordeon';
import {Subscription} from 'rxjs/Subscription';
import {ListService, ListOtherData, ListSetData} from '../../services';

@Component({
	selector: 'leftlist',
	templateUrl: './leftlist.html',
	styleUrls: ['./leftlist.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LeftListComponent implements OnChanges, OnDestroy {

	@Input() titles 					: any[];
	@Input() elements;

	@Input() mainTitleText				: string;
	@Input() titleNameField 			: string;
	@Input() titleElementField 			: string;
	@Input() elementNameField			: string;
	@Input() titleType					: string;
	@Input() elementType				: string;
	@Input() uncategorizedIDs			: string[];

	@Input() showUncategorized			: boolean;
	@Input() elementRemove				: boolean;

	private mySubscription				: Subscription;
	private uncategorizedTitleData 		= {name: 'Uncategorized', ownedElements: []};

	constructor(private element: ElementRef,
				private listListener: ListService,
				private cd: ChangeDetectorRef) {}

	ngOnChanges() {

		let instance = this;
		this.uncategorizedTitleData.ownedElements = this.uncategorizedIDs;

		this.mySubscription = this.listListener.menuAdjuster.subscribe(function(data: ListOtherData) {
      		instance.cd.markForCheck();
		});
	}

	ngOnDestroy() {
		this.mySubscription.unsubscribe();
	}

	/*addTitle() {
		this.element.nativeElement.dispatchEvent(new CustomEvent("addtitle", {
			detail: this.titleType,
			bubbles: true
		}));
	}*/
}