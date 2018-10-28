import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import dxConfig from 'devextreme/core/config';
import {DataService} from '../tabit/data/data.service';

@Injectable()
export class LocalizationService {

    constructor(dataService: DataService) {

        dataService.settings$.subscribe(settings => {
            const bodyEl = document.getElementsByTagName("BODY")[0];
            bodyEl.setAttribute('dir', settings.lang === 'he' ? 'rtl' : 'ltr');
            bodyEl.setAttribute('lang', settings.lang === 'he' ? 'he' : 'en');
            if (settings.lang === 'he') bodyEl.classList.add("rtl");
            // [style.direction] = "env.tbtLocale==='he-IL' ? 'rtl' : 'ltr'"//also needed? currently doesnt look so.

            dxConfig({
                defaultCurrency: settings.region === 'il' ? 'ILS' : 'USD',
                rtlEnabled: settings.lang === 'he' ? true : false
            });
        });
    }

}
