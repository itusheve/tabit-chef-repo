import {Component, OnInit} from '@angular/core';
import {DebugService} from './debug.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],

    // TLA:
    // tslint:disable-next-line:use-host-property-decorator
    host: {
        '[class.cordova]': 'cordova'
    }
})

export class AppComponent implements OnInit {
    cordova = '';

    token = 'please hold';

    logArr: { type: string, message: string }[];

    constructor(private ds: DebugService, private translate: TranslateService) {
        this.logArr = ds.logArr;

        let settings = JSON.parse(window.localStorage.getItem('settings'));
        if(!settings) {
            settings = {
                lang: environment.region === 'il' ? 'he' : 'en'
            };
        }

        let currentLanguage = settings.lang || translate.getBrowserLang();
        if(currentLanguage !== 'en' && currentLanguage !== 'he') {
            currentLanguage = 'en';
        }
        translate.setDefaultLang(currentLanguage);
        translate.use(currentLanguage);
    }

    ngOnInit() {
        /* TLA: */
        this.cordova = window['cordova'];
        if (typeof window['cordova'] !== 'undefined') {
            this.ds.log('Cordova exists');
        } else {
            this.ds.log('Cordova does NOT exist');
        }

        const that = this;
        setInterval(function () {
            that.token = window.localStorage.getItem('token');
        }, 1000);
    }
}

