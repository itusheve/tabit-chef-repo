import { APP_INITIALIZER, NgModule, LOCALE_ID } from '@angular/core';//https://stackoverflow.com/questions/35191617/how-to-run-a-service-when-the-app-starts-in-angular-2/35191647
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//required by some material components

import { registerLocaleData } from '@angular/common';
import localeHe from '@angular/common/locales/he';
import localeHeExtra from '@angular/common/locales/extra/he';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { TokenInterceptor } from './auth/token.interceptor';
import { AsyncLocalStorageModule } from 'angular-async-local-storage';

import { 
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule, 
  MatIconModule, 
  MatCardModule,
  MatSnackBarModule,
  MatButtonToggleModule,
  MatGridListModule,
} from '@angular/material';//material modules

import { MomentModule } from 'angular2-moment';

import { ROSEp } from '../tabit/data/ep/ros.ep';
import { OlapEp } from '../tabit/data/ep/olap.ep';

import { UsersDataService } from '../tabit/data/dc/_users.data.service';
import { CategoriesDataService } from '../tabit/data/dc/_categories.data.service';
import { ItemsDataService } from '../tabit/data/dc/_items.data.service';
import { ModifierGroupsDataService } from '../tabit/data/dc/_modifierGroups.data.service';
import { OffersDataService } from '../tabit/data/dc/_offers.data.service';
import { PeripheralsDataService } from '../tabit/data/dc/_peripherals.data.service';
import { PromotionsDataService } from '../tabit/data/dc/_promotions.data.service';
import { TablesDataService } from '../tabit/data/dc/_tables.data.service';

import { CardsDataService } from '../tabit/data/dc/cards.data.service';
import { ClosedOrdersDataService } from '../tabit/data/dc/closedOrders.data.service';
import { TrendsDataService } from '../tabit/data/dc/trends.data.service';
import { DataService } from '../tabit/data/data.service';

import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';

import { AuthService } from './auth/auth.service';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';

//feature modules:
import { OrgsModule } from './orgs/orgs.module';
import { OwnersDashboardModule } from './owners-dashboard/owners-dashboard.module';

// The CLI imports the locale data for you when you use the parameter --locale with ng serve and ng build.
if (environment.locale==='he') {
  registerLocaleData(localeHe, 'he', localeHeExtra);//https://angular.io/guide/i18n
}

//serve/build an hebrew version:
// ng serve --i18nFile=src/locale/messages.he.xlf --i18nFormat=xlf --locale=he
// ng serve --aot --i18nFile=src/locale/messages.he.xlf --i18nFormat=xlf --locale=he

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),

    MomentModule,
    BrowserAnimationsModule,
    AsyncLocalStorageModule,
    
    //feature modules:
    OrgsModule,
    OwnersDashboardModule,
    
    AppRoutingModule,//must be after the feature modules: "Each routing module augments the route configuration in the order of import."

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatGridListModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (as: AuthService) => function () { return as.authByToken(); },
      deps: [AuthService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { 
      provide: LOCALE_ID, 
      useValue: environment.locale==='he' ? 'he' : 'en-US'
    },
    AuthService, 
    UserGuard,
    OrgGuard,
    DataService, 
    
    UsersDataService,
    CategoriesDataService,
    ItemsDataService,
    ModifierGroupsDataService,
    OffersDataService,
    PeripheralsDataService,
    PromotionsDataService,
    TablesDataService,

    CardsDataService,
    ClosedOrdersDataService,
    TrendsDataService,
    ROSEp, 
    OlapEp
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
