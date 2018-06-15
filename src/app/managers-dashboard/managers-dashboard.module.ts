import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ManagersDashboardComponent } from './managers-dashboard.component';
import { ManagerDashboardSalesComponent, MdsSalesSettingsDialog} from './manager-dashboard-sales/manager-dashboard-sales.component';
import { ManagerDashboardDaylyComponent } from './manager-dashboard-dayly/manager-dashboard-dayly.component';

import { ManagersDashboardService } from './managers-dashboard.service';
import { ManagersDashboardRoutingModule } from './managers-dashboard-routing.module';
import { MDTMPTranslatePipe, MDMapListPipe, MDCurrencyFractionPipe, MDPPOKPIPipe, KPIGoalPipe} from './managers-dashboard.pipes';

import { NgxInitDirective, NgxCollapseDirective } from './managers-dashboard.directives';

import {
  MatNativeDateModule,
  MatDialogModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatIconModule,
  MatButtonModule,
  MatButtonToggleModule
} from '@angular/material';

import { DxDateBoxModule } from 'devextreme-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ManagersDashboardRoutingModule,

    MatNativeDateModule,
    MatDialogModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,

    DxDateBoxModule
  ],
  entryComponents: [MdsSalesSettingsDialog],
  declarations: [
    ManagersDashboardComponent,
    ManagerDashboardSalesComponent,
    MdsSalesSettingsDialog,
    ManagerDashboardDaylyComponent,
    MDTMPTranslatePipe,
    MDMapListPipe,
    MDCurrencyFractionPipe,
    MDPPOKPIPipe,
    KPIGoalPipe,
    NgxInitDirective,
    NgxCollapseDirective
  ],
  providers: [
    ManagersDashboardService
  ]
})
export class ManagersDashboardModule { }
