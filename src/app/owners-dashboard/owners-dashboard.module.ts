import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

import { OwnersDashboardComponent } from './owners-dashboard.component';
import { HomeComponent } from './home/home.component';
// import { HeroDetailComponent } from './hero-detail.component';

// import { HeroService } from './hero.service';

import { MomentModule } from 'angular2-moment';

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

import { CardComponent } from '../ui/card/card.component';

import { OwnersDashboardRoutingModule } from './owners-dashboard-routing.module';

import { 
  MatButtonModule, 
  MatIconModule, 
  MatMenuModule, 
  MatCardModule,
  MatSidenavModule,
  MatSlideToggleModule
} from '@angular/material';//material modules



import { DxButtonModule } from 'devextreme-angular';
import { DxCalendarModule } from 'devextreme-angular';
import { DxChartModule } from 'devextreme-angular';
import { DxPieChartModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';
import { DxLoadIndicatorModule } from 'devextreme-angular';
// import { DxCircularGaugeModule } from 'devextreme-angular';

@NgModule({
  imports: [
    CommonModule,
    // FormsModule,
    OwnersDashboardRoutingModule,
    MomentModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatSidenavModule,
    MatSlideToggleModule,

    DxButtonModule,
    DxCalendarModule,
    DxChartModule,
    DxPieChartModule,
    DxDataGridModule,
    DxLoadIndicatorModule
    // DxCircularGaugeModule,
  ],
  declarations: [
    OwnersDashboardComponent,
    HomeComponent,
    CardComponent,

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
    // HeroDetailComponent
  ],
  //providers: [HeroService]
  providers: []
})
export class OwnersDashboardModule { }
