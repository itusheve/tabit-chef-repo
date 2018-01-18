import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { TokenInterceptor } from './auth/token.interceptor';

import { AsyncLocalStorageModule } from 'angular-async-local-storage';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//required by some material components
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';//material modules


import { MomentModule } from 'angular2-moment';

import { ROSEp } from '../tabit/data/ep/ros.ep';
import { OlapEp } from '../tabit/data/ep/olap.ep';
import { DataService } from '../tabit/data/data.service';


import { DxButtonModule } from 'devextreme-angular';
import { DxCalendarModule } from 'devextreme-angular';
import { DxChartModule } from 'devextreme-angular';
import { DxPieChartModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';
// import { DxCircularGaugeModule } from 'devextreme-angular';




import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';

import { OrgsComponent } from './orgs/orgs.component';

import { HomeComponent } from './home/home.component';

import { MonthViewComponent } from './month-view/month-view.component';
import { MonthSelectorComponent } from './month-view/month-selector/month-selector.component';
import { MonthGridComponent } from './month-view/month-grid/month-grid.component';
import { MonthChartComponent } from './month-view/month-chart/month-chart.component';

import { DayViewComponent } from './day-view/day-view.component';
import { DaySelectorComponent } from './day-view/day-selector/day-selector.component';
import { DayPieChartComponent } from './day-view/day-pie-chart/day-pie-chart.component';
import { DaySalesTypeTableComponent } from './day-view/day-sales-type-table/day-sales-type-table.component';
import { DayDinersTableComponent } from './day-view/day-diners-table/day-diners-table.component';
import { DayShiftsComponent } from './day-view/day-shifts/day-shifts.component';
// import { MonthGridComponent } from './month-view/month-grid/month-grid.component';

import { CardComponent } from './ui/card/card.component';

import { AuthService } from './auth/auth.service';
import { UserGuard } from './auth/user-guard.service';
import { OrgGuard } from './auth/org-guard.service';
// import { DshGauge1Component } from './dsh-gauge-1/dsh-gauge-1.component';

@NgModule({
  declarations: [
    AppComponent,
    
    LoginComponent,
    
    OrgsComponent,
    
    HomeComponent,
    
    MonthViewComponent,
    MonthSelectorComponent,
    MonthGridComponent,
    MonthChartComponent,
    
    DayViewComponent,
    DaySelectorComponent,
    DayPieChartComponent,
    DaySalesTypeTableComponent,
    DayDinersTableComponent,
    DayShiftsComponent,

    CardComponent,
    // DshGauge1Component,
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    MomentModule,
    BrowserAnimationsModule,
    AsyncLocalStorageModule,

    MatButtonModule,
    MatIconModule,
    MatMenuModule,

    DxButtonModule,
    DxCalendarModule,
    DxChartModule,
    DxPieChartModule,
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
    UserGuard,
    OrgGuard,
    DataService, 
    ROSEp, 
    OlapEp
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
