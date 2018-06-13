import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ManagersDashboardComponent } from './managers-dashboard.component';
import { ManagerDashboardSalesComponent } from './manager-dashboard-sales/manager-dashboard-sales.component';
import { ManagerDashboardDaylyComponent } from './manager-dashboard-dayly/manager-dashboard-dayly.component';

import { ManagersDashboardService } from './managers-dashboard.service';
import { ManagersDashboardRoutingModule } from './managers-dashboard-routing.module';
//import { OrgsRoutingModule } from './orgs-routing.module';

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
    FormsModule,

    ManagersDashboardRoutingModule,

    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    ManagersDashboardComponent,
    ManagerDashboardSalesComponent,
    ManagerDashboardDaylyComponent
  ],
  providers: [
    ManagersDashboardService
  ]
})
export class ManagersDashboardModule { }
