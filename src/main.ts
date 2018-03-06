import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';//https://material.angular.io/guide/getting-started

if (environment.production) {
  enableProdMode();
}

// https://angular.io/guide/i18n#create-a-translation-source-file-with-ng-xi18n
// use the require method provided by webpack
declare const require;
// we use the webpack raw-loader to return the content as a string

// https://angular.io/guide/i18n#create-a-translation-source-file-with-ng-xi18n
// for JIT you can dynamically switch locale.for AOT you must build with a fixed locale.
// const locale = 'he';//he|en-US

enum Locales {
  'he',
  'en-US'
}
const locale = Locales['he'];

let translations;

const providers = [];

if (Locales[locale]===Locales[0]) {
  translations = require(`raw-loader!./locale/messages.he.xlf`);
  providers.push({ provide: TRANSLATIONS, useValue: translations });
  providers.push({ provide: TRANSLATIONS_FORMAT, useValue: 'xlf' });
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  providers: providers
})
  .catch(err => console.log(err));

