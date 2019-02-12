import {Component, OnInit} from '@angular/core';
import {DebugService} from './debug.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../environments/environment';
import {DataService} from '../tabit/data/data.service';
import {AuthService} from './auth/auth.service';
import {Router} from '@angular/router';
import * as _ from 'lodash';

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

    constructor(private ds: DebugService, private translate: TranslateService, private dataService: DataService, private authService: AuthService, private router: Router) {
        this.logArr = ds.logArr;

        //get external link route // deep link
        /*const urlParams = new URLSearchParams(window.location.search);
        let linkType = urlParams.get('link');
        let businessDate = urlParams.get('businessDate');
        let siteId = urlParams.get('siteId');
        if(linkType) {
            window.localStorage.setItem('deeplink', JSON.stringify({businessDate: businessDate, siteId: siteId, linkType: linkType}));
        }*/
    }

    async ngOnInit() {
        /*const deeplink = JSON.parse(window.localStorage.getItem('deeplink'));
        if(deeplink) {
            const siteId = _.get(deeplink, 'siteId');
            const orgs = await this.dataService.getOrganizations();
            const org = _.find(orgs, {_id: siteId});
            if (org) {
                this.authService.selectOrg(org).then(() => {
                    return this.router.navigate(['/owners-dashboard/day', _.get(deeplink, 'businessDate')]);
                });
            }
        }*/

        this.cordova = window['cordova'];
        if (typeof window['cordova'] !== 'undefined') {
            this.ds.log('Cordova exists');
            const googleAnalytics = (<any>window).ga;
            if(googleAnalytics) {
                this.ds.log('GA exists');
                googleAnalytics.debugMode();
                (<any>window).ga.startTrackerWithId('UA-133546265-1', 30);
                googleAnalytics.trackView('Home');
            }
            else {
                this.ds.log('GA does NOT exists');
            }
        } else {
            this.ds.log('Cordova does NOT exist');
        }

        const that = this;
        setInterval(function () {
            that.token = window.localStorage.getItem('token');
        }, 1000);

        let currentLanguage = this.translate.getBrowserLang();
        let settings = JSON.parse(window.localStorage.getItem('settings'));
        if(settings && settings.lang) {
            currentLanguage = settings.lang;
        }

        if(currentLanguage !== 'en' && currentLanguage !== 'he') {
            currentLanguage = 'en';
        }

        if(!settings) {
            settings = {
                lang: currentLanguage
            };
        }
        else {
            settings.lang = currentLanguage;
        }

        window.localStorage.setItem('settings', JSON.stringify(settings));

        environment.lang = currentLanguage;
        let locale = currentLanguage === 'he' ? 'he-IL' : 'en-US';
        environment.tbtLocale = locale;
        this.translate.setDefaultLang(currentLanguage);
        this.translate.use(currentLanguage);
    }
}

