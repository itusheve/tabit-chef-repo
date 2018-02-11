import { APP_INITIALIZER, NgModule, LOCALE_ID } from '@angular/core';//https://stackoverflow.com/questions/35191617/how-to-run-a-service-when-the-app-starts-in-angular-2/35191647
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//required by some material components


import { registerLocaleData } from '@angular/common';
import localeHe from '@angular/common/locales/he';
// the second parameter 'fr' is optional
registerLocaleData(localeHe, 'he');//https://angular.io/guide/i18n

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
      useValue: 'he' 
    },
    AuthService, 
    UserGuard,
    OrgGuard,
    DataService, 
    ClosedOrdersDataService,
    TrendsDataService,
    ROSEp, 
    OlapEp
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
