import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';

import {OrgsComponent} from './orgs.component';
import {OrgsRoutingModule} from './orgs-routing.module';

import {
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule
} from '@angular/material';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import localeHebrew from '@angular/common/locales/he';
import {HttpClient} from '../../../node_modules/@angular/common/http';
import {createTranslateLoader} from '../app.module';

registerLocaleData(localeHebrew, 'he');


@NgModule({
    imports: [
        CommonModule,
        OrgsRoutingModule,

        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    declarations: [
        OrgsComponent
    ]
})
export class OrgsModule {
}
