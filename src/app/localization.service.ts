import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import dxConfig from 'devextreme/core/config';

@Injectable()
export class LocalizationService {

    constructor() {
        const bodyEl = document.getElementsByTagName("BODY")[0];
        bodyEl.setAttribute('dir', environment.tbtLocale === 'he-IL' ? 'rtl' : 'ltr');
        bodyEl.setAttribute('lang', environment.tbtLocale === 'he-IL' ? 'he' : 'en');
        if (environment.tbtLocale === 'he-IL') bodyEl.classList.add("rtl");
        // [style.direction] = "env.tbtLocale==='he-IL' ? 'rtl' : 'ltr'"//also needed? currently doesnt look so.

        dxConfig({
            defaultCurrency: environment.region === 'il' ? 'ILS' : 'USD',
            rtlEnabled: environment.tbtLocale === 'he-IL' ? true : false
        });
    }

}
