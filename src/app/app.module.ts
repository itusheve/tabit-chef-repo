import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { TokenInterceptor } from './auth/token.interceptor';

import { MomentModule } from 'angular2-moment';

import { ROSEp } from '../tabit/data/ep/ros.ep';
import { OlapEp } from '../tabit/data/ep/olap.ep';
import { DataService } from '../tabit/data/data.service';


import { DxButtonModule } from 'devextreme-angular';
import { DxCalendarModule } from 'devextreme-angular';
import { DxChartModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';
// import { DxCircularGaugeModule } from 'devextreme-angular';




import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';

import { MonthViewComponent } from './month-view/month-view.component';
import { MonthGridComponent } from './month-view/month-grid/month-grid.component';
import { MonthChartComponent } from './month-view/month-chart/month-chart.component';
import { MonthSelectorComponent } from './month-view/month-selector/month-selector.component';
import { CardComponent } from './ui/card/card.component';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth-guard.service';
// import { DshGauge1Component } from './dsh-gauge-1/dsh-gauge-1.component';

@NgModule({
  declarations: [
    AppComponent,
    
    LoginComponent,
    HomeComponent,
    
    MonthViewComponent,
    MonthGridComponent,
    MonthChartComponent,
    MonthSelectorComponent,
    CardComponent,
    // DshGauge1Component,
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    MomentModule,
    DxButtonModule,
    DxCalendarModule,
    DxChartModule,
    DxDataGridModule
    // DxCircularGaugeModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthService, 
    AuthGuard, 
    DataService, 
    ROSEp, 
    OlapEp
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
