import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagersDashboardComponent } from './managers-dashboard.component';
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
    ManagersDashboardRoutingModule,

    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    ManagersDashboardComponent
  ],
  providers: [
    ManagersDashboardService
  ]
})
export class ManagersDashboardModule { }
