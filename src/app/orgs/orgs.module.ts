import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';

import {OrgsComponent} from './orgs.component';
import {OrgsRoutingModule} from './orgs-routing.module';
import {TranslateModule} from '@ngx-translate/core';

import {
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule
} from '@angular/material';

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
        TranslateModule
    ],
    declarations: [
        OrgsComponent
    ]
})
export class OrgsModule {
}
