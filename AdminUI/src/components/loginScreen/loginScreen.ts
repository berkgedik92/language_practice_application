import {Component, ChangeDetectionStrategy} from '@angular/core';
import {HTTPRequest, RequestMethod, HTTPService} from "../../services/HTTPService";

@Component({
	selector: 'loginScreen',
	templateUrl: './loginScreen.html',
	styleUrls: ['./loginScreen.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginScreenComponent {
	
	username: string = "";
	password: string = "";

	constructor(private httpService: HTTPService) {}

	Login() {
		this.httpService.Login(this.username, this.password);
	}
}