import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ApplicationComponent } from './app.component';
import { AcordeonComponent } from '../components/acordeon/acordeon';
import { DraggableElementComponent } from '../components/draggableelement/draggableelement';
import { LanguageScreenComponent } from '../components/languageScreen/languageScreen';
import { LeftListComponent } from '../components/leftlist/leftlist';
import { NounScreenComponent } from '../components/nounScreen/nounScreen';
import { PictureSelectorComponent } from '../components/pictureSelector/pictureSelector';
import { PortletComponent } from '../components/portlet/portlet';
import { SelectorComponent } from '../components/selector/selector';
import { UserScreenComponent } from '../components/userScreen/userScreen';
import { VerbScreenComponent } from '../components/verbScreen/verbScreen';
import { WordScreenComponent } from '../components/wordScreen/wordScreen';
import { LoginScreenComponent } from '../components/loginScreen/loginScreen';
import {RouterModule, Routes, Router} from '@angular/router';
import { FormsModule } from '@angular/forms';
import {Component, Input, Pipe, PipeTransform} from '@angular/core';
import {CategoryService} from '../services/CategoryService'
import {HTTPService} from '../services/HTTPService'
import {LanguageService} from '../services/LanguageService'
import {ListService} from '../services/ListService'
import {UserService} from '../services/UserService'
import {WordService} from '../services/WordService'
import { HttpModule } from '@angular/http';

const appRoutes: Routes = [
  {path: 'langs', component: LanguageScreenComponent},
  {path: 'words', component: WordScreenComponent},
  {path: 'users', component: UserScreenComponent},
  {path: 'login', component: LoginScreenComponent}
];

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value) : any {
    let keys = [];

    for (let key in value)
      if (value.hasOwnProperty(key))
          keys.push({key: key, value: value[key]});
  
    return keys;
  }
}

@NgModule({
  declarations: [
    KeysPipe,
    ApplicationComponent,
    AcordeonComponent,
    DraggableElementComponent,
    LanguageScreenComponent,
    LeftListComponent,
    NounScreenComponent,
    PictureSelectorComponent,
    PortletComponent,
    SelectorComponent,
    UserScreenComponent,
    VerbScreenComponent,
    WordScreenComponent,
    LoginScreenComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [
    HTTPService, 
    CategoryService, 
    LanguageService, 
    ListService, 
    UserService, 
    WordService
  ],
  bootstrap: [ApplicationComponent]
})
export class AppModule { }
