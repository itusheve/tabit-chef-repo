// we get 'Can't find variable Intl' on Safari 9:
// https://stackoverflow.com/questions/35017800/ionic-2-using-angular-2-pipe-breaks-on-ios-cant-find-variable-intl
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/he-IL';
import * as moment from 'moment';
import 'moment-timezone';
//TODO see maybe in angular 6 its solved.

import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// https://angular.io/guide/i18n#create-a-translation-source-file-with-ng-xi18n
// use the require method provided by webpack
declare const require;
// we use the webpack raw-loader to return the content as a string

// https://angular.io/guide/i18n#create-a-translation-source-file-with-ng-xi18n
// for JIT you can dynamically switch locale.for AOT you must build with a fixed locale.


let translations;

const providers = [];

if (environment.tbtLocale ==='he-IL') {
  translations = require(`raw-loader!./locale/messages.he.xlf`);
  providers.push({ provide: TRANSLATIONS, useValue: translations });
  providers.push({ provide: TRANSLATIONS_FORMAT, useValue: 'xlf' });
}

let urlParams = new URLSearchParams(window.location.search);
let accessToken = urlParams.get('at');
let siteId = urlParams.get('oid');
let region = urlParams.get('region');
if(accessToken && siteId && region) {
    let tokens;
    region = region.toLowerCase();
    if(region === 'il') {
        tokens = {il: {access_token: accessToken}};
    }
    else if(region === 'us') {
        tokens = {us: {access_token: accessToken}};
    }

    window.localStorage.setItem('tokens', JSON.stringify(tokens));
    window.localStorage.setItem('settings', JSON.stringify({lang: region === 'il' ? 'he' : 'en'}));
    window.localStorage.setItem('org', JSON.stringify({id: siteId, region: region, name: ''}));
    window.localStorage.setItem('userSettings', JSON.stringify({lang: region === 'il' ? 'he' : 'en'}));
}


const bootstrap = () => {
  platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: providers
  })
    .catch(err => console.log(err));
};

if (typeof window['cordova'] !== 'undefined') {
  document.addEventListener('deviceready', () => {
    bootstrap();
    // Hiding the Splash Screen
    document.querySelector('#splash').remove();
  }, false);
} else {
  bootstrap();
}
