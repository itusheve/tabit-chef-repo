import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagersDashboardComponent } from './managers-dashboard.component';
import { ManagersOrgGuard } from '../auth/managers-org-guard.service';

const managersDashboardRoutes: Routes = [
  {
    path: 'managers-dashboard',
    component: ManagersDashboardComponent,
    canActivate: [ManagersOrgGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(managersDashboardRoutes),
  ],
  exports: [
    RouterModule
  ]
})
export class ManagersDashboardRoutingModule { }
