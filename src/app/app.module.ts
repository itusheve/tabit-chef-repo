import { APP_INITIALIZER } from '@angular/core';//https://stackoverflow.com/questions/35191617/how-to-run-a-service-when-the-app-starts-in-angular-2/35191647

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { TokenInterceptor } from './auth/token.interceptor';

import { AsyncLocalStorageModule } from 'angular-async-local-storage';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//required by some material components
import { 
  MatButtonModule, 
  MatIconModule, 
  MatMenuModule, 
  MatCardModule,

  MatAutocompleteModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  
  
  
  
  
  
  
  
  
  

} from '@angular/material';//material modules


import { MomentModule } from 'angular2-moment';

import { ROSEp } from '../tabit/data/ep/ros.ep';
import { OlapEp } from '../tabit/data/ep/olap.ep';
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
    MomentModule,
    BrowserAnimationsModule,
    AsyncLocalStorageModule,
    
    //feature modules:
    OrgsModule,
    OwnersDashboardModule,
    
    AppRoutingModule,//must be after the feature modules: "Each routing module augments the route configuration in the order of import."

    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,


    MatAutocompleteModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    
  
    
    
    
    
    
    
    
    
        
 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthService, 
    {
      provide: APP_INITIALIZER,
      useFactory: (as: AuthService) => function () { return as.authByToken(); },
      deps: [AuthService],
      multi: true
    },
    UserGuard,
    OrgGuard,
    DataService, 
    ROSEp, 
    OlapEp
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
