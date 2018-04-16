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

import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatSnackBarModule,
  MatButtonToggleModule,
  MatGridListModule,
  MatDialogModule,
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
import { AreYouSureDialogComponent } from '../tabit/ui/dialogs/are-you-sure.component/are-you-sure.component';

import { AuthService } from './auth/auth.service';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';

import { DebugService } from './debug.service';

//feature modules:
import { OrgsModule } from './orgs/orgs.module';
import { OwnersDashboardModule } from './owners-dashboard/owners-dashboard.module';
import { VisibilityService } from '../tabit/utils/visibility.service';
import { OlapMappings } from '../tabit/data/ep/olap.mappings';


// The CLI imports the locale data for you when you use the parameter --locale with ng serve and ng build.
if (environment.tbtLocale==='he-IL') {
  registerLocaleData(localeHe, 'he', localeHeExtra);//https://angular.io/guide/i18n
}

@NgModule({
  entryComponents: [AreYouSureDialogComponent],
  declarations: [
    AreYouSureDialogComponent,
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

    //feature modules:
    OrgsModule,
    OwnersDashboardModule,

    AppRoutingModule,//must be after the feature modules: "Each routing module augments the route configuration in the order of import."

    MatDialogModule,
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
    {//If you use JIT, you also need to define the LOCALE_ID provider in your main module:
      provide: LOCALE_ID,
      useValue: environment.tbtLocale === 'he-IL' ? 'he' : 'en-US'
    },
    AuthService,
    UserGuard,
    OrgGuard,
    DebugService,

    // Utils:
    VisibilityService,

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
    OlapEp,
    OlapMappings
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
